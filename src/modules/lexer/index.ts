import { OPERATORS_LIST, Token, TokenType, TokenTypes } from "@app/types";
import {
  isAlpha,
  isNumeric,
  isSkippable,
  matchKeywordToken,
  matchOperatorToken,
} from "@app/validators";

export class Lexer {
  constructor(
    private readonly src: string,
    private readonly tokens: Token[] = []
  ) {}

  public tokenize(): Token[] {
    for (let i = 0; i < this.src.length; i++) {
      const currentChar = this.src[i];
      const nextChar = this.src[i + 1];
      switch (true) {
        case Object.keys(OPERATORS_LIST).includes(currentChar + nextChar):
          const double_operator = currentChar + nextChar;
          const double_operatorMatcher = matchOperatorToken(double_operator);
          const double_operatorToken = this.createToken(double_operatorMatcher, double_operator);
          this.tokens.push(double_operatorToken);
          i += 1;
          break;
        case currentChar === '"':
          const string = this.extractString(i + 1);
          const stringToken = this.createToken(TokenTypes.string, string);
          this.tokens.push(stringToken);
          i += string.length + 1;
          break;
        case Object.keys(OPERATORS_LIST).includes(currentChar):
          const operator = this.src[i];
          const operatorMatcher = matchOperatorToken(operator);
          const operatorToken = this.createToken(operatorMatcher, operator);
          this.tokens.push(operatorToken);
          break;

        case isNumeric(currentChar):
          const number = this.extractNumber(i);
          const numberToken = this.createToken(TokenTypes.number, number);
          this.tokens.push(numberToken);
          i += number.length - 1;
          break;

        case isAlpha(currentChar):
          const identifier = this.extractIdentifier(i);
          const keywordMatcher = matchKeywordToken(identifier);
          const tokenType = keywordMatcher ?? TokenTypes.identifier;
          const identifierToken = this.createToken(tokenType, identifier);
          this.tokens.push(identifierToken);
          i += identifier.length - 1;
          break;

        case isSkippable(currentChar):
          break;

        default:
          console.error("Unknown identifier at: ", currentChar);
          process.exit(1);
      }
    }

    this.tokens.push(this.createToken(TokenTypes.eof, "eof"));

    return this.tokens;
  }

  private extractArray(startIndex: number): string {
    let array = "[";

    for (let i = startIndex; i < this.src.length; i++) {
      const currentChar = this.src[i];

      if (currentChar === "]") {
        break;
      } else {
        array += currentChar;
      }
    }
    array += "]";
    return array;
  }

  private extractString(startIndex: number): string {
    let string = "";

    for (let i = startIndex; i < this.src.length; i++) {
      const currentChar = this.src[i];

      if (currentChar === '"') {
        break;
      } else {
        string += currentChar;
      }
    }

    return string;
  }

  private extractNumber(startIndex: number): string {
    let number = "";

    for (let i = startIndex; i < this.src.length; i++) {
      const currentChar = this.src[i];

      if (isNumeric(currentChar)) {
        number += currentChar;
      } else {
        break;
      }
    }

    return number;
  }

  private extractIdentifier(startIndex: number): string {
    let identifier = "";

    for (let i = startIndex; i < this.src.length; i++) {
      const currentChar = this.src[i];

      if (isAlpha(currentChar)) {
        identifier += currentChar;
      } else {
        break;
      }
    }

    return identifier;
  }

  private createToken(type: TokenType, value: string = ""): Token {
    return {
      type,
      value,
    };
  }
}
