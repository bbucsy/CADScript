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
import { AbstractStatement, isEntity, isLoopStatement, isSketchDefinition } from '../generated/ast.js'
import { interpolateIDString } from './cad-script-naming.js'
import { CadScriptExpressionEnv } from './cad-script-expression.js'

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

				if (isEntity(modelNode)) {
					if (typeof modelNode.name !== 'undefined') {
						const context = this.getStatementContext(modelNode)
						const modelId = modelNode.name
						context.forEach(ctx => {
							const name = interpolateIDString(modelId, ctx)
							descriptor.push(this.descriptions.createDescription(modelNode, name, document))
						})
					}
				}
			}
		} catch (error) {
			// TODO: decide on error handling
			//console.error(error)
		}

		return descriptor
	}

	private getStatementContext(stmt: AbstractStatement): CadScriptExpressionEnv[] {
		const container = stmt.$container

		if (isSketchDefinition(container)) {
			// Statement is top level statent. Does not have expression context
			return [new Map<string, number>()]
		}
		if (isLoopStatement(container)) {
			// container is a loop statemnt
			const parentContextList = this.getStatementContext(container)
			const expandedContextList: CadScriptExpressionEnv[] = []

			parentContextList.forEach(ctx => {
				for (let i = 0; i < container.count; i++) {
					const clonedContext = new Map(ctx)
					clonedContext.set(container.loopParam.name, i)
					expandedContextList.push(clonedContext)
				}
			})

			return expandedContextList
		}

		throw new Error('Unexpected container type')
	}
}
