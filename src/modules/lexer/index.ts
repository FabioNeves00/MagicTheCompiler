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

  /**
   * Tokenizes the source code by looping through the source code and checking each character.
   * @returns The tokens.
   */
  public tokenize(): Token[] {
    for (let i = 0; i < this.src.length; i++) {
      const currentChar = this.src[i];
      const nextChar = this.src[i + 1];

      // Check if the current character and the next character form a comment
      if (currentChar === "/" && nextChar === "/") {
        // Skip the rest of the line until a newline character is encountered
        while (this.src[i] !== "\n" && i < this.src.length) {
          i++;
        }
        continue; // Skip to the next iteration of the loop
      }
      switch (true) {
        case Object.keys(OPERATORS_LIST).includes(currentChar + nextChar):
          // Check if the current character and the next character form a double operator
          const double_operator = currentChar + nextChar;
          const double_operatorMatcher = matchOperatorToken(double_operator);
          const double_operatorToken = this.createToken(
            double_operatorMatcher,
            double_operator
          );
          this.tokens.push(double_operatorToken);
          i += 1; // Skip the next character since it has been consumed as part of the double operator
          break;
        case currentChar === '"':
          // Check if the current character is the start of a string
          const string = this.extractString(i + 1);
          const stringToken = this.createToken(TokenTypes.string, string);
          this.tokens.push(stringToken);
          i += string.length + 1; // Skip the characters that make up the string
          break;
        case Object.keys(OPERATORS_LIST).includes(currentChar):
          // Check if the current character is a single operator
          const operator = this.src[i];
          const operatorMatcher = matchOperatorToken(operator);
          const operatorToken = this.createToken(operatorMatcher, operator);
          this.tokens.push(operatorToken);
          break;
        case isAlpha(currentChar):
          // Check if the current character is an alphabetic character
          const identifier = this.extractIdentifier(i);
          const identifierMatcher = matchKeywordToken(identifier);
          const identifierToken = this.createToken(
            identifierMatcher ?? TokenTypes.identifier,
            identifier
          );
          this.tokens.push(identifierToken);
          i += identifier.length - 1; // Skip the characters that make up the identifier
          break;
        case isNumeric(currentChar):
          // Check if the current character is a numeric character
          const number = this.extractNumber(i);
          const numberToken = this.createToken(TokenTypes.number, number);
          this.tokens.push(numberToken);
          i += number.length - 1; // Skip the characters that make up the number
          break;
        case isSkippable(currentChar):
          // Skip the character if it is skippable (e.g., whitespace, newline)
          break;
        default:
          // If the character is not recognized, log an error and exit the process
          console.error("Unknown identifier at: ", currentChar);
          process.exit(1);
      }
    }

    // Push an end-of-file token to mark the end of the source code
    this.tokens.push(this.createToken(TokenTypes.eof, "eof"));

    return this.tokens;
  }

  /**
   * Extracts a string from the source code.
   * @param startIndex The index to start extracting from.
   */
  private extractString(startIndex: number): string {
    let string = "";

    for (let i = startIndex; i < this.src.length; i++) {
      const currentChar = this.src[i];

      if (currentChar === '"') {
        // Break the loop if the closing double quote is found
        break;
      } else {
        // Append the current character to the string
        string += currentChar;
      }
    }

    return string;
  }

  /**
   * Extracts a number from the source code.
   * @param startIndex The index to start extracting from.
   */
  private extractNumber(startIndex: number): string {
    let number = "";

    for (let i = startIndex; i < this.src.length; i++) {
      const currentChar = this.src[i];

      if (isNumeric(currentChar)) {
        // Append the current character to the number if it is numeric
        number += currentChar;
      } else {
        // Break the loop if a non-numeric character is encountered
        break;
      }
    }

    // Return the extracted number
    return number;
  }

  /**
   * Extracts an identifier from the source code.
   * @param startIndex The index to start extracting from.
   */
  private extractIdentifier(startIndex: number): string {
    let identifier = "";

    for (let i = startIndex; i < this.src.length; i++) {
      const currentChar = this.src[i];

      if (isAlpha(currentChar)) {
        // Append the current character to the identifier if it is alphabetic
        identifier += currentChar;
      } else {
        // Break the loop if a non-alphabetic character is encountered
        break;
      }
    }

    // Return the extracted identifier
    return identifier;
  }

  /**
   * Creates a token.
   * @param type The type of the token.
   * @param value The value of the token.
   */
  private createToken(type: TokenType, value: string): Token {
    return {
      type,
      value,
    };
  }
}
