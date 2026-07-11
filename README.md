# Spark Language Interpreter

A tiny, educational programming language with Python-like syntax and a web-based IDE. Learn how interpreters work by building programs in Spark!

## 🎯 Features

- **Python-like Syntax**: Familiar, readable code with indentation-based blocks
- **Core Language Features**:
  - Variables and assignments
  - Arithmetic operations (+, -, *, /, %, **)
  - Logical operators (and, or, not)
  - Comparison operators (==, !=, <, <=, >, >=)
  - Conditional statements (if/elif/else)
  - Loops (for, while) with break/continue support
  - Function declarations and recursive calls
  - Arrays/lists with indexing
  - Comments (#)
  - Print and input statements

- **Web-Based IDE**: Split-view editor with live code execution
- **Built-in Functions**: len(), range(), int(), str(), float(), abs(), max(), min(), sum()
- **Real-time Output**: See execution results instantly

## 🚀 Getting Started

### Local Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Open http://localhost:3000
```

### Deployment

Deploy to Vercel with one click:

```bash
vercel deploy
```

## 📚 Language Guide

### Variables

```spark
var name = "Spark"
var count = 42
var pi = 3.14159
```

### Arithmetic

```spark
var sum = 10 + 5
var product = 4 * 3
var power = 2 ** 8        # 256
var remainder = 17 % 5    # 2
var quotient = 20 / 4     # 5
```

### Strings

```spark
var greeting = "Hello, " + "World!"
var length = len(greeting)
var first_char = greeting[0]
```

### Arrays

```spark
var numbers = [1, 2, 3, 4, 5]
var first = numbers[0]
var second = numbers[1]
var combined = [1, 2] + [3, 4]  # [1, 2, 3, 4]
```

### Conditionals

```spark
if x > 10:
    print("Large number")
elif x > 5:
    print("Medium number")
else:
    print("Small number")
```

### Loops

#### For Loop

```spark
for i in range(1, 6):
    print(i)  # Prints 1, 2, 3, 4, 5

for item in [10, 20, 30]:
    print(item)
```

#### While Loop

```spark
var count = 0
while count < 5:
    print(count)
    count = count + 1
```

#### Loop Control

```spark
for i in range(1, 11):
    if i == 5:
        break      # Exit loop
    if i == 3:
        continue   # Skip to next iteration
    print(i)
```

### Functions

```spark
function greet(name):
    print("Hello, " + name)

greet("Alice")

function factorial(n):
    if n <= 1:
        return 1
    else:
        return n * factorial(n - 1)

print(factorial(5))  # 120
```

### Comments

```spark
# This is a comment
var x = 5  # Inline comment
```

### Print Statement

```spark
print("Hello")
print(42)
print(3.14)
print(x, y, z)  # Multiple values
```

## 📋 Example Programs

### 1. FizzBuzz

```spark
for i in range(1, 101):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)
```

### 2. Factorial (Recursive)

```spark
function factorial(n):
    if n <= 1:
        return 1
    else:
        return n * factorial(n - 1)

print("Factorial of 5:", factorial(5))
print("Factorial of 10:", factorial(10))
```

### 3. Fibonacci Sequence

```spark
function fibonacci(n):
    var fib = [1, 1]
    var i = 2
    while i < n:
        var next = fib[i-1] + fib[i-2]
        var fib = fib + [next]
        i = i + 1
    return fib

var result = fibonacci(10)
print("First 10 Fibonacci numbers:", result)
```

### 4. Number Pattern

```spark
for i in range(1, 6):
    for j in range(1, i + 1):
        print("*", " ")
    print()
```

### 5. Simple Calculator

```spark
var x = 15
var y = 3

print("Addition:", x + y)
print("Subtraction:", x - y)
print("Multiplication:", x * y)
print("Division:", x / y)
print("Power:", x ** 2)
print("Modulo:", x % y)
```

## 🏗️ Architecture

### Interpreter Components

**Lexer** (`lib/interpreter/lexer.ts`)
- Tokenizes source code
- Handles indentation-based blocks
- Recognizes keywords, operators, and literals

**Parser** (`lib/interpreter/parser.ts`)
- Builds Abstract Syntax Tree (AST)
- Implements recursive descent parsing
- Handles operator precedence

**Interpreter** (`lib/interpreter/interpreter.ts`)
- Executes AST nodes
- Manages variable scopes
- Handles function calls and recursion
- Provides built-in functions

**IDE** (`components/spark-ide.tsx`)
- React component for the web interface
- Code editor and output display
- Quick example selector
- Real-time execution

### Data Flow

```
Source Code → Lexer → Tokens → Parser → AST → Interpreter → Output
```

## 🔧 Technology Stack

- **Frontend**: React 19, TypeScript, Next.js 16, Tailwind CSS
- **Interpreter**: Pure TypeScript (no external dependencies)
- **IDE**: Web-based with dark theme
- **Deployment**: Vercel

## 🐛 Known Limitations

- No module system
- No class definitions or OOP
- Limited string manipulation
- No native async/await
- No file I/O
- No regular expressions

## 📖 File Structure

```
spark-language-interpreter/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   └── spark-ide.tsx       # IDE component
├── lib/
│   └── interpreter/
│       ├── lexer.ts        # Lexical analyzer
│       ├── parser.ts       # Parser
│       ├── ast.ts          # AST definitions
│       └── interpreter.ts  # Execution engine
├── package.json
├── tsconfig.json
└── README.md
```

## 🎓 Learning Resources

This project demonstrates:
- Lexical analysis (tokenization)
- Parsing and AST construction
- Tree-walking interpreter pattern
- Scope management and closures
- Recursive function calls

## 🤝 Contributing

This is an educational project. Feel free to fork and extend it!

Possible enhancements:
- Array methods (map, filter, reduce)
- String methods (slice, replace, split)
- More built-in functions
- Better error messages
- Debugger integration
- Performance optimizations

**Built with ❤️ as an educational programming language project**
