import {
	AstNode,
	AstNodeDescription,
	DefaultScopeComputation,
	LangiumDocument,
	LangiumServices,
	PrecomputedScopes
} from 'langium'
import { CancellationToken } from 'vscode-languageclient'
import {
	Entity,
	LoopStatement,
	Model,
	SketchDefinition,
	isEntity,
	isLoopStatement,
	isPartialStatement
} from '../generated/ast.js'
import { interpolateIDString } from './cad-script-naming.js'
import { CadScriptExpressionEnv } from './cad-script-expression.js'

class EntityDictionary {
	private entityMap: Map<Entity, Set<string>>

	constructor() {
		this.entityMap = new Map<Entity, Set<string>>()
	}

	public setName(entity: Entity, name: string) {
		if (!this.entityMap.has(entity)) {
			const nameSet = new Set<string>()
			nameSet.add(name)
			this.entityMap.set(entity, nameSet)
		} else {
			this.entityMap.get(entity)?.add(name)
		}
	}

	public getNames(entity: Entity): string[] {
		const nameSet = this.entityMap.get(entity)

		if (typeof nameSet === 'undefined') {
			return []
		} else {
			return Array.from(nameSet.values())
		}
	}

	public entries(): [Entity, string][] {
		const entries: [Entity, string][] = []

		this.entityMap.forEach((nameSet, entity) => {
			nameSet.forEach(name => {
				entries.push([entity, name])
			})
		})

		return entries
	}
}

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

		// interpolate all namedEntites in the sketches
		const sketchDictionary = new Map<string, EntityDictionary>()
		for (const sketch of model.sketches) {
			const dictionary = this.getEntityDictionary(sketch)

			// compute local scopes from them and add them to the others
			const computedScopes = this.processSketchInterpolatedScope(dictionary, document)
			scopes.addAll(sketch, computedScopes)

			// save computed names for further used in nested sketches
			// store based on name, because at this point we cannot resolve references yet
			sketchDictionary.set(sketch.name, dictionary)
		}

		// get imported partial sketch entities to scope of current sketch
		const mainSketch = model.sketches.find(sk => !sk.partial)

		if (typeof mainSketch !== 'undefined') {
			for (const stmt of mainSketch.statements) {
				if (isPartialStatement(stmt)) {
					const sketchReferenceDictionary = sketchDictionary.get(stmt.partial.$refText)
					if (typeof sketchReferenceDictionary !== 'undefined') {
						const refComputedScopes = this.processSketchInterpolatedScope(
							sketchReferenceDictionary,
							document,
							`${stmt.name}->`
						)
						scopes.addAll(mainSketch, refComputedScopes)
					}
				}
			}
		}

		return scopes
	}

	private processSketchInterpolatedScope(
		nameDictionary: EntityDictionary,
		document: LangiumDocument,
		prefix: string = ''
	): AstNodeDescription[] {
		const descriptions: AstNodeDescription[] = []

		nameDictionary.entries().forEach(([entity, name]) => {
			descriptions.push(this.descriptions.createDescription(entity, `${prefix}${name}`, document))
		})

		return descriptions
	}

	private getEntityDictionary(sketch: SketchDefinition): EntityDictionary {
		const baseDictionary = new EntityDictionary()
		const baseContext = new Map<string, number>()

		this._getNamedEntities(sketch, baseContext, baseDictionary)
		return baseDictionary
	}

	// recursive helper function fo get EntityDictionary
	private _getNamedEntities(
		container: SketchDefinition | LoopStatement,
		ctx: CadScriptExpressionEnv,
		entities: EntityDictionary
	) {
		container.statements.forEach(stmt => {
			try {
				if (isEntity(stmt) && typeof stmt.name !== 'undefined') {
					const name = interpolateIDString(stmt.name, ctx)
					entities.setName(stmt, name)
				}

				//on loop recursively call process container with different context
				if (isLoopStatement(stmt)) {
					for (let i = 0; i < stmt.count; i++) {
						const clonedContext = new Map<string, number>(ctx)
						clonedContext.set(stmt.loopParam.name, i)
						this._getNamedEntities(stmt, clonedContext, entities)
					}
				}
			} catch (error) {
				console.log(error)
			}
		})
	}
}
