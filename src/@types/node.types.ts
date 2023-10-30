export type NodeType = 
  | "Program" 
  | "VariableDeclaration"
  | "NumericLiteral" 
  | "StringLiteral"
  | "Identifier" 
  | "PropertyLiteral"
  | "ObjectLiteral"
  | "MemberExpression"
  | "WhileStatement"
  | "ForStatement"
  | "IfStatement"
  | "BinaryExpression" 
  | "AssignmentExpression"
  | "CallExpression" 
  | "FunctionDeclaration"

export type StatementType = {
  kind: NodeType;
}

export type ProgramType = StatementType & {
  kind: "Program";
  body: Array<StatementType>;
}

export type NumericLiteralType = ExpressionType & {
  kind: "NumericLiteral";
  value: number;
}

export type ObjectLiteralType = ExpressionType & {
  kind: "ObjectLiteral";
  properties: PropertyLiteralType[];
}

export type PropertyLiteralType = ExpressionType & {
  kind: "PropertyLiteral";
  key: string;
  value?: ExpressionType 
}

export type VariableDeclarationType = StatementType & {
  kind: "VariableDeclaration";
  constant: boolean;
  identifier: string;
  value?: ExpressionType;
}

export type FunctionDeclarationType = StatementType & {
  kind: "FunctionDeclaration";
  params: string[];
  name: string;
  body: StatementType[];
}

export type IdentifierType = StatementType & {
  kind: "Identifier";
  symbol: string;
}

export type ExpressionType = StatementType & {}

export type BinaryExpressionType = ExpressionType & {
  kind: "BinaryExpression";
  operator: string;
  left: ExpressionType;
  right: ExpressionType;
}

export type AssignmentExpressionType = ExpressionType & {
  kind: "AssignmentExpression";
  assigne: ExpressionType;
  value?: ExpressionType;
}

export type MemberExpressionType = ExpressionType & {
  kind: "MemberExpression";
  object: ExpressionType;
  property: ExpressionType;
  computed: boolean;
}

export type CallExpressionType = ExpressionType & {
  kind: "CallExpression";
  arguments: ExpressionType[];
  caller: ExpressionType;
}

export type WhileStatementType = ExpressionType & {
  kind: "WhileStatement";
  condition: ExpressionType;
  body: StatementType[];
}

export type ForStatementType = ExpressionType & {
  kind: "ForStatement";
  initial: ExpressionType;
  condition: ExpressionType;
  increment: ExpressionType;
  body: StatementType[];
}

export type IfStatementType = ExpressionType & {
  kind: "IfStatement";
  condition: ExpressionType;
  body: StatementType[];
  else?: StatementType[];
}

export type StringLiteralType = ExpressionType & {
  kind: "StringLiteral";
  value: string;
}
