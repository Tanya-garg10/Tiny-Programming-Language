// Spark Language Lexer - Tokenizes source code

export enum TokenType {
  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  IDENTIFIER = 'IDENTIFIER',

  // Keywords
  VAR = 'VAR',
  IF = 'IF',
  ELIF = 'ELIF',
  ELSE = 'ELSE',
  WHILE = 'WHILE',
  FOR = 'FOR',
  IN = 'IN',
  FUNCTION = 'FUNCTION',
  RETURN = 'RETURN',
  PRINT = 'PRINT',
  INPUT = 'INPUT',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
  BREAK = 'BREAK',
  CONTINUE = 'CONTINUE',

  // Operators
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  STAR = 'STAR',
  SLASH = 'SLASH',
  PERCENT = 'PERCENT',
  POWER = 'POWER',
  ASSIGN = 'ASSIGN',
  EQ = 'EQ',
  NE = 'NE',
  LT = 'LT',
  LE = 'LE',
  GT = 'GT',
  GE = 'GE',

  // Delimiters
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',
  COMMA = 'COMMA',
  COLON = 'COLON',
  NEWLINE = 'NEWLINE',
  INDENT = 'INDENT',
  DEDENT = 'DEDENT',

  // Special
  EOF = 'EOF',
  ERROR = 'ERROR',
}

export interface Token {
  type: TokenType;
  value: string | number | boolean;
  line: number;
  column: number;
}

export class Lexer {
  private source: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private indentStack: number[] = [0];
  private tokens: Token[] = [];
  private lineStart: boolean = true;

  private keywords: Map<string, TokenType> = new Map([
    ['var', TokenType.VAR],
    ['if', TokenType.IF],
    ['elif', TokenType.ELIF],
    ['else', TokenType.ELSE],
    ['while', TokenType.WHILE],
    ['for', TokenType.FOR],
    ['in', TokenType.IN],
    ['function', TokenType.FUNCTION],
    ['return', TokenType.RETURN],
    ['print', TokenType.PRINT],
    ['input', TokenType.INPUT],
    ['true', TokenType.TRUE],
    ['false', TokenType.FALSE],
    ['and', TokenType.AND],
    ['or', TokenType.OR],
    ['not', TokenType.NOT],
    ['break', TokenType.BREAK],
    ['continue', TokenType.CONTINUE],
  ]);

  constructor(source: string) {
    this.source = source;
  }

  private current(): string {
    return this.source[this.position] || '';
  }

  private peek(offset: number = 1): string {
    return this.source[this.position + offset] || '';
  }

  private advance(): string {
    const char = this.current();
    this.position++;
    if (char === '\n') {
      this.line++;
      this.column = 1;
      this.lineStart = true;
    } else {
      this.column++;
    }
    return char;
  }

  private skipWhitespace(): void {
    while (this.current() === ' ' || this.current() === '\t') {
      this.advance();
    }
  }

  private skipComment(): void {
    if (this.current() === '#') {
      while (this.current() !== '\n' && this.current() !== '') {
        this.advance();
      }
    }
  }

  private readString(quote: string): string {
    this.advance(); // skip opening quote
    let value = '';
    while (this.current() !== quote && this.current() !== '') {
      if (this.current() === '\\') {
        this.advance();
        const escaped = this.current();
        switch (escaped) {
          case 'n':
            value += '\n';
            break;
          case 't':
            value += '\t';
            break;
          case '\\':
            value += '\\';
            break;
          case quote:
            value += quote;
            break;
          default:
            value += escaped;
        }
        this.advance();
      } else {
        value += this.advance();
      }
    }
    this.advance(); // skip closing quote
    return value;
  }

  private readNumber(): number {
    let value = '';
    while (/[0-9.]/.test(this.current())) {
      value += this.advance();
    }
    return parseFloat(value);
  }

  private readIdentifier(): string {
    let value = '';
    while (/[a-zA-Z0-9_]/.test(this.current())) {
      value += this.advance();
    }
    return value;
  }

  private addToken(type: TokenType, value: string | number | boolean = ''): void {
    this.tokens.push({
      type,
      value,
      line: this.line,
      column: this.column - String(value).length,
    });
  }

