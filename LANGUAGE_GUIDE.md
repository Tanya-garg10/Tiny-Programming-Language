# Spark Language - Complete Guide

## Table of Contents

1. [Syntax Overview](#syntax-overview)
2. [Data Types](#data-types)
3. [Variables](#variables)
4. [Operators](#operators)
5. [Control Flow](#control-flow)
6. [Functions](#functions)
7. [Arrays](#arrays)
8. [Built-in Functions](#built-in-functions)
9. [Scope and Closures](#scope-and-closures)
10. [Common Patterns](#common-patterns)

## Syntax Overview

Spark uses Python-like syntax with key differences:

- **Indentation**: Defines code blocks (whitespace matters!)
- **Colons**: Mark the start of code blocks
- **Comments**: Start with `#`
- **Statements**: Generally one per line

```spark
# This is a comment
var x = 10
if x > 5:
    print("x is greater than 5")
```

## Data Types

Spark has four main data types:

### Numbers

Both integers and floats are supported:

```spark
var integer = 42
var decimal = 3.14159
var negative = -100
```

### Strings

Text enclosed in single or double quotes:

```spark
var message = "Hello, World!"
var name = 'Alice'
var empty = ""
```

String concatenation uses `+`:

```spark
var greeting = "Hello, " + "Bob"
print(greeting)  # Hello, Bob
```

### Booleans

`true` and `false` values:

```spark
var isActive = true
var isPaused = false
```

### Arrays

Ordered collections of values:

```spark
var numbers = [1, 2, 3, 4, 5]
var mixed = [1, "hello", 3.14, true]
var empty = []
```

## Variables

### Declaration

Variables are declared with the `var` keyword:

```spark
var name = "Spark"
var age = 5
var score = 98.5
var active = true
```

### Variable Names

- Start with a letter or underscore
- Can contain letters, numbers, and underscores
- Case-sensitive

```spark
var firstName = "John"
var _private = 100
var CONSTANT = 42
var name1 = "First"
var name2 = "Second"
```

### Scope

Variables have function scope. Inner scopes can access outer scopes:

```spark
var global = "global scope"

function test():
    var local = "local scope"
    print(global)  # Can access global
    print(local)   # Can access local

test()
print(local)  # Error: local is not defined
```

## Operators

### Arithmetic Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `+` | Addition | `5 + 3` → 8 |
| `-` | Subtraction | `5 - 3` → 2 |
| `*` | Multiplication | `5 * 3` → 15 |
| `/` | Division | `6 / 2` → 3 |
| `%` | Modulo (remainder) | `7 % 3` → 1 |
| `**` | Power/Exponentiation | `2 ** 3` → 8 |

### Comparison Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `==` | Equal to | `5 == 5` → true |
| `!=` | Not equal to | `5 != 3` → true |
| `<` | Less than | `3 < 5` → true |
| `<=` | Less than or equal | `5 <= 5` → true |
| `>` | Greater than | `5 > 3` → true |
| `>=` | Greater than or equal | `5 >= 5` → true |

### Logical Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `and` | Logical AND | `true and false` → false |
| `or` | Logical OR | `true or false` → true |
| `not` | Logical NOT | `not true` → false |

### Operator Precedence

From highest to lowest:

1. `**` (exponentiation)
2. `-`, `+` (unary minus/plus)
3. `*`, `/`, `%` (multiplication, division, modulo)
4. `+`, `-` (addition, subtraction)
5. `<`, `<=`, `>`, `>=`, `==`, `!=`
6. `and`
7. `or`

## Control Flow

### If Statement

```spark
if condition:
    # code executes if condition is true
```

### If-Else Statement

```spark
if condition:
    # code executes if condition is true
else:
    # code executes if condition is false
```

### If-Elif-Else Statement

```spark
if score >= 90:
    print("A")
elif score >= 80:
    print("B")
elif score >= 70:
    print("C")
else:
    print("F")
```

### While Loop

```spark
var count = 0
while count < 5:
    print(count)
    count = count + 1
```

With `break` and `continue`:

```spark
while true:
    var input = "test"
    if input == "quit":
        break  # Exit loop
    if input == "":
        continue  # Skip to next iteration
    print(input)
```

### For Loop

Loop over a range:

```spark
for i in range(5):  # 0, 1, 2, 3, 4
    print(i)

for i in range(1, 5):  # 1, 2, 3, 4
    print(i)

for i in range(0, 10, 2):  # 0, 2, 4, 6, 8
    print(i)
```

Loop over an array:

```spark
var numbers = [10, 20, 30]
for num in numbers:
    print(num)
```

### Break and Continue

```spark
for i in range(10):
    if i == 2:
        continue  # Skip this iteration
    if i == 7:
        break     # Exit loop
    print(i)
```

## Functions

### Function Declaration

```spark
function greet():
    print("Hello!")

greet()  # Call the function
```

### Parameters

```spark
function add(a, b):
    var result = a + b
    print(result)

add(5, 3)  # Output: 8
```

### Return Values

```spark
function multiply(a, b):
    return a * b

var result = multiply(4, 5)
print(result)  # 20
```

### Recursion

```spark
function factorial(n):
    if n <= 1:
        return 1
    else:
        return n * factorial(n - 1)

print(factorial(5))  # 120
```

### Function Scope

```spark
var x = 10

function test():
    var x = 20
    print(x)  # Prints 20 (local variable)

test()
print(x)  # Prints 10 (global variable)
```

## Arrays

### Creating Arrays

```spark
var empty = []
var numbers = [1, 2, 3, 4, 5]
var mixed = [1, "hello", 3.14, true]
```

### Accessing Elements

```spark
var arr = [10, 20, 30, 40]
print(arr[0])  # 10
print(arr[2])  # 30
print(arr[3])  # 40
```

### Modifying Elements

```spark
var arr = [1, 2, 3]
arr[1] = 20
print(arr)  # [1, 20, 3]
```

### Array Concatenation

```spark
var arr1 = [1, 2]
var arr2 = [3, 4]
var combined = arr1 + arr2
print(combined)  # [1, 2, 3, 4]
```

### Length

```spark
var arr = [1, 2, 3]
print(len(arr))  # 3
```

### Iteration

```spark
var arr = [10, 20, 30]
for item in arr:
    print(item)
```

## Built-in Functions

### len(array)

Returns the length of an array:

```spark
var arr = [1, 2, 3]
print(len(arr))  # 3
```

### range(n) / range(start, end) / range(start, end, step)

Generates a range of numbers:

```spark
print(range(3))          # [0, 1, 2]
print(range(1, 4))       # [1, 2, 3]
print(range(0, 10, 2))   # [0, 2, 4, 6, 8]
```

### int(value)

Converts to integer:

```spark
print(int("42"))     # 42
print(int(3.99))     # 3
```

### str(value)

Converts to string:

```spark
print(str(42))       # "42"
print(str(3.14))     # "3.14"
```

### float(value)

Converts to float:

```spark
print(float("3.14"))  # 3.14
print(float(42))      # 42.0
```

### abs(number)

Returns absolute value:

```spark
print(abs(-5))       # 5
print(abs(3.14))     # 3.14
```

### max(...numbers)

Returns maximum value:

```spark
print(max(1, 5, 3))  # 5
```

### min(...numbers)

Returns minimum value:

```spark
print(min(1, 5, 3))  # 1
```

### sum(array)

Returns sum of array elements:

```spark
print(sum([1, 2, 3]))  # 6
```

## Scope and Closures

### Global Scope

```spark
var global = "I'm global"

function printGlobal():
    print(global)

printGlobal()  # I'm global
```

### Local Scope

```spark
function test():
    var local = "I'm local"
    print(local)  # Works

test()
print(local)  # Error: local is not defined
```

### Closure Example

```spark
function makeCounter():
    var count = 0
    function increment():
        count = count + 1
        return count
    return increment

var counter = makeCounter()
print(counter())  # 1
print(counter())  # 2
print(counter())  # 3
```

## Common Patterns

### Counting

```spark
var count = 0
for i in range(10):
    count = count + 1
print("Total:", count)
```

### Accumulation

```spark
var sum = 0
for num in [1, 2, 3, 4, 5]:
    sum = sum + num
print("Sum:", sum)  # 15
```

### Filtering (using conditionals)

```spark
var numbers = [1, 2, 3, 4, 5]
for num in numbers:
    if num > 2:
        print(num)
```

### Searching

```spark
var arr = [10, 20, 30, 40]
var found = false
for item in arr:
    if item == 30:
        found = true
        break

print("Found:", found)
```

### Nested Loops

```spark
for i in range(3):
    for j in range(3):
        print(i, j)
```

### Conditional Assignment

```spark
var x = 10
var result = "big"
if x < 5:
    result = "small"
print(result)
```

**For more examples and interactive learning, visit the Spark IDE!**
