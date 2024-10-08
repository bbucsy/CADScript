# CAD Script Cloud

This is the project for my Master's thesis: **Design and Implementation of a Domain-Specific Language and tooling for 2D Computer-Aided Design**

The project contains a web based IDE for a language called CAD Script.
It is a declarative language for describing 2D geometries, with basic shapes and constraints. The usage of the language can be found [here](docs/usage.md)

## Running with docker (recommended)

To try out the Web IDE I recommend using Docker. A basic local instance can be started with

```bash
docker compose up
```

It will build the necessary images. The frontend then can be accessed at [http://localhost:3001](http://localhost:3001). The backend server will run on port 3000.

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

The project is a monorepo that uses NPM's workspace feature. There are 5 packages that make up the application.

### [@cadscript/shared](packages/shared/)

Contains utility functions and TypeScript classes used by other modules

### [@cadscript/language](packages/language/)

A Langium project containing the grammar file for CAD Script. The langium project generates a parser and an LSP server from the grammar file. It also contains validations and a generator, that converts the AST into an  JSON intermediate representation.

### [@cadscript/frontend](packages/frontend/)

A React SPA built with Vite. It uses a Monaco Editor component and HTML canvas to create an IDE web application.

### [@cadscript/solver-service](packages/solver-service/)

A NestJS application that handles solving the geometric constraints of the documents. It uses [FreeCAD](https://github.com/FreeCAD/FreeCAD)'s GCS library under the hood.

### [@cadscript/planegcs](packages/planegcs/)

Contains the compiled binaries and javascript wrappers of the actual geometric cosntraint solver library. It is based on this repository [https://github.com/Salusoft89/planegcs](https://github.com/Salusoft89/planegcs). But different settings were used for compiling the c++ code to WebAssembly, to make it compatible with NestJS.
