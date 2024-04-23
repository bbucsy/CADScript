import { DocumentState, EmptyFileSystem } from 'langium'
import {
	BrowserMessageReader,
	BrowserMessageWriter,
	createConnection,
	NotificationType
} from 'vscode-languageserver/browser.js'
import { Model, createCadScriptServices } from 'cad-script/lib/lib'
import { startLanguageServer } from 'langium/lsp'
import { Diagnostic } from 'vscode'
// your services & module name may differ based on your language's name

// @ts-ignore
declare const self: DedicatedWorkerGlobalScope

/* browser specific setup code */
const messageReader = new BrowserMessageReader(self)
const messageWriter = new BrowserMessageWriter(self)

const connection = createConnection(messageReader, messageWriter)

// Inject the shared services and language-specific services
const services = createCadScriptServices({ connection, ...EmptyFileSystem })

const shared = services.shared

console.log('Hay hay! Worker desu')

// Start the language server with the shared services
startLanguageServer(shared)

type DocumentChange = { uri: string; content: string; diagnostics: Diagnostic[] }
const documentChangeNotification = new NotificationType<DocumentChange>('browser/DocumentChange')

shared.workspace.DocumentBuilder.onBuildPhase(DocumentState.Validated, documents => {
	// perform this for every validated document in this build phase batch
	for (const document of documents) {
		const model = document.parseResult.value as Model

		// only generate commands if there are no errors
		if (document.diagnostics === undefined || document.diagnostics.filter(i => i.severity === 1).length === 0) {
			const simpleModel = services.CadScript.modelBuilder.modelExpander.expandModel(model)

			connection.sendNotification(documentChangeNotification, {
				uri: document.uri.toString(),
				content: JSON.stringify(simpleModel),
				diagnostics: []
			})
		}
	}
})
