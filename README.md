# Lobster

Interactive C++ program visualization tools.

## Setup

Install Node.js and npm, then install the project dependencies:

```console
npm install
```

## Build

Lobster is written in TypeScript. Recompile and bundle after changing `.ts` files:

```console
npm run build
```

If you change `other/grammar.txt`, regenerate the parser and rebuild:

```console
./node_modules/pegjs/bin/pegjs --plugin ./node_modules/ts-pegjs/src/tspegjs --allowed-start-rules start,declaration,declarator,function_definition -o src/js/parse/cpp_parser.ts other/grammar.txt
```

## Local preview

After building, open `public/index.html` to try the editor, compiler, and program visualizer.

## Helpful links

An easy-to-navigate copy of the C++ language standard:
https://timsong-cpp.github.io/cppwp
