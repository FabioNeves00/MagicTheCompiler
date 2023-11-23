# Magic The Compiler

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/compile.ts "filepath.mtg"
```

This project was created using `bun init` in bun v1.0.1. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Syntax

The Magic The Compiler supports the following syntax:

### Comments

To declare comments, use `//` at any point, jumping a line ends the comment.
```
// This is an example
reveal("Hello World")
```

### Variables

To declare a variable, use the `cast` for a mutable variable and `choose` for a immutable variable keyword followed by the variable name and an optional initial value
```
cast w;
cast x = 10;
choose y = 5;
x = y
reveal(x)
```

Supports `strings`, `numbers`, `objects` and `booleans`.

### Functions

To declare a function, use the `tap` keyword followed by the function name and its parameters</br>
p.s: you don\`t need to use a `return` keyword to return a value from the function
```
tap sum(x, y) {
  x + y
}

sum(10, 10)
```

### Loops

To declare a loop, use the `control` for while loops and `storm` for for loops

```
cast i = 0;

control(i < 10) {
  reveal(i)
  i += 1
}

i = 0;

storm(i < 10; i += 1) {
  reveal(i)
}
```

### Conditionals

To declare a condition you can use the `may` and `or` keywords with a conditional expression inside the may statement
```
may(10 > 0) {
  reveal("True")
} or {
  reveal("False")
}
```


### Operations

Magic the compiler supports all of the arithmetic and comparison operations:</br>
Sum, Subtraction, Multiplication, Division, Deeply Equal, Greater (or equal) than, Less (or equal) than, Deeply Different</br>
```
cast x = 10;
cast y = 11;

reveal(x == 10)
reveal(y != 10)
reveal(x >= 10)
reveal(x <= 10)
reveal(x > y)
reveal(x < y)
reveal(x + 10)
reveal(x - 10)
reveal(x * 10)
reveal(x / 10)
```

### Native functions

Magic the compiler has built in functions like:</br>
`reveal`(...args) -> Prints all the arguments of the function</br>
`exile`() -> Ends process</br>
`sacrifice`(variable) -> Deassign variables</br>
`match`(regex, string) -> match string against regex</br>
`shuffle`(variable) -> shuffles the string value of a variable</br>
`count`(variable) -> counts the number of characters in a string variable</br>

```
cast x = "sad";
cast y = "sad";
reveal("hello", "world")
sacrifice(x)
match("/[0-9]/", "hello")
shuffle(y)
count(y)
```


# Full code example:

```
tap calcFatorial(numero) {
  may(numero > 0) {
    numero * calcFatorial(numero - 1)
  } or {
    1
  }
}

cast object = {
  power: calcFatorial(8)
};

reveal(object.power)
```
