// Spark Language Interpreter - Executes AST

import { Lexer } from './lexer';
import { Parser } from './parser';
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

export class RuntimeError extends Error {
  constructor(message: string, line?: number) {
    super(line ? `Runtime error at line ${line}: ${message}` : `Runtime error: ${message}`);
    this.name = 'RuntimeError';
  }
}

interface SparkFunction {
  params: string[];
  body: Statement[];
  closure: Map<string, any>;
}

class LoopControl extends Error {
  constructor(public controlType: 'break' | 'continue') {
    super();
  }
}

class ReturnValue extends Error {
  constructor(public value: any) {
    super();
  }
}

export class Interpreter {
  private output: string[] = [];
  private globalScope: Map<string, any> = new Map();
  private scope: Map<string, any> = this.globalScope;
  private scopes: Array<Map<string, any>> = [this.globalScope];

  async run(source: string): Promise<string[]> {
    this.output = [];
    this.globalScope = new Map();
    this.scope = this.globalScope;
    this.scopes = [this.globalScope];

    // Add built-in functions
    this.globalScope.set('len', {
      isBuiltin: true,
      call: (arr: any[]) => arr.length,
    });

    this.globalScope.set('range', {
      isBuiltin: true,
      call: (...args: number[]) => {
        if (args.length === 1) {
          return Array.from({ length: args[0] }, (_, i) => i);
        } else if (args.length === 2) {
          return Array.from({ length: args[1] - args[0] }, (_, i) => args[0] + i);
        } else if (args.length === 3) {
          const result = [];
          for (let i = args[0]; i < args[1]; i += args[2]) {
            result.push(i);
          }
          return result;
        }
        return [];
      },
    });

    this.globalScope.set('int', {
      isBuiltin: true,
      call: (val: any) => parseInt(String(val), 10),
    });

    this.globalScope.set('str', {
      isBuiltin: true,
      call: (val: any) => String(val),
    });

    this.globalScope.set('float', {
      isBuiltin: true,
      call: (val: any) => parseFloat(String(val)),
    });

    this.globalScope.set('abs', {
      isBuiltin: true,
      call: (val: number) => Math.abs(val),
    });

    this.globalScope.set('max', {
      isBuiltin: true,
      call: (...args: number[]) => Math.max(...args),
    });

    this.globalScope.set('min', {
      isBuiltin: true,
      call: (...args: number[]) => Math.min(...args),
    });

    this.globalScope.set('sum', {
      isBuiltin: true,
      call: (arr: number[]) => arr.reduce((a, b) => a + b, 0),
    });

    try {
      const lexer = new Lexer(source);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      await this.executeProgram(ast);
    } catch (error) {
      if (error instanceof RuntimeError || error instanceof Error) {
        this.output.push(`Error: ${error.message}`);
      }
    }

    return this.output;
  }

  private executeProgram(program: Program): void {
    for (const statement of program.body) {
      this.executeStatement(statement);
    }
  }

  private executeStatement(stmt: Statement): void {
    switch (stmt.type) {
      case 'VarDeclaration': {
        const decl = stmt as VarDeclaration;
        const value = this.evaluateExpression(decl.value);
        this.scope.set(decl.name, value);
        break;
      }

      case 'FunctionDeclaration': {
        const func = stmt as FunctionDeclaration;
        const sparkFunc: SparkFunction = {
          params: func.parameters,
          body: func.body,
          closure: new Map(this.scope),
        };
        this.scope.set(func.name, sparkFunc);
        break;
      }

      case 'ExpressionStatement': {
        const exprStmt = stmt as ExpressionStatement;
        if (exprStmt.expression.type === 'Assignment') {
          const assign = exprStmt.expression as any;
          const value = this.evaluateExpression(assign.value);

          if (typeof assign.target === 'string') {
            this.scope.set(assign.target, value);
          } else {
            const indexExpr = assign.target as IndexExpression;
            const obj = this.evaluateExpression(indexExpr.object);
            const idx = this.evaluateExpression(indexExpr.index);
            if (Array.isArray(obj)) {
              obj[idx] = value;
            } else {
              throw new RuntimeError('Cannot index non-array', stmt.line);
            }
          }
        } else {
          this.evaluateExpression(exprStmt.expression);
        }
        break;
      }

      case 'PrintStatement': {
        const printStmt = stmt as PrintStatement;
        const values = printStmt.arguments.map((arg) => this.evaluateExpression(arg));
        const output = values.map((v) => this.valueToString(v)).join(' ');
        this.output.push(output);
        break;
      }

      case 'IfStatement': {
        const ifStmt = stmt as IfStatement;
        const condition = this.evaluateExpression(ifStmt.condition);
        if (this.isTruthy(condition)) {
          for (const stmt of ifStmt.thenBranch) {
            this.executeStatement(stmt);
          }
        } else if (ifStmt.elseBranch) {
          for (const stmt of ifStmt.elseBranch) {
            this.executeStatement(stmt);
          }
        }
        break;
      }

      case 'WhileStatement': {
        const whileStmt = stmt as WhileStatement;
        while (this.isTruthy(this.evaluateExpression(whileStmt.condition))) {
          try {
            for (const stmt of whileStmt.body) {
              this.executeStatement(stmt);
            }
          } catch (e) {
            if (e instanceof LoopControl) {
              if (e.controlType === 'break') {
                break;
              } else if (e.controlType === 'continue') {
                continue;
              }
            } else {
              throw e;
            }
          }
        }
        break;
      }

      case 'ForStatement': {
        const forStmt = stmt as ForStatement;
        const iterable = this.evaluateExpression(forStmt.iterable);
        if (!Array.isArray(iterable)) {
          throw new RuntimeError('For loop requires an iterable', stmt.line);
        }

        for (const item of iterable) {
          this.scope.set(forStmt.variable, item);
          try {
            for (const stmt of forStmt.body) {
              this.executeStatement(stmt);
            }
          } catch (e) {
            if (e instanceof LoopControl) {
              if (e.controlType === 'break') {
                break;
              } else if (e.controlType === 'continue') {
                continue;
              }
            } else {
              throw e;
            }
          }
        }
        break;
      }

      case 'ReturnStatement': {
        const retStmt = stmt as ReturnStatement;
        const value = retStmt.value ? this.evaluateExpression(retStmt.value) : null;
        throw new ReturnValue(value);
      }

      case 'BreakStatement': {
        throw new LoopControl('break');
      }

      case 'ContinueStatement': {
        throw new LoopControl('continue');
      }
    }
  }

