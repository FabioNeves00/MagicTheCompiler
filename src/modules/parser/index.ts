import {
  BinaryExpressionType,
  IdentifierType,
  ProgramType,
  StatementType,
  Token,
  TokenType,
  TokenTypes,
  VariableDeclarationType,
  ExpressionType,
  AssignmentExpressionType,
  NumericLiteralType,
  PropertyLiteralType,
  ObjectLiteralType,
  CallExpressionType,
  MemberExpressionType,
  FunctionDeclarationType,
  WhileStatementType,
  ForStatementType,
  StringLiteralType,
  IfStatementType,
} from "@app/types";
import { Lexer } from "../lexer";

export class Parser {
  private tokens: Token[] = [];

  /**
   * Determines if the parsing is complete and the END OF FILE Is reached.
   */
  private isNotEOF(): boolean {
    return this.tokens[0].type !== TokenTypes.eof;
  }

  /**
   * Returns the currently available token
   */
  private get token() {
    return this.tokens[0] as Token;
  }

  /**
   * Returns the previous token and then advances the tokens array to the next value.
   */
  private get nextToken() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  private eat() {
    this.tokens.shift();
  }

  /**
   * Returns the previous token and then advances the tokens array to the next value.
   *  Also checks the type of expected token and throws if the values dnot match.
   */
  private expect(type: TokenType, err: any) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type !== type) {
      console.error("Parser Error: ", err, prev, " - Expecting: ", type);
      process.exit(1);
    }

    return prev;
  }

  public generateAbstractSyntaxTree(sourceCode: string): ProgramType {
    this.tokens = new Lexer(sourceCode).tokenize();
    const program: ProgramType = {
      kind: "Program",
      body: [],
    };

    // Parse until end of file
    while (this.isNotEOF()) {
      program.body.push(this.parseStatment());
    }

    return program;
  }

  // Handle complex statement types
  private parseStatment(): StatementType {
    // skip to parseExpression
    switch (this.token.type) {
      case TokenTypes.may:
        return this.parseIfStatement();
      case TokenTypes.cast:
      case TokenTypes.choose:
        return this.parseVariableDeclaration();
      case TokenTypes.tap:
        return this.parseFunctionDeclaration();
      case TokenTypes.storm:
        return this.parseForLoop();
      case TokenTypes.control:
        return this.parseWhileLoop();
      default:
        return this.parseExpression();
    }
  }

  /**
    * Parse if statement with the following syntax
    ```
    may (condition) {
      // body
    } [or {
      // else body
    }]
    ```
   */
  parseIfStatement(): StatementType {
    this.eat(); // eat the may token
    this.expect(
      TokenTypes["("],
      "Expected opening brace after control statement."
    );
    const condition = this.parseCondition();
    this.expect(
      TokenTypes[")"],
      "Expected closing brace after control statement."
    );
    this.expect(
      TokenTypes["{"],
      "Expected opening brace after control statement."
    );
    const body = this.parseBody();
    this.expect(
      TokenTypes["}"],
      "Expected closing brace after control statement."
    );

    const ifStatement = {
      kind: "IfStatement",
      condition,
      body,
    } as IfStatementType;

    if (this.token.type === TokenTypes.or) {
      this.eat(); // eat the or token
      this.expect(
        TokenTypes["{"],
        "Expected opening brace after control statement."
      );
      const elseBody = this.parseBody();
      this.expect(
        TokenTypes["}"],
        "Expected closing brace after control statement."
      );
      ifStatement.else = elseBody;
    }

    return ifStatement;
  }

  /**
    * Parse for loop with the following syntax
    ```
    storm (initial; condition; increment) {
      // body
    }
    ```
   */
  private parseForLoop(): StatementType {
    this.eat(); // eat the control token
    this.expect(
      TokenTypes["("],
      "Expected opening brace after control statement."
    );
    const initial =
      this.token.type === TokenTypes.identifier
        ? this.parseAssignment()
        : this.parseVariableDeclaration();
    const condition = this.parseCondition();
    this.expect(
      TokenTypes[";"],
      "Expected semicolon after condition in for loop."
    );
    const increment = this.parseExpression();
    this.expect(
      TokenTypes[")"],
      "Expected closing brace after control statement."
    );
    this.expect(
      TokenTypes["{"],
      "Expected opening brace after control statement."
    );
    const body = this.parseBody();
    this.expect(
      TokenTypes["}"],
      "Expected closing brace after control statement."
    );

    return {
      kind: "ForStatement",
      initial,
      condition,
      increment,
      body,
    } as ForStatementType;
  }

  /**
    * Parse while loop with the following syntax
    ```
    control (condition) {
      // body
    }
    ```
   */
  private parseWhileLoop(): StatementType {
    this.eat(); // eat the control token
    this.expect(
      TokenTypes["("],
      "Expected opening brace after control statement."
    );
    const condition = this.parseCondition();
    this.expect(
      TokenTypes[")"],
      "Expected closing brace after control statement."
    );
    this.expect(
      TokenTypes["{"],
      "Expected opening brace after control statement."
    );
    const body = this.parseBody();
    this.expect(
      TokenTypes["}"],
      "Expected closing brace after control statement."
    );
    return {
      kind: "WhileStatement",
      condition,
      body,
    } as WhileStatementType;
  }

  /**
    * Parse function declaration with the following syntax
    ```
    tap functionName(...args) {
      // body
    }
    ```
    To return a value from the function, only needs to end its implementation with a literal or variable
    ```
    tap functionName(...args) {
      "Hello World"
    }

    tap functionName(...args) {
      choose x = "Hello World";
      x
    ```
   */
  parseFunctionDeclaration(): StatementType {
    this.eat(); // eat the tap token
    const name = this.expect(
      TokenTypes.identifier,
      "Expected identifier name following tap keyword."
    ).value;
    const args = this.parseArguments();
    const params = args.map((arg) => {
      if (arg.kind !== "Identifier") {
        console.error(
          "Function arguments must be identifiers. Found: ",
          arg.kind
        );
        process.exit(1);
      }
      return (arg as IdentifierType).symbol;
    });
    this.expect(
      TokenTypes["{"],
      "Expected opening brace after function declaration."
    );
    const body: StatementType[] = this.parseBody();

    this.expect(
      TokenTypes["}"],
      "Expected closing brace after function declaration."
    );

    return {
      kind: "FunctionDeclaration",
      name,
      params,
      body,
    } as FunctionDeclarationType;
  }

  private parseBody(): StatementType[] {
    const body: StatementType[] = [];
    while (this.token.type !== TokenTypes["}"] && this.isNotEOF()) {
      body.push(this.parseStatment());
    }

    return body;
  }

  /**
    * Parse variable declaration with the following syntax
    ```
    cast variableName = value;
    ```
    or
    ```
    choose variableName = value;
    ```
    or
    ```
    cast variableName;
    ```
   */
  parseVariableDeclaration(): StatementType {
    const isConstant = this.nextToken.type == TokenTypes.choose;
    const identifier = this.expect(
      TokenTypes.identifier,
      "Expected identifier name following (cast | choose) keywords."
    ).value;

    if (this.token.type === TokenTypes[";"]) {
      this.nextToken; // expect semicolon
      if (isConstant) {
        console.error(
          "Must assigne value to constant expression. No value provided."
        );
        process.exit(1);
      }

      return {
        kind: "VariableDeclaration",
        identifier,
        constant: false,
      } as VariableDeclarationType;
    }

    this.expect(
      TokenTypes["="],
      "Expected equals token following identifier in var declaration."
    );

    const declaration = {
      kind: "VariableDeclaration",
      value: this.parseExpression(),
      identifier,
      constant: isConstant,
    } as VariableDeclarationType;

    this.expect(
      TokenTypes[";"],
      "Variable declaration statment must end with semicolon."
    );

    return declaration;
  }

  // Handle expressions
  private parseExpression(): ExpressionType {
    return this.parseAssignment();
  }

  /**
    * Parse assignment expression with the following syntax
    ```
    variableName = value;
    ```
   */
  parseAssignment(): ExpressionType {
    const left = this.parseObject(); // switch this out with objectExpr

    if (this.token.type === TokenTypes["="]) {
      this.nextToken; // advance past equals
      const value = this.parseAssignment();
      return {
        value,
        assigne: left,
        kind: "AssignmentExpression",
      } as AssignmentExpressionType;
    }

    return left;
  }

  parseObject(): ExpressionType {
    if (this.token.type !== TokenTypes["{"]) {
      return this.parseAddition();
    }
    this.eat(); // eat the left brace
    const properties: PropertyLiteralType[] = [];
    //@ts-ignore
    while (this.token.type !== TokenTypes["}"]) {
      const key = this.expect(
        TokenTypes.identifier,
        "Expected identifier as key in object literal."
      ).value;
      //@ts-ignore
      if (this.token.type === TokenTypes[","]) {
        this.eat(); // eat the[","]
        properties.push({
          kind: "PropertyLiteral",
          key,
        });
        continue;
        //@ts-ignore
      } else if (this.token.type === TokenTypes["}"]) {
        properties.push({
          kind: "PropertyLiteral",
          key,
        });
        continue;
      }

      this.expect(TokenTypes[":"], "Expected colon after object literal key.");
      const value = this.parseExpression();
      properties.push({
        kind: "PropertyLiteral",
        key,
        value,
      });
      //@ts-ignore
      if (this.token.type !== TokenTypes["}"]) {
        this.expect(
          TokenTypes[","],
          "Expected comma after object literal value."
        );
      }
    }
    this.expect(
      TokenTypes["}"],
      "Expected closing brace after object literal."
    );
    return {
      kind: "ObjectLiteral",
      properties,
    } as ObjectLiteralType;
  }

  /**
    * Parse condition expression with the following syntax
    ```
    value < value
    value > value
    value <= value
    value >= value
    value == value
    value != value
    ```
   */
  parseCondition(): ExpressionType {
    let left = this.parseAddition();

    while (["<", ">", "<=", ">=", "==", "!="].includes(this.token.value)) {
      const operator = this.nextToken.value;
      const right = this.parseAddition();
      left = {
        kind: "BinaryExpression",
        left,
        right,
        operator,
      } as BinaryExpressionType;
    }

    return left;
  }

  /**
    * Parse addition expression with the following syntax
    ```
    value + value
    value - value
    ```
   */
  parseAddition(): ExpressionType {
    let left = this.parseMultiplication();

    while (["+", "-"].includes(this.token.value)) {
      const operator = this.nextToken.value;
      const right = this.parseMultiplication();
      left = {
        kind: "BinaryExpression",
        left,
        right,
        operator,
      } as BinaryExpressionType;
    }

    if (["<", ">", "<=", ">=", "==", "!="].includes(this.token.value)) {
      const operator = this.nextToken.value;
      const right = this.parseAddition();
      left = {
        kind: "BinaryExpression",
        left,
        right,
        operator,
      } as BinaryExpressionType;
    }

    return left;
  }

  /**
    * Parse multiplication expression with the following syntax
    ```
    value * value
    value / value
    ```
   */
  private parseMultiplication(): ExpressionType {
    let left = this.parseCallMember();

    while (["*", "/"].includes(this.token.value)) {
      const operator = this.nextToken.value;
      const right = this.parseCallMember();
      left = {
        kind: "BinaryExpression",
        left,
        right,
        operator,
      } as BinaryExpressionType;
    }

    return left;
  }

  /**
    * Parse call expression with the following syntax
    ```
    functionName(...args)
    ```
   */
  parseCallMember(): ExpressionType {
    const member = this.parseMember();

    if (this.token.type === TokenTypes["("]) {
      return this.parseCall(member);
    }

    return member;
  }

  parseCall(caller: ExpressionType): ExpressionType {
    let callExpression: ExpressionType = {
      kind: "CallExpression",
      caller,
      arguments: this.parseArguments(),
    } as CallExpressionType;

    if (this.token.type === TokenTypes["("]) {
      callExpression = this.parseCall(callExpression);
    }

    return callExpression;
  }

  parseArguments(): ExpressionType[] {
    this.expect(
      TokenTypes["("],
      "Expected opening parenthesis before argument list."
    );
    const args =
      this.token.type === TokenTypes[")"] ? [] : this.parseArgumentList();

    this.expect(
      TokenTypes[")"],
      "Expected closing parenthesis after argument list."
    );
    return args;
  }

  parseArgumentList(): ExpressionType[] {
    const args = [this.parseAssignment()];
    while (this.token.type === TokenTypes[","] && this.nextToken) {
      args.push(this.parseAssignment());
    }

    return args;
  }

  parseMember(): ExpressionType {
    let object = this.parsePrimaryExpression();

    while (
      this.token.type == TokenTypes["."] ||
      this.token.type == TokenTypes["["]
    ) {
      const operator = this.nextToken;
      let property: ExpressionType;
      let computed: boolean;

      // non-computed values aka obj.expr
      if (operator.type == TokenTypes["."]) {
        computed = false;
        // get identifier
        property = this.parsePrimaryExpression();
        if (property.kind != "Identifier") {
          throw `Cannot use dot operator without right hand side being a identifier`;
        }
      } else {
        // this allows obj[computedValue]
        computed = true;
        property = this.parseExpression();
        this.expect(
          TokenTypes["]"],
          "Missing closing bracket in computed value."
        );
      }

      object = {
        kind: "MemberExpression",
        object,
        property,
        computed,
      } as MemberExpressionType;
    }

    return object;
  }

  // Orders Of Prescidence
  // Assignment
  // Object
  // AdditiveExpr
  // MultiplicitaveExpr
  // Call
  // Member
  // PrimaryExpr

  // Handle simple expression types
  private parsePrimaryExpression(): ExpressionType {
    // Determine which token we are currently at and return literal value
    
    switch (this.token.type) {
      // User defined values.
      case TokenTypes.identifier:
        return {
          kind: "Identifier",
          symbol: this.nextToken.value,
        } as IdentifierType;

      // Constants and Numeric Constants
      case TokenTypes.number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.nextToken.value),
        } as NumericLiteralType;
      case TokenTypes.string:
        return {
          kind: "StringLiteral",
          value: this.nextToken.value,
        } as StringLiteralType;
      // Grouping Expressions
      case TokenTypes["("]:
        this.nextToken; // eat the opening paren
        const value = this.parseExpression();
        this.expect(
          TokenTypes[")"],
          "Unexpected token found inside parenthesised expression. Expected closing parenthesis."
        ); // closing paren
        return value;
      // Unidentified Tokens and Invalid Code Reached
      case TokenTypes["+="]: 
      case TokenTypes["-="]:
        this.eat()
        return {
          kind: "BinaryExpression",
          left: {
            kind: "Identifier",
            symbol: this.nextToken.value,
          } as IdentifierType,
          right: this.parseExpression(),
          operator: this.token.value,
        } as BinaryExpressionType;
      default:
        throw new Error(
          `Unexpected token found during parsing! ${JSON.stringify(this.token)}`
        );
    }
  }
}
