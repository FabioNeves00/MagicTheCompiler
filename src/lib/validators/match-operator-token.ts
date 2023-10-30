import { OPERATORS_LIST, TokenType } from "@app/types";

export const matchOperatorToken = (value: string): TokenType =>
  OPERATORS_LIST[value as keyof typeof OPERATORS_LIST];