  tokenize(): Token[] {
    while (this.position < this.source.length) {
      this.skipWhitespace();

      // Handle indentation at start of line
      if (this.lineStart && this.current() !== '\n' && this.current() !== '' && this.current() !== '#') {
        this.lineStart = false;
        let indentLevel = 0;
        let tempPos = this.position;

        while (tempPos < this.source.length && (this.source[tempPos] === ' ' || this.source[tempPos] === '\t')) {
          indentLevel += this.source[tempPos] === '\t' ? 4 : 1;
          tempPos++;
        }

        // Skip blank lines and comments
        if (this.source[tempPos] === '\n' || this.source[tempPos] === '#') {
          continue;
        }

        const currentIndent = this.indentStack[this.indentStack.length - 1];
        if (indentLevel > currentIndent) {
          this.indentStack.push(indentLevel);
          this.addToken(TokenType.INDENT);
        } else if (indentLevel < currentIndent) {
          while (this.indentStack.length > 1 && this.indentStack[this.indentStack.length - 1] > indentLevel) {
            this.indentStack.pop();
            this.addToken(TokenType.DEDENT);
          }
        }

        // Skip actual spaces
        while (this.position < tempPos) {
          this.advance();
        }
        continue;
      }

      const char = this.current();

      // Comments
      if (char === '#') {
        this.skipComment();
        continue;
      }

      // Newline
      if (char === '\n') {
        this.advance();
        this.lineStart = true;
        // Only add newline if last token isn't already a newline
        if (this.tokens.length > 0 && this.tokens[this.tokens.length - 1].type !== TokenType.NEWLINE) {
          this.addToken(TokenType.NEWLINE);
        }
        continue;
      }

      // Strings
      if (char === '"' || char === "'") {
        const value = this.readString(char);
        this.addToken(TokenType.STRING, value);
        continue;
      }

      // Numbers
      if (/[0-9]/.test(char)) {
        const value = this.readNumber();
        this.addToken(TokenType.NUMBER, value);
        continue;
      }

      // Identifiers and keywords
      if (/[a-zA-Z_]/.test(char)) {
        const identifier = this.readIdentifier();
        const type = this.keywords.get(identifier) || TokenType.IDENTIFIER;
        const value = type === TokenType.TRUE ? true : type === TokenType.FALSE ? false : identifier;
        this.addToken(type, value);
        continue;
      }

      // Two-character operators
      if (char === '=' && this.peek() === '=') {
        this.advance();
        this.advance();
        this.addToken(TokenType.EQ, '==');
        continue;
      }

      if (char === '!' && this.peek() === '=') {
        this.advance();
        this.advance();
        this.addToken(TokenType.NE, '!=');
        continue;
      }

      if (char === '<' && this.peek() === '=') {
        this.advance();
        this.advance();
        this.addToken(TokenType.LE, '<=');
        continue;
      }

      if (char === '>' && this.peek() === '=') {
        this.advance();
        this.advance();
        this.addToken(TokenType.GE, '>=');
        continue;
      }

      if (char === '*' && this.peek() === '*') {
        this.advance();
        this.advance();
        this.addToken(TokenType.POWER, '**');
        continue;
      }

      // Single-character tokens
      switch (char) {
        case '+':
          this.advance();
          this.addToken(TokenType.PLUS, '+');
          break;
        case '-':
          this.advance();
          this.addToken(TokenType.MINUS, '-');
          break;
        case '*':
          this.advance();
          this.addToken(TokenType.STAR, '*');
          break;
        case '/':
          this.advance();
          this.addToken(TokenType.SLASH, '/');
          break;
        case '%':
          this.advance();
          this.addToken(TokenType.PERCENT, '%');
          break;
        case '=':
          this.advance();
          this.addToken(TokenType.ASSIGN, '=');
          break;
        case '<':
          this.advance();
          this.addToken(TokenType.LT, '<');
          break;
        case '>':
          this.advance();
          this.addToken(TokenType.GT, '>');
          break;
        case '(':
          this.advance();
          this.addToken(TokenType.LPAREN, '(');
          break;
        case ')':
          this.advance();
          this.addToken(TokenType.RPAREN, ')');
          break;
        case '[':
          this.advance();
          this.addToken(TokenType.LBRACKET, '[');
          break;
        case ']':
          this.advance();
          this.addToken(TokenType.RBRACKET, ']');
          break;
        case ',':
          this.advance();
          this.addToken(TokenType.COMMA, ',');
          break;
        case ':':
          this.advance();
          this.addToken(TokenType.COLON, ':');
          break;
        default:
          this.advance();
          this.addToken(TokenType.ERROR, char);
      }
    }

    // Add remaining dedents
    while (this.indentStack.length > 1) {
      this.indentStack.pop();
      this.addToken(TokenType.DEDENT);
    }

    this.addToken(TokenType.EOF);
    return this.tokens;
  }
}
