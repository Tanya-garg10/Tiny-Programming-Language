'use client';

import { useState } from 'react';
import { Interpreter } from '@/lib/interpreter/interpreter';
import { Play, Copy, Trash2 } from 'lucide-react';

export default function SparkIDE() {
  const [code, setCode] = useState(`# Welcome to Spark Language!
# Example: Print numbers from 1 to 10

for i in range(1, 11):
    print(i)`);

  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedExample, setSelectedExample] = useState('simple');

  const examples: Record<string, string> = {
    simple: `# Welcome to Spark Language!
# Example: Print numbers from 1 to 10

for i in range(1, 11):
    print(i)`,

    fizzbuzz: `# FizzBuzz Problem
# Print numbers 1-100, but:
# - Print "Fizz" for multiples of 3
# - Print "Buzz" for multiples of 5
# - Print "FizzBuzz" for multiples of both

for i in range(1, 101):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)`,

    factorial: `# Calculate factorial using recursion
# Factorial of 5 = 5 * 4 * 3 * 2 * 1 = 120

function factorial(n):
    if n <= 1:
        return 1
    else:
        return n * factorial(n - 1)

print("Factorial of 5:", factorial(5))
print("Factorial of 10:", factorial(10))`,

    fibonacci: `# Generate Fibonacci sequence up to 20 terms
# Each number is sum of previous two numbers

function fibonacci(n):
    if n <= 0:
        return []
    elif n == 1:
        return [1]
    elif n == 2:
        return [1, 1]
    else:
        var fib = [1, 1]
        var i = 2
        while i < n:
            var next = fib[i-1] + fib[i-2]
            fib = fib + [next]
            i = i + 1
        return fib

var result = fibonacci(15)
print("First 15 Fibonacci numbers:", result)`,

    pattern: `# Print a pyramid pattern

function print_pyramid(n):
    var i = 1
    while i <= n:
        var j = 1
        while j <= i:
            print("*", " ")
            j = j + 1
        print()
        i = i + 1

print("Pyramid of height 5:")
print_pyramid(5)`,

    calculator: `# Simple calculator

print("=== Spark Calculator ===")
print()

var x = 15
var y = 3

print("Number 1:", x)
print("Number 2:", y)
print()

print("Addition:", x + y)
print("Subtraction:", x - y)
print("Multiplication:", x * y)
print("Division:", x / y)
print("Power:", x ** 2)
print("Modulo:", x % y)`,
  };

  const runCode = async () => {
    setIsRunning(true);
    try {
      const interpreter = new Interpreter();
      const result = await interpreter.run(code);
      setOutput(result);
    } catch (error) {
      setOutput([`Error: ${(error as Error).message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const clearOutput = () => {
    setOutput([]);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const loadExample = (exampleKey: string) => {
    setCode(examples[exampleKey]);
    setSelectedExample(exampleKey);
    setOutput([]);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4">
        <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
          Spark Language IDE
        </h1>
        <p className="text-slate-400 mt-1">A tiny programming language with Python-like syntax</p>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="flex-1 flex flex-col border-r border-slate-800">
          {/* Editor Toolbar */}
          <div className="flex gap-2 p-4 border-b border-slate-800 bg-slate-900 flex-wrap">
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 rounded font-medium transition"
            >
              <Play className="w-4 h-4" />
              Run Code
            </button>
            <button onClick={copyCode} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded font-medium transition">
              <Copy className="w-4 h-4" />
              Copy
            </button>
            <button onClick={clearOutput} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded font-medium transition">
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>

          {/* Examples Selector */}
          <div className="border-b border-slate-800 bg-slate-900 px-4 py-3">
            <p className="text-sm font-medium text-slate-300 mb-2">Quick Examples:</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(examples).map((key) => (
                <button
                  key={key}
                  onClick={() => loadExample(key)}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    selectedExample === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Code Editor */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 p-4 bg-slate-950 text-slate-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-800"
            placeholder="Write your Spark code here..."
            spellCheck="false"
          />
        </div>

        {/* Right Panel - Output */}
        <div className="w-96 flex flex-col border-l border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-4 py-3">
            <h2 className="font-bold text-lg text-cyan-400">Output</h2>
          </div>

          <div className="flex-1 overflow-auto p-4 font-mono text-sm">
            {output.length === 0 ? (
              <div className="text-slate-500 italic">Click "Run Code" to see output here...</div>
            ) : (
              <div className="space-y-1">
                {output.map((line, idx) => (
                  <div key={idx} className={line.startsWith('Error') ? 'text-red-400' : 'text-green-400'}>
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 px-6 py-3 text-sm text-slate-400">
        <p>Spark Language Interpreter • Built with TypeScript & Next.js</p>
      </footer>
    </div>
  );
}
