import { EmptyFileSystem } from 'langium';
import { BrowserMessageReader, BrowserMessageWriter, createConnection } from 'vscode-languageserver/browser.js';
import { createCadScriptServices } from './cad-script-module.js';
import { startLanguageServer } from 'langium/lsp';
// your services & module name may differ based on your language's name


declare const self: DedicatedWorkerGlobalScope;

/* browser specific setup code */
const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);

const connection = createConnection(messageReader, messageWriter);

// Inject the shared services and language-specific services
const { shared} = createCadScriptServices({connection, ...EmptyFileSystem });

// Start the language server with the shared services
export const startWorker = ()=>{
    startLanguageServer(shared);
}