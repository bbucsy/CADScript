import {
	AstNode,
	AstNodeDescription,
	DefaultScopeComputation,
	LangiumDocument,
	LangiumServices,
	interruptAndCheck,
	streamAllContents
} from 'langium'
import { CancellationToken } from 'vscode-languageclient'
import { isPoint } from '../generated/ast.js'
import { interpolateIDString } from './cad-script-naming.js'

export class InterpolatedIdScopeComputation extends DefaultScopeComputation {
	constructor(services: LangiumServices) {
		super(services)
	}

	override async computeExports(
		document: LangiumDocument<AstNode>,
		cancelToken?: CancellationToken | undefined
	): Promise<AstNodeDescription[]> {
		const descriptor = await super.computeExports(document, cancelToken)

		try {
			for (const modelNode of streamAllContents(document.parseResult.value)) {
				if (typeof cancelToken !== 'undefined') {
					await interruptAndCheck(cancelToken)
				}

				if (isPoint(modelNode)) {
					if (typeof modelNode.name !== 'undefined') {
						const name = interpolateIDString(modelNode.name)
						descriptor.push(this.descriptions.createDescription(modelNode, name, document))
					}
				}
			}
		} catch (error) {
			console.log('got error')
			console.error(error)
		}

		return descriptor
	}
}
