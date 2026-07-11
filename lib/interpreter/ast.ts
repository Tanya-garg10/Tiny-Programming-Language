// Abstract Syntax Tree node definitions

export interface ASTNode {
  type: string;
  line: number;
}

// Expressions
export interface NumberLiteral extends ASTNode {
  type: 'NumberLiteral';
  value: number;
}

export interface StringLiteral extends ASTNode {
  type: 'StringLiteral';
  value: string;
}

export interface BooleanLiteral extends ASTNode {
  type: 'BooleanLiteral';
  value: boolean;
}

export interface Identifier extends ASTNode {
  type: 'Identifier';
  name: string;
}

export interface BinaryOp extends ASTNode {
  type: 'BinaryOp';
  left: Expression;
  operator: string;
  right: Expression;
}

export interface UnaryOp extends ASTNode {
  type: 'UnaryOp';
  operator: string;
  operand: Expression;
}

export interface CallExpression extends ASTNode {
  type: 'CallExpression';
  callee: Identifier;
  arguments: Expression[];
}

export interface ArrayLiteral extends ASTNode {
  type: 'ArrayLiteral';
  elements: Expression[];
}

export interface IndexExpression extends ASTNode {
  type: 'IndexExpression';
  object: Expression;
  index: Expression;
}

export type Expression =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | Identifier
  | BinaryOp
  | UnaryOp
  | CallExpression
  | ArrayLiteral
  | IndexExpression;

// Statements
export interface VarDeclaration extends ASTNode {
  type: 'VarDeclaration';
  name: string;
  value: Expression;
}

export interface Assignment extends ASTNode {
  type: 'Assignment';
  target: string | IndexExpression;
  value: Expression;
}

export interface PrintStatement extends ASTNode {
  type: 'PrintStatement';
  arguments: Expression[];
}

export interface IfStatement extends ASTNode {
  type: 'IfStatement';
  condition: Expression;
  thenBranch: Statement[];
  elseBranch?: Statement[];
}

export interface WhileStatement extends ASTNode {
  type: 'WhileStatement';
  condition: Expression;
  body: Statement[];
}

export interface ForStatement extends ASTNode {
  type: 'ForStatement';
  variable: string;
  iterable: Expression;
  body: Statement[];
}

export interface FunctionDeclaration extends ASTNode {
  type: 'FunctionDeclaration';
  name: string;
  parameters: string[];
  body: Statement[];
}

export interface ReturnStatement extends ASTNode {
  type: 'ReturnStatement';
  value?: Expression;
}

export interface BreakStatement extends ASTNode {
  type: 'BreakStatement';
}

export interface ContinueStatement extends ASTNode {
  type: 'ContinueStatement';
}

export interface ExpressionStatement extends ASTNode {
  type: 'ExpressionStatement';
  expression: Expression;
}

export type Statement =
  | VarDeclaration
  | Assignment
  | PrintStatement
  | IfStatement
  | WhileStatement
  | ForStatement
  | FunctionDeclaration
  | ReturnStatement
  | BreakStatement
  | ContinueStatement
  | ExpressionStatement;

export interface Program extends ASTNode {
  type: 'Program';
  body: Statement[];
}
