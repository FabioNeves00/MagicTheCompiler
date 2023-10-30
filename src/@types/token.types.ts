export const KEYWORD_LIST = {
  tap: "tap", // function
  cast: "cast", // let
  choose: "choose", // const
  storm: "storm", // for()
  control: "control", // while()
  may: "may", // if()
  untapped: "untapped", // false
  tapped: "tapped", // true
  or: "or", // else()
} as const;

export const NATIVE_FUNCTIONS = {
  reveal: "reveal", // print()
  exile: "exile", // exit()
  sacrifice: "sacrifice", // deassign
  match: "match", // regex
  shuffle: "shuffle", // sort
  count: "count", // length
} as const;

export const OPERATORS_LIST = {
  "(": "LEFT_PAREN",
  ")": "RIGHT_PAREN",
  "{": "LEFT_BRACE",
  "}": "RIGHT_BRACE",
  "[": "LEFT_BRACKETS",
  "]": "RIGHT_BRACKETS",
  ";": "SEMICOLON",
  ":": "COLON",
  ".": "DOT",
  ",": "COMMA",
  "==": "EQUAL_EQUAL",
  "X=": "STAR_EQUAL",
  "/=": "SLASH_EQUAL",
  "+=": "PLUS_EQUAL",
  "-=": "MINUS_EQUAL",
  "!=": "NEGATIVE_EQUAL",
  ">=": "GREATER_EQUAL",
  "<=": "LESS_EQUAL",
  "=": "EQUAL",
  "+": "OPERATOR",
  "-": "OPERATOR",
  "*": "OPERATOR",
  "/": "OPERATOR",
  ">": "OPERATOR",
  "<": "OPERATOR",
} as const;

export const NativeTypes = {
  number: "number",
  string: "string",
  boolean: "boolean",
  null: "null",
  function: "function",
  identifier: "identifier",
  eof: "eof",
  array: "array",
} as const;

export type TokenType =
  | (typeof KEYWORD_LIST)[keyof typeof KEYWORD_LIST]
  | (typeof NATIVE_FUNCTIONS)[keyof typeof NATIVE_FUNCTIONS]
  | (typeof OPERATORS_LIST)[keyof typeof OPERATORS_LIST]
  | (typeof NativeTypes)[keyof typeof NativeTypes];

export const TokenTypes = {
  ...KEYWORD_LIST,
  ...NATIVE_FUNCTIONS,
  ...OPERATORS_LIST,
  ...NativeTypes,
} as const;

export type Token = {
  type: TokenType;
  value: string;
};