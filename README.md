# CAD Script Cloud

This project is part of my Master's thesis: **Design and Implementation of a Domain-Specific Language and Tooling for 2D Computer-Aided Design**.

The project includes a web-based IDE for a language called CAD Script. CAD Script is a declarative language for describing 2D geometries, including basic shapes and constraints. You can find more details about the usage of the language [docs](docs/usage.md) or [examples](docs/examples.md)

## Running with docker (recommended)

To try out the Web IDE, I recommend using Docker. You can start a basic local instance with the following command:

```bash
docker compose up
```

This will build the necessary images. The frontend can then be accessed at <http://localhost:3001>, while the backend server will run on port 3000.

## Local development

Requirements:

- Node v20.11.1
- NPM 10.2.4

To run the project locally you need the following steps:

1. Install dependencies with `npm i`
2. Build necessary packages by running `npm run build` in the root folder
3. Start the backend server with `npm run start:solver`
4. Start the frontend in another terminal `npm run start:frontend`

## Documentation

The project is a monorepo that uses NPM's workspace feature. It consists of five packages that together form the application.

### [@cadscript/shared](packages/shared/)

Contains utility functions and TypeScript classes used by other modules.

### [@cadscript/language](packages/language/)

A Langium project that contains the grammar file for CAD Script. This project generates a parser and an LSP server from the grammar file. It also includes validation features and a generator that converts the AST into a JSON intermediate representation.

### [@cadscript/frontend](packages/frontend/)

A React Single-Page Application (SPA) built with Vite. It features a Monaco Editor component and an HTML canvas to create the interface for the Web IDE.

### [@cadscript/solver-service](packages/solver-service/)

A NestJS application responsible for solving the geometric constraints of the documents. It uses [FreeCAD](https://github.com/FreeCAD/FreeCAD)'s Geometric Constraint Solver (GCS) library under the hood.

### [@cadscript/planegcs](packages/planegcs/)

Contains the compiled binaries and JavaScript wrappers for the geometric constraint solver library. It is based on the repository [https://github.com/Salusoft89/planegcs](https://github.com/Salusoft89/planegcs). However, different settings were used to compile the C++ code to WebAssembly, making it compatible with NestJS.
