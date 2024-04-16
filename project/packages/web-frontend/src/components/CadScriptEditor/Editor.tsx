import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override'
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js'
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution.js'
import React from 'react'
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react'
import { UserConfig } from 'monaco-editor-wrapper'
import { buildWorkerDefinition } from 'monaco-editor-workers'
import { loadStatemachinWorkerRegular } from './config/workerWrapper'
import { getMonarchGrammar } from './config/monarch'
import rules from './config/editor-theme/rules.json'
import colors from './config/editor-theme/colors.json'

buildWorkerDefinition('../libs/monaco-editor-workers/workers', import.meta.url, false)

const worker = loadStatemachinWorkerRegular()

export const CADScriptEditor: React.FC = () => {
	const logMessage = '//basic sketch definition \ndefine Sketch Main (\n\tadd Point as A at X = 0 mm Y = 0 mm\n)'

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
				code: logMessage,
				themeData: { base: 'vs', inherit: true, rules: rules, colors: colors },
				editorOptions: {
					'semanticHighlighting.enabled': true
				},
				languageDef: getMonarchGrammar()
			}
		},
		languageClientConfig: {
			options: {
				$type: 'WorkerDirect',
				worker: worker
			}
		}
	}

	const onTextChanged = (text: string, isDirty: boolean) => {
		console.log(`Dirty? ${isDirty} Content: ${text}`)
	}

	return (
		<>
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
