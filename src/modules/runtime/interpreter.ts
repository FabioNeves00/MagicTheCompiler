import {
  AssignmentExpressionType,
  BinaryExpressionType,
  BooleanValue,
  BuiltInFunctionValue,
  CallExpressionType,
  ExpressionType,
  ForStatementType,
  FunctionDeclarationType,
  FunctionValue,
  IdentifierType,
  IfStatementType,
  MemberExpressionType,
  NumberValue,
  NumericLiteralType,
  ObjectLiteralType,
  ObjectValue,
  ProgramType,
  RuntimeValue,
  StatementType,
  StringLiteralType,
  VariableDeclarationType,
  WhileStatementType,
} from "@app/types";
import Environment from "./environment";
import {
  makeNull,
  makeNumber,
  makeObject,
  makeFunction,
  makeBoolean,
  makeString,
} from "@app/macros";

/**
 * Evaluates a program by evaluating each statement in order.
 * Returns the value of the last evaluated statement.
 */
export function evaluateProgram(
  program: ProgramType,
  env: Environment
): RuntimeValue {
  let lastEvaluatedValue: RuntimeValue = makeNull();
  for (const statement of program.body) {
    lastEvaluatedValue = evaluateStatement(statement, env);
  }
  return lastEvaluatedValue;
}

/**
 * Evaluates a binary expression by evaluating the left and right operands
 * and applying the specified operator.
 * Returns the result of the operation.
 */
function evaluateBinaryExpression(
  expression: BinaryExpressionType,
  env: Environment
): RuntimeValue {
  const left = evaluateStatement(expression.left, env) as NumberValue;
  const right = evaluateStatement(expression.right, env) as NumberValue;

  if (left.type === "number" && right.type === "number") {
    switch (expression.operator) {
      case "+":
        return makeNumber(left.value + right.value);
      case "-":
        return makeNumber(left.value - right.value);
      case "*":
        return makeNumber(left.value * right.value);
      case "/":
        if (right.value === 0) {
          console.error("Cannot divide by zero");
          process.exit(1);
        }
        return makeNumber(left.value / right.value);
      case ">":
        return makeBoolean(left.value > right.value);
      case "<":
        return makeBoolean(left.value < right.value);
      case "==":
        console.log();
      
        return makeBoolean(left.value === right.value);
      case "!=":
        return makeBoolean(left.value !== right.value);
      case ">=":
        return makeBoolean(left.value >= right.value);
      case "<=":
        return makeBoolean(left.value <= right.value);
      default:
        console.error(`Unexpected operator: ${expression.operator}`);
        process.exit(1);
    }
  }

  return makeNull();
}

/**
 * Evaluates an identifier by looking up its value in the environment.
 * Returns the value of the identifier.
 */
export function evaluateIdentifier(
  identifier: IdentifierType,
  env: Environment
): RuntimeValue {
  const value = env.lookupVariable(identifier.symbol);
  return value;
}

/**
 * Evaluates a variable declaration by evaluating the assigned value
 * and storing it in the environment.
 * Returns the value of the variable.
 */
export function evaluateVariableDeclaration(
  declaration: VariableDeclarationType,
  env: Environment
): RuntimeValue {
  const value = declaration.value
    ? evaluateStatement(declaration.value, env)
    : makeNull();
  return env.defineVariable(
    declaration.identifier,
    value,
    declaration.constant
  );
}

/**
 * Evaluates an assignment by evaluating the assigned value
 * and storing it in the environment.
 * Returns the value of the assignment.
 */
export function evaluateAssignment(
  assignment: AssignmentExpressionType,
  env: Environment
): RuntimeValue {
  console.log(assignment);
  if(assignment.assigne.kind !== "Identifier" && assignment.assigne.kind !== "MemberExpression") {
    console.error("Cannot assign to non-identifier");
    process.exit(1);
  }
  const value = evaluateStatement(assignment.value as ExpressionType, env);
  //@ts-ignore
  if(assignment.assigne.kind === "MemberExpression") {
    console.log(assignment.assigne);
    
    const object = evaluateStatement((assignment.assigne as MemberExpressionType).object, env) as ObjectValue;
    const property = (assignment.assigne as MemberExpressionType).property as IdentifierType | StringLiteralType;
    if (property.kind === "Identifier") {
      object.properties.set(property.symbol, evaluateStatement(assignment.value as ExpressionType, env));
    }
    if (property.kind === "StringLiteral") {
      object.properties.set(property.value, evaluateStatement(assignment.value as ExpressionType, env));
    }
    return env.assignVariable(
      ((assignment.assigne as MemberExpressionType).object as IdentifierType).symbol,
      object
    )
  }
  return env.assignVariable(
    (assignment.assigne as IdentifierType).symbol,
    value
  );
}

/**
 * Evaluates an object literal by evaluating each property.
 * Returns the value of the object.
 */
export function evaluateObject(
  object: ObjectLiteralType,
  env: Environment
): RuntimeValue {
  const objectValue = makeObject();
  for (const { key, value } of object.properties) {
    const runtimeValue = !value
      ? env.lookupVariable(key)
      : evaluateStatement(value, env);

    objectValue.properties.set(key, runtimeValue);
  }

  return objectValue;
}

/**
 * Evaluates a call expression by evaluating the callee and each argument.
 * Returns the result of the call.
 */
