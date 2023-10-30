import { KEYWORD_LIST, TokenType } from "@app/types";

export const matchKeywordToken = (value: string): TokenType | undefined =>
  KEYWORD_LIST[value as keyof typeof KEYWORD_LIST];
