// Spark Language Parser - Builds AST from tokens

import { Token, TokenType } from './lexer';
import {
  Program,
  Statement,
  Expression,
  VarDeclaration,
  Assignment,
  PrintStatement,
  IfStatement,
  WhileStatement,
  ForStatement,
  FunctionDeclaration,
  ReturnStatement,
  BreakStatement,
  ContinueStatement,
  ExpressionStatement,
  BinaryOp,
  UnaryOp,
  CallExpression,
  Identifier,
  NumberLiteral,
  StringLiteral,
  BooleanLiteral,
  ArrayLiteral,
  IndexExpression,
} from './ast';

export class ParseError extends Error {
  constructor(message: string, line: number) {
    super(`Parse error at line ${line}: ${message}`);
    this.name = 'ParseError';
  }
}

export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens.filter((t) => t.type !== TokenType.NEWLINE && t.type !== TokenType.INDENT && t.type !== TokenType.DEDENT);
  }

  private peek(): Token {
    return this.tokens[this.current] || { type: TokenType.EOF, value: '', line: 0, column: 0 };
  }

  private peekType(): TokenType {
    return this.peek().type;
  }

  private advance(): Token {
    return this.tokens[this.current++];
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.peekType() === type) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.peekType() === type) {
      return this.advance();
    }
    throw new ParseError(message, this.peek().line);
  }

  parse(): Program {
    const body: Statement[] = [];
    while (this.peekType() !== TokenType.EOF) {
      const stmt = this.statement();
      if (stmt) body.push(stmt);
    }
    return { type: 'Program', body, line: 0 };
  }

  private statement(): Statement | null {
    // Variable declaration
    if (this.peekType() === TokenType.VAR) {
      return this.varDeclaration();
    }

    // Function declaration
    if (this.peekType() === TokenType.FUNCTION) {
      return this.functionDeclaration();
    }

    // If statement
    if (this.peekType() === TokenType.IF) {
      return this.ifStatement();
    }

    // While loop
    if (this.peekType() === TokenType.WHILE) {
      return this.whileStatement();
    }

    // For loop
    if (this.peekType() === TokenType.FOR) {
      return this.forStatement();
    }

    // Print statement
    if (this.peekType() === TokenType.PRINT) {
      return this.printStatement();
    }

    // Return statement
    if (this.peekType() === TokenType.RETURN) {
      return this.returnStatement();
    }

    // Break statement
    if (this.peekType() === TokenType.BREAK) {
      this.advance();
      return { type: 'BreakStatement', line: this.peek().line };
    }

    // Continue statement
    if (this.peekType() === TokenType.CONTINUE) {
      this.advance();
      return { type: 'ContinueStatement', line: this.peek().line };
    }

    // Assignment or expression statement
    return this.expressionStatement();
  }

  private varDeclaration(): VarDeclaration {
    const line = this.peek().line;
    this.consume(TokenType.VAR, 'Expected var');
    const name = this.consume(TokenType.IDENTIFIER, 'Expected variable name').value as string;
    this.consume(TokenType.ASSIGN, 'Expected = in variable declaration');
    const value = this.expression();
    return { type: 'VarDeclaration', name, value, line };
  }

  private functionDeclaration(): FunctionDeclaration {
    const line = this.peek().line;
    this.consume(TokenType.FUNCTION, 'Expected function');
    const name = this.consume(TokenType.IDENTIFIER, 'Expected function name').value as string;
    this.consume(TokenType.LPAREN, 'Expected ( after function name');

    const parameters: string[] = [];
    if (this.peekType() !== TokenType.RPAREN) {
      do {
        parameters.push(this.consume(TokenType.IDENTIFIER, 'Expected parameter name').value as string);
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RPAREN, 'Expected ) after parameters');
    this.consume(TokenType.COLON, 'Expected : after function signature');

    const body = this.block();
    return { type: 'FunctionDeclaration', name, parameters, body, line };
  }

  private ifStatement(): IfStatement {
    const line = this.peek().line;
    this.consume(TokenType.IF, 'Expected if');
    const condition = this.expression();
    this.consume(TokenType.COLON, 'Expected : after if condition');
    const thenBranch = this.block();

    let elseBranch: Statement[] | undefined;
    
    // Handle elif clauses
    while (this.peekType() === TokenType.ELIF) {
      this.advance();
      const elifCondition = this.expression();
      this.consume(TokenType.COLON, 'Expected : after elif condition');
      const elifBody = this.block();
      
      // Convert elif to nested if-else
      const elifStatement: IfStatement = {
        type: 'IfStatement',
        condition: elifCondition,
        thenBranch: elifBody,
        line: this.peek().line,
      };
      
      if (elseBranch === undefined) {
        elseBranch = [elifStatement];
      } else {
        const lastIf = elseBranch[elseBranch.length - 1] as IfStatement;
        lastIf.elseBranch = [elifStatement];
      }
    }
    
    // Handle final else clause
    if (this.peekType() === TokenType.ELSE) {
      this.advance();
      this.consume(TokenType.COLON, 'Expected : after else');
      const finalElse = this.block();
      
      if (elseBranch === undefined) {
        elseBranch = finalElse;
      } else {
        const lastIf = elseBranch[elseBranch.length - 1] as IfStatement;
        lastIf.elseBranch = finalElse;
      }
    }

    return { type: 'IfStatement', condition, thenBranch, elseBranch, line };
  }

  private whileStatement(): WhileStatement {
    const line = this.peek().line;
    this.consume(TokenType.WHILE, 'Expected while');
    const condition = this.expression();
    this.consume(TokenType.COLON, 'Expected : after while condition');
    const body = this.block();
    return { type: 'WhileStatement', condition, body, line };
  }

  private forStatement(): ForStatement {
    const line = this.peek().line;
    this.consume(TokenType.FOR, 'Expected for');
    const variable = this.consume(TokenType.IDENTIFIER, 'Expected variable name').value as string;
    this.consume(TokenType.IN, 'Expected in');
    const iterable = this.expression();
    this.consume(TokenType.COLON, 'Expected : after for clause');
    const body = this.block();
    return { type: 'ForStatement', variable, iterable, body, line };
  }

  private printStatement(): PrintStatement {
    const line = this.peek().line;
    this.consume(TokenType.PRINT, 'Expected print');
    this.consume(TokenType.LPAREN, 'Expected ( after print');

    const args: Expression[] = [];
    if (this.peekType() !== TokenType.RPAREN) {
      do {
        args.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RPAREN, 'Expected ) after print arguments');
    return { type: 'PrintStatement', arguments: args, line };
  }

  private returnStatement(): ReturnStatement {
    const line = this.peek().line;
    this.consume(TokenType.RETURN, 'Expected return');
    let value: Expression | undefined;

    if (this.peekType() !== TokenType.EOF && this.peekType() !== TokenType.DEDENT) {
      value = this.expression();
    }
    return { type: 'ReturnStatement', value, line };
  }

  private block(): Statement[] {
    const statements: Statement[] = [];
    while (this.peekType() !== TokenType.EOF && this.peekType() !== TokenType.ELIF && this.peekType() !== TokenType.ELSE && this.peekType() !== TokenType.DEDENT) {
      const stmt = this.statement();
      if (stmt) statements.push(stmt);
    }
    return statements;
  }

  private expressionStatement(): ExpressionStatement {
    const line = this.peek().line;
    const expr = this.expression();

    // Check if this is an assignment
    if (expr.type === 'Identifier' && this.peekType() === TokenType.ASSIGN) {
      this.advance(); // consume =
      const value = this.expression();
      return {
        type: 'ExpressionStatement',
        expression: {
          type: 'Assignment',
          target: (expr as Identifier).name,
          value,
          line,
        } as any,
        line,
      };
    }

    // Check for indexed assignment (arr[0] = value)
    if (expr.type === 'IndexExpression' && this.peekType() === TokenType.ASSIGN) {
      this.advance();
      const value = this.expression();
      return {
        type: 'ExpressionStatement',
        expression: {
          type: 'Assignment',
          target: expr,
          value,
          line,
        } as any,
        line,
      };
    }

    return { type: 'ExpressionStatement', expression: expr, line };
  }

  private expression(): Expression {
    return this.logicalOr();
  }

  private logicalOr(): Expression {
    let left = this.logicalAnd();

    while (this.peekType() === TokenType.OR) {
      const line = this.peek().line;
      this.advance();
      const right = this.logicalAnd();
      left = { type: 'BinaryOp', left, operator: 'or', right, line } as BinaryOp;
    }

    return left;
  }

  private logicalAnd(): Expression {
    let left = this.comparison();

    while (this.peekType() === TokenType.AND) {
      const line = this.peek().line;
      this.advance();
      const right = this.comparison();
      left = { type: 'BinaryOp', left, operator: 'and', right, line } as BinaryOp;
    }

    return left;
  }

  private comparison(): Expression {
    let left = this.additive();

    while (
      this.peekType() === TokenType.EQ ||
      this.peekType() === TokenType.NE ||
      this.peekType() === TokenType.LT ||
      this.peekType() === TokenType.LE ||
      this.peekType() === TokenType.GT ||
      this.peekType() === TokenType.GE
    ) {
      const line = this.peek().line;
      const op = this.advance();
      const operatorMap: Record<TokenType, string> = {
        [TokenType.EQ]: '==',
        [TokenType.NE]: '!=',
        [TokenType.LT]: '<',
        [TokenType.LE]: '<=',
        [TokenType.GT]: '>',
        [TokenType.GE]: '>=',
      };
      const operator = operatorMap[op.type];
      const right = this.additive();
      left = { type: 'BinaryOp', left, operator, right, line } as BinaryOp;
    }

    return left;
  }

  private additive(): Expression {
    let left = this.multiplicative();

    while (this.peekType() === TokenType.PLUS || this.peekType() === TokenType.MINUS) {
      const line = this.peek().line;
      const op = this.advance();
      const operator = op.type === TokenType.PLUS ? '+' : '-';
      const right = this.multiplicative();
      left = { type: 'BinaryOp', left, operator, right, line } as BinaryOp;
    }

    return left;
  }

  private multiplicative(): Expression {
    let left = this.power();

    while (
      this.peekType() === TokenType.STAR ||
      this.peekType() === TokenType.SLASH ||
      this.peekType() === TokenType.PERCENT
    ) {
      const line = this.peek().line;
      const op = this.advance();
      const operatorMap: Record<TokenType, string> = {
        [TokenType.STAR]: '*',
        [TokenType.SLASH]: '/',
        [TokenType.PERCENT]: '%',
      };
      const operator = operatorMap[op.type];
      const right = this.power();
      left = { type: 'BinaryOp', left, operator, right, line } as BinaryOp;
    }

    return left;
  }

  private power(): Expression {
    let left = this.unary();

    while (this.peekType() === TokenType.POWER) {
      const line = this.peek().line;
      this.advance();
      const right = this.unary();
      left = { type: 'BinaryOp', left, operator: '**', right, line } as BinaryOp;
    }

    return left;
  }

  private unary(): Expression {
    if (this.peekType() === TokenType.NOT) {
      const line = this.peek().line;
      this.advance();
      const operand = this.unary();
      return { type: 'UnaryOp', operator: 'not', operand, line } as UnaryOp;
    }

    if (this.peekType() === TokenType.MINUS) {
      const line = this.peek().line;
      this.advance();
      const operand = this.unary();
      return { type: 'UnaryOp', operator: '-', operand, line } as UnaryOp;
    }

    if (this.peekType() === TokenType.PLUS) {
      const line = this.peek().line;
      this.advance();
      const operand = this.unary();
      return { type: 'UnaryOp', operator: '+', operand, line } as UnaryOp;
    }

    return this.postfix();
  }

  private postfix(): Expression {
    let expr = this.primary();

    while (true) {
      if (this.peekType() === TokenType.LPAREN) {
        const line = this.peek().line;
        this.advance();
        const args: Expression[] = [];
        if (this.peekType() !== TokenType.RPAREN) {
          do {
            args.push(this.expression());
          } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RPAREN, 'Expected ) after function arguments');
        expr = {
          type: 'CallExpression',
          callee: expr as Identifier,
          arguments: args,
          line,
        } as CallExpression;
      } else if (this.peekType() === TokenType.LBRACKET) {
        const line = this.peek().line;
        this.advance();
        const index = this.expression();
        this.consume(TokenType.RBRACKET, 'Expected ] after array index');
        expr = { type: 'IndexExpression', object: expr, index, line } as IndexExpression;
      } else {
        break;
      }
    }

    return expr;
  }

  private primary(): Expression {
    const line = this.peek().line;

    if (this.peekType() === TokenType.NUMBER) {
      const value = this.advance().value as number;
      return { type: 'NumberLiteral', value, line } as NumberLiteral;
    }

    if (this.peekType() === TokenType.STRING) {
      const value = this.advance().value as string;
      return { type: 'StringLiteral', value, line } as StringLiteral;
    }

    if (this.peekType() === TokenType.TRUE) {
      this.advance();
      return { type: 'BooleanLiteral', value: true, line } as BooleanLiteral;
    }

    if (this.peekType() === TokenType.FALSE) {
      this.advance();
      return { type: 'BooleanLiteral', value: false, line } as BooleanLiteral;
    }

    if (this.peekType() === TokenType.IDENTIFIER) {
      const name = this.advance().value as string;
      return { type: 'Identifier', name, line } as Identifier;
    }

    if (this.peekType() === TokenType.LPAREN) {
      this.advance();
      const expr = this.expression();
      this.consume(TokenType.RPAREN, 'Expected ) after expression');
      return expr;
    }

    if (this.peekType() === TokenType.LBRACKET) {
      this.advance();
      const elements: Expression[] = [];
      if (this.peekType() !== TokenType.RBRACKET) {
        do {
          elements.push(this.expression());
        } while (this.match(TokenType.COMMA));
      }
      this.consume(TokenType.RBRACKET, 'Expected ] after array literal');
      return { type: 'ArrayLiteral', elements, line } as ArrayLiteral;
    }

    throw new ParseError(`Unexpected token: ${this.peek().type}`, this.peek().line);
  }
}
