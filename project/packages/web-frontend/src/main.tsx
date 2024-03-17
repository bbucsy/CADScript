import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override'
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js'
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution.js'
import ReactDOM from 'react-dom/client'
import React, { useState } from 'react'
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react'
import { UserConfig } from 'monaco-editor-wrapper'
import { buildWorkerDefinition } from 'monaco-editor-workers'
import { loadStatemachinWorkerRegular } from './config/workerWrapper'

buildWorkerDefinition('../libs/monaco-editor-workers/workers', import.meta.url, false)

const rootElem = document.getElementById('root')!
const worker = loadStatemachinWorkerRegular()
const EditorDemo: React.FC = () => {
	const logMessage = 'define sketch Main ()'
	const [content, setContent] = useState(logMessage)

	const userConfig: UserConfig = {
		wrapperConfig: {
			serviceConfig: {
				userServices: {
					...getKeybindingsServiceOverride()
				},
				debugLogging: true
			},
			editorAppConfig: {
				$type: 'classic',
				languageId: 'cad-script',
				useDiffEditor: false,
				theme: 'vs-dark',
				code: content
			}
		},
		languageClientConfig: {
			options: {
				$type: 'WorkerDirect',
				worker: worker
			}
		}
	}

	const addConsoleMessage = () => {
		setContent(`${content}\n${logMessage}`)
	}

	const onTextChanged = (text: string, isDirty: boolean) => {
		console.log(`Dirty? ${isDirty} Content: ${text}`)
	}

	return (
		<>
			<button onClick={addConsoleMessage}>Update Code</button>
			<MonacoEditorReactComp
				userConfig={userConfig}
				style={{
					paddingTop: '5px',
					height: '80vh'
				}}
				onTextChanged={onTextChanged}
			/>
		</>
	)
}

const comp = <EditorDemo />
const root = ReactDOM.createRoot(rootElem)
root.render(comp)