export function evaluateCall(
  expression: CallExpressionType,
  env: Environment
): RuntimeValue {
  const args = expression.arguments.map((arg) => evaluateStatement(arg, env));
  const functionValue = evaluateStatement(
    expression.caller,
    env
  ) as BuiltInFunctionValue;

  if (functionValue.type === "built-in-function") {
    return functionValue.call(args, env);
  }

  if (functionValue.type === "function") {
    const definedFunction = functionValue as unknown as FunctionValue;
    const scopedEnv = new Environment(undefined, definedFunction.env);
    definedFunction.params.forEach((param, index) => {
      scopedEnv.defineVariable(param, args[index], false);
    });
    return evaluateProgram(
      {
        kind: "Program",
        body: definedFunction.body,
      },
      scopedEnv
    );
  }

  console.error("Cannot call value that is not a function");
  process.exit(1);
}

/**
 * Evaluates a function declaration by creating a function value
 * and storing it in the environment.
 * Returns the value of the function.
 */
export function evaluateFunctionDeclaration(
  declaration: FunctionDeclarationType,
  env: Environment
): RuntimeValue {
  const functionValue = makeFunction(
    declaration.name,
    declaration.params,
    declaration.body,
    env
  );
  return env.defineVariable(declaration.name, functionValue, true);
}

/**
 * Evaluates a while statement by evaluating the condition and body.
 * Returns the value of the last evaluated statement.
 */
export function evaluateWhileStatement(
  statement: WhileStatementType,
  env: Environment
): RuntimeValue {
  let lastEvaluatedValue: RuntimeValue = makeNull();
  while (
    (
      evaluateBinaryExpression(
        statement.condition as BinaryExpressionType,
        env
      ) as BooleanValue
    ).value
  ) {
    for (const bodyStatement of statement.body) {
      lastEvaluatedValue = evaluateStatement(bodyStatement, env);
    }
  }
  return lastEvaluatedValue;
}

/**
 * Evaluates a for statement by evaluating the initial, condition, increment and body.
 * Returns the value of the last evaluated statement.
 */
export function evaluateForStatement(
  statement: ForStatementType,
  env: Environment
): RuntimeValue {
  let lastEvaluatedValue: RuntimeValue = makeNull();
  for (
    evaluateStatement(statement.initial, env);
    (
      evaluateBinaryExpression(
        statement.condition as BinaryExpressionType,
        env
      ) as BooleanValue
    ).value;
    evaluateStatement(statement.increment, env)
  ) {
    for (const bodyStatement of statement.body) {
      lastEvaluatedValue = evaluateStatement(bodyStatement, env);
    }
  }
  return lastEvaluatedValue;
}

/**
 * Evaluates a member expression by evaluating the object and property.
 * Returns the value of the member.
 */
export function evaluateMemberExpression(
  expression: MemberExpressionType,
  env: Environment
): RuntimeValue {
  const object = evaluateStatement(expression.object, env) as ObjectValue;
  const property = expression.property as IdentifierType | StringLiteralType;

  if (property.kind === "Identifier") {
    return object.properties.get(property.symbol) || makeNull();
  }

  if (property.kind === "StringLiteral") {
    return object.properties.get(property.value) || makeNull();
  }

  console.error("Expected identifier or string literal");
  process.exit(1);
}

/**
 * Evaluates a unary expression by evaluating the operand and applying the operator.
 * Returns the result of the operation.
 */
export function evaluateUnaryExpression(
  expression: ExpressionType,
  env: Environment
): RuntimeValue {
  const operand = evaluateStatement(expression, env) as NumberValue;

  if (operand.type === "number") {
    return makeNumber(-operand.value);
  }

  return makeNull();
}

/**
 * Evaluates an if statement by evaluating the condition and body.
 * Returns the value of the last evaluated statement.
 */
export function evaluateIfStatement(
  statement: IfStatementType,
  env: Environment
): RuntimeValue {
  if (
    (
      evaluateBinaryExpression(
        statement.condition as BinaryExpressionType,
        env
      ) as BooleanValue
    ).value
  ) {
    return evaluateProgram(
      {
        kind: "Program",
        body: statement.body,
      },
      env
    );
  }

  if (statement.else) {
    return evaluateProgram(
      {
        kind: "Program",
        body: statement.else,
      },
      env
    );
  }

  return makeNull();
}

/**
 * Evaluates a statement based on its type.
 * Returns the result of the evaluation.
 */
export function evaluateStatement(
  astNode: StatementType,
  env: Environment
): RuntimeValue {
  switch (astNode.kind) {
    case "IfStatement":
      return evaluateIfStatement(astNode as IfStatementType, env);
    case "MemberExpression":
      return evaluateMemberExpression(astNode as MemberExpressionType, env);
    case "NumericLiteral":
      return makeNumber((astNode as NumericLiteralType).value);
    case "StringLiteral":
      return makeString((astNode as StringLiteralType).value);
    case "Identifier":
      return evaluateIdentifier(astNode as IdentifierType, env);
    case "BinaryExpression":
      return evaluateBinaryExpression(astNode as BinaryExpressionType, env);
    case "VariableDeclaration":
      return evaluateVariableDeclaration(
        astNode as VariableDeclarationType,
        env
      );
    case "WhileStatement":
      return evaluateWhileStatement(astNode as WhileStatementType, env);
    case "ForStatement":
      return evaluateForStatement(astNode as ForStatementType, env);
    case "AssignmentExpression":
      return evaluateAssignment(astNode as AssignmentExpressionType, env);
    case "ObjectLiteral":
      return evaluateObject(astNode as ObjectLiteralType, env);
    case "CallExpression":
      return evaluateCall(astNode as CallExpressionType, env);
    case "FunctionDeclaration":
      return evaluateFunctionDeclaration(
        astNode as FunctionDeclarationType,
        env
      );
    default:
      console.error(`Unexpected AST node:\n`, astNode);
      process.exit(1);
  }
}