  private evaluateExpression(expr: Expression): any {
    switch (expr.type) {
      case 'NumberLiteral':
        return (expr as NumberLiteral).value;

      case 'StringLiteral':
        return (expr as StringLiteral).value;

      case 'BooleanLiteral':
        return (expr as BooleanLiteral).value;

      case 'Identifier': {
        const id = expr as Identifier;
        const value = this.scope.get(id.name);
        if (value === undefined) {
          throw new RuntimeError(`Undefined variable: ${id.name}`, expr.line);
        }
        return value;
      }

      case 'ArrayLiteral': {
        const arr = expr as ArrayLiteral;
        return arr.elements.map((el) => this.evaluateExpression(el));
      }

      case 'IndexExpression': {
        const idx = expr as IndexExpression;
        const obj = this.evaluateExpression(idx.object);
        const index = this.evaluateExpression(idx.index);
        if (Array.isArray(obj)) {
          return obj[index];
        } else if (typeof obj === 'string') {
          return obj[index];
        }
        throw new RuntimeError('Cannot index non-indexable type', expr.line);
      }

      case 'BinaryOp': {
        const binOp = expr as BinaryOp;
        const left = this.evaluateExpression(binOp.left);
        const right = this.evaluateExpression(binOp.right);

        switch (binOp.operator) {
          case '+':
            // Handle array concatenation
            if (Array.isArray(left) && Array.isArray(right)) {
              return [...left, ...right];
            }
            return left + right;
          case '-':
            return left - right;
          case '*':
            return left * right;
          case '/':
            if (right === 0) throw new RuntimeError('Division by zero', expr.line);
            return left / right;
          case '%':
            return left % right;
          case '**':
            return Math.pow(left, right);
          case '<':
            return left < right;
          case '<=':
            return left <= right;
          case '>':
            return left > right;
          case '>=':
            return left >= right;
          case '==':
            return left === right;
          case '!=':
            return left !== right;
          case 'and':
            return this.isTruthy(left) && this.isTruthy(right);
          case 'or':
            return this.isTruthy(left) || this.isTruthy(right);
          default:
            throw new RuntimeError(`Unknown operator: ${binOp.operator}`, expr.line);
        }
      }

      case 'UnaryOp': {
        const unOp = expr as UnaryOp;
        const operand = this.evaluateExpression(unOp.operand);

        switch (unOp.operator) {
          case '-':
            return -operand;
          case '+':
            return +operand;
          case 'not':
            return !this.isTruthy(operand);
          default:
            throw new RuntimeError(`Unknown unary operator: ${unOp.operator}`, expr.line);
        }
      }

      case 'CallExpression': {
        const call = expr as CallExpression;
        const func = this.scope.get(call.callee.name);

        if (!func) {
          throw new RuntimeError(`Undefined function: ${call.callee.name}`, expr.line);
        }

        const args = call.arguments.map((arg) => this.evaluateExpression(arg));

        if (func.isBuiltin) {
          return func.call(...args);
        } else if (func.params && func.body) {
          if (args.length !== func.params.length) {
            throw new RuntimeError(
              `Function ${call.callee.name} expects ${func.params.length} arguments, got ${args.length}`,
              expr.line
            );
          }

          // Create new scope for function
          const newScope = new Map(func.closure);
          for (let i = 0; i < func.params.length; i++) {
            newScope.set(func.params[i], args[i]);
          }

          const prevScope = this.scope;
          this.scope = newScope;

          try {
            for (const stmt of func.body) {
              this.executeStatement(stmt);
            }
            return null;
          } catch (e) {
            if (e instanceof ReturnValue) {
              return e.value;
            }
            throw e;
          } finally {
            this.scope = prevScope;
          }
        }

        throw new RuntimeError(`${call.callee.name} is not callable`, expr.line);
      }

      default:
        throw new RuntimeError(`Unknown expression type: ${(expr as any).type}`, expr.line);
    }
  }

  private isTruthy(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value !== '';
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  private valueToString(value: any): string {
    if (value === null) return 'null';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return `[${value.map((v) => this.valueToString(v)).join(', ')}]`;
    return String(value);
  }
}
