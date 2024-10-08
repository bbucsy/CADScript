# @cadscript/language

The Langium project for the CAD Script language.

## What's in the folder

This folder contains all necessary files for your language extension.

* `package.json` - the manifest file in which you declare your language support.
* `language-configuration.json` - the language configuration used in the VS Code editor, defining the tokens that are used for comments and brackets.
* `src/cad-script.langium` -  the grammar definition of your language.
* `src/language/cad-script-module.ts` - the dependency injection module of your language implementation. Use this to register overridden and added services.
* `src/language/cad-script-validator.ts` - an example validator. You should change it to reflect the semantics of your language.
* `src/feautes/` Added services to the Langium document lifecycle

## Building the application

* Run `npm run langium:generate` to generate TypeScript code from the grammar definition.
* Run `npm run build` to compile all TypeScript code.
