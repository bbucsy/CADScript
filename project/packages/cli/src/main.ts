#!/bin/env node

import { CadScriptLanguageMetaData, createCadScriptServices, type Model } from 'cad-script/lib/lib.js'
import chalk from 'chalk'
import { Command } from 'commander'
import { extractAstNode, extractDocument } from './cli-util.js'
import { writeJSON } from './generators/json.js'
import { NodeFileSystem } from 'langium/node'
import { SketchWriter } from './generators/SketchWriter.js'

export const expandAction = async (fileName: string, opts: ExpandOptions): Promise<void> => {
	const services = createCadScriptServices(NodeFileSystem).CadScript
	const model = await extractAstNode<Model>(fileName, services)
	const expanded = services.modelBuilder.modelExpander.expandModel(model)
	const sketchWriter = new SketchWriter(expanded, fileName, opts.destination, opts.trace)
	const generatedFilePath = sketchWriter.writeSketchToFile()
	console.log(chalk.green(`Expanded sketch generated successfully: ${generatedFilePath}`))
}

export const jsonAction = async (fileName: string, opts: JSONOptions): Promise<void> => {
	const services = createCadScriptServices(NodeFileSystem).CadScript
	const document = await extractDocument(fileName, services)

	const parseResult = document.parseResult
	if (parseResult.lexerErrors.length === 0 && parseResult.parserErrors.length === 0) {
		console.log(chalk.green(`Parsed and validated ${fileName} successfully!`))

		// convert json
		const model = parseResult.value as Model
		const simpleModel = services.modelBuilder.modelExpander.expandModel(model)
		const generatedFilePath = writeJSON(simpleModel, fileName, opts.destination)
		console.log(chalk.green(`Expanded sketch generated successfully: ${generatedFilePath}`))
	} else {
		console.log(chalk.red(`Failed to parse and validate ${fileName}!`))
	}
}

export const solveAction = async (fileName: string): Promise<void> => {
	console.log(chalk.yellow('Cannot run solver. Solver decupling from language server is under development'))
}

export type JSONOptions = {
	destination?: string
}

export type ExpandOptions = {
	destination?: string
	trace: boolean
}

const program = new Command()

program
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	.version('0.0.2')

const fileExtensions = CadScriptLanguageMetaData.fileExtensions.join(', ')
program
	.command('expand')
	.argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
	.option('-d, --destination <dir>', 'destination directory of generating')
	.option('-t, --trace', 'Generate trace comments', false)
	.description('Generates an expanded version of the input Sketch file.')
	.action(expandAction)

program
	.command('json')
	.argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
	.option('-d, --destination <dir>', 'destination directory of generating')
	.description('Generates an expanded version of the input Sketch file in a Simplified form')
	.action(jsonAction)

program
	.command('solve')
	.argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
	.description('Tries to solve model constraints with SolveSpace library')
	.action(solveAction)

program.parse(process.argv)