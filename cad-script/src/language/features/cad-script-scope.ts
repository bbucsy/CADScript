import {
	AstNode,
	AstNodeDescription,
	DefaultScopeComputation,
	LangiumDocument,
	LangiumServices,
	PrecomputedScopes
} from 'langium'
import { CancellationToken } from 'vscode-languageclient'
import { LoopStatement, Model, SketchDefinition, isEntity, isLoopStatement } from '../generated/ast.js'
import { interpolateIDString } from './cad-script-naming.js'
import { CadScriptExpressionEnv } from './cad-script-expression.js'

export class InterpolatedIdScopeComputation extends DefaultScopeComputation {
	constructor(services: LangiumServices) {
		super(services)
	}

	override async computeLocalScopes(
		document: LangiumDocument<AstNode>,
		cancelToken?: CancellationToken | undefined
	): Promise<PrecomputedScopes> {
		const scopes = await super.computeLocalScopes(document, cancelToken)
		const model = document.parseResult.value as Model

		for (const sketch of model.sketches) {
			const emptyContext = new Map<string, number>()
			const computedScopes = this.processContainer(sketch, emptyContext, document)
			scopes.addAll(sketch, computedScopes)
		}

		return scopes
	}

	private processContainer(
		container: SketchDefinition | LoopStatement,
		ctx: CadScriptExpressionEnv,
		document: LangiumDocument
	): AstNodeDescription[] {
		const descriptions: AstNodeDescription[] = []

		container.statements.forEach(stmt => {
			if (isEntity(stmt) && typeof stmt.name !== 'undefined') {
				const name = interpolateIDString(stmt.name, ctx)
				descriptions.push(this.descriptions.createDescription(stmt, name, document))
			}

			//on loop recursively call process container with different context
			if (isLoopStatement(stmt)) {
				for (let i = 0; i < stmt.count; i++) {
					const clonedContext = new Map<string, number>(ctx)
					clonedContext.set(stmt.loopParam.name, i)
					const loopDescriptions = this.processContainer(stmt, clonedContext, document)
					descriptions.push(...loopDescriptions)
				}
			}
		})

		return descriptions
	}
}
