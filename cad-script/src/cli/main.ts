import type { Model } from '../language/generated/ast.js'
import chalk from 'chalk'
import { Command } from 'commander'
import { CadScriptLanguageMetaData } from '../language/generated/module.js'
import { createCadScriptServices } from '../language/cad-script-module.js'
import { extractAstNode, extractDocument } from './cli-util.js'
import { expandSketch, writeJSON } from './generator.js'
import { NodeFileSystem } from 'langium/node'

export const expandAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
	const services = createCadScriptServices(NodeFileSystem).CadScript
	const model = await extractAstNode<Model>(fileName, services)
	const expanded = services.modelBuilder.SimpleModelBuilder.buildSimpleModel(model)
	console.log(JSON.stringify(expanded))
	const generatedFilePath = expandSketch(model, fileName, opts.destination)
	console.log(chalk.green(`Expanded sketch generated successfully: ${generatedFilePath}`))
}

export const jsonAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
	const services = createCadScriptServices(NodeFileSystem).CadScript
	const document = await extractDocument(fileName, services)

	const parseResult = document.parseResult
	if (parseResult.lexerErrors.length === 0 && parseResult.parserErrors.length === 0) {
		console.log(chalk.green(`Parsed and validated ${fileName} successfully!`))

		// convert json
		const model = parseResult.value as Model
		const simpleModel = services.modelBuilder.SimpleModelBuilder.buildSimpleModel(model)
		const generatedFilePath = writeJSON(simpleModel, fileName, opts.destination)
		console.log(chalk.green(`Expanded sketch generated successfully: ${generatedFilePath}`))
	} else {
		console.log(chalk.red(`Failed to parse and validate ${fileName}!`))
	}
}

export type GenerateOptions = {
	destination?: string
}

const program = new Command()

program
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	.version('0.0.1')

const fileExtensions = CadScriptLanguageMetaData.fileExtensions.join(', ')
program
	.command('expand')
	.argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
	.option('-d, --destination <dir>', 'destination directory of generating')
	.description('Generates an expanded version of the input Sketch file.')
	.action(expandAction)

program
	.command('json')
	.argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
	.option('-d, --destination <dir>', 'destination directory of generating')
	.description('Generates an expanded version of the input Sketch file in a Simplified form')
	.action(jsonAction)

program.parse(process.argv)
