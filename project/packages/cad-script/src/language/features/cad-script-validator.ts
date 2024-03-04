import type { ValidationAcceptor, ValidationChecks } from 'langium'
import {
	CadScriptAstType,
	Entity,
	LoopStatement,
	Model,
	ParameterDefinition,
	PartialStatement,
	Point,
	RadiusCosntraint,
	SketchDefinition,
	isArc,
	isEntity,
	isLine,
	isLoopStatement,
	isPartialStatement,
	isPoint
} from '../generated/ast.js'
import type { CadScriptServices } from '../cad-script-module.js'
import { CadScriptExpressionEnv } from './cad-script-expression.js'
import { interpolateIDString } from './cad-script-naming.js'
import { CategoricalSet } from '../utils/category-set.js'


/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: CadScriptServices) {
	const registry = services.validation.ValidationRegistry
	const validator = services.validation.CadScriptValidator
	const checks: ValidationChecks<CadScriptAstType> = {
		Model: [validator.checkMainSketch, validator.checkSketchNameUnique],
		PartialStatement: [validator.checkPartialImport],
		ParameterDefinition: [validator.warnUnimplementedParameterFeature],
		LoopStatement: [validator.checkLoopUsingInteger, validator.checkNestedLoopShadowing],
		SketchDefinition: [validator.checkEntityNamesUnique, validator.checkImportNamesUnique],
		Entity: [validator.checkEntityParameters],
		Point: [validator.warnNotUsingPointPlace, validator.checkPointPlacePartiallyDefined],
		RadiusCosntraint: [validator.checkRadiusConstraintNoPointOrLine]
	}
	registry.register(checks, validator)
}

/**
 * Implementation of custom validations.
 */
export class CadScriptValidator {
	checkMainSketch(model: Model, accept: ValidationAcceptor): void {
		// if the model is empty, then its all ok
		if (model.sketches.length === 0) return

		// otherwise there must be exactly one main sketch (non partial)
		const mainSketches = model.sketches.filter(s => !s.partial)
		const numMain = mainSketches.length

		// if there is no main sketch pt error to first sketch
		if (numMain === 0) {
			accept('error', 'Each file must contain 1 main sketch', { node: model.sketches[0], property: 'partial' })
		} else if (numMain > 1) {
			mainSketches.forEach((sketch, idx) => {
				if (idx !== 0) {
					accept('error', 'Each file must contain exactly 1 main sketch', {
						node: sketch,
						property: 'partial'
					})
				}
			})
		}
	}

	checkSketchNameUnique(model: Model, accept: ValidationAcceptor): void {
		const sketchNames = new Set()
		model.sketches.forEach(sketch => {
			if (sketchNames.has(sketch.name)) {
				accept('error', `Sketch has non unique name '${sketch.name}'`, { node: sketch, property: 'name' })
			}
			sketchNames.add(sketch.name)
		})
	}

	checkPartialImport(stmt: PartialStatement, accept: ValidationAcceptor): void {
		if (stmt.$container.$type === 'LoopStatement') {
			accept('error', 'Cannot import partial sketch inside a loop', { node: stmt })
		} else if (stmt.$container.$type === 'SketchDefinition' && stmt.$container.partial) {
			accept('error', 'You can only use partial imports from main sketch', { node: stmt })
		}
	}

	warnUnimplementedParameterFeature(param: ParameterDefinition, accept: ValidationAcceptor): void {
		accept('warning', 'Parameters are currently not implemented', { node: param })
	}

	checkLoopUsingInteger(stmt: LoopStatement, accept: ValidationAcceptor): void {
		if (stmt.count.toString().includes('.')) {
			accept('error', 'Loop statements can only use whole numbers', { node: stmt, property: 'count' })
		}
	}

	checkNestedLoopShadowing(stmt: LoopStatement, accept: ValidationAcceptor): void {
		const parameterSet = new Set<string>()
		parameterSet.add(stmt.loopParam.name)

		// check trough all child statements
		const statementsToCheck: LoopStatement[] = stmt.statements.filter(isLoopStatement)

		while (statementsToCheck.length > 0) {
			const activeStatement = statementsToCheck.shift()

			// we know this is not undefined, but I check to please the typescript null checker
			if (typeof activeStatement !== 'undefined') {
				if (parameterSet.has(activeStatement.loopParam.name)) {
					accept(
						'error',
						`Parameter '${activeStatement.loopParam.name}' shadows a parent parameter with the same name`,
						{ node: activeStatement, property: 'loopParam' }
					)
				}
				parameterSet.add(activeStatement.loopParam.name)
				statementsToCheck.push(...activeStatement.statements.filter(isLoopStatement))
			}
		}
	}

	checkEntityNamesUnique(sketch: SketchDefinition, accept: ValidationAcceptor): void {
		const nameSet = new CategoricalSet()
		const sketchContext: CadScriptExpressionEnv = new Map<string, number>()

		this._entityNameUniqueRecursiveHelper(sketch, sketchContext, nameSet, accept)
	}

	checkImportNamesUnique(sketch: SketchDefinition, accept: ValidationAcceptor): void {
		if (sketch.partial) return

		const usedNames = new Set<string>()

		sketch.statements.filter(isPartialStatement).forEach(stmt => {
			if (usedNames.has(stmt.name)) {
				accept('error', `Import has non unique name: '${stmt.name}'`, { node: stmt, property: 'name' })
			}
			usedNames.add(stmt.name)
		})
	}

	private _entityNameUniqueRecursiveHelper(
		container: LoopStatement | SketchDefinition,
		baseContext: CadScriptExpressionEnv,
		nameSet: CategoricalSet,
		accept: ValidationAcceptor
	) {
		container.statements.forEach(stmt => {
			if (isLoopStatement(stmt)) {
				for (let i = 0; i < stmt.count; i++) {
					const clonedContext = new Map<string, number>(baseContext)
					clonedContext.set(stmt.loopParam.name, i)
					this._entityNameUniqueRecursiveHelper(stmt, clonedContext, nameSet, accept)
				}
			} else if (isEntity(stmt)) {
				if (typeof stmt.name !== 'undefined') {
					const entityName = interpolateIDString(stmt.name, baseContext)
					const entityCategory = stmt.$type
					if (nameSet.has(entityCategory, entityName)) {
						accept('error', `${entityCategory} has non unique name '${entityName}'`, {
							node: stmt,
							property: 'name'
						})
					}
					nameSet.add(entityCategory, entityName)
				}
			}
		})
	}

	checkEntityParameters(entity: Entity, accept: ValidationAcceptor) {
		if (isLine(entity)) {
			//console.log('Checking line')
			//console.log(`${entity.p1.$refText} == ${entity.p2.$refText} -> ${entity.p1.ref === entity.p2.ref}`)
			if (entity.p1.ref === entity.p2.ref && entity.p1.$refText === entity.p2.$refText) {
				accept('error', 'Start point of a Line must be a different entity than End point', {
					node: entity,
					property: 'p2'
				})
			}
		} else if (isArc(entity)) {
			if (entity.p1.ref === entity.center.ref && entity.p1.$refText === entity.center.$refText) {
				accept('error', 'Start point of Arc must be different entity than Center point', {
					node: entity,
					property: 'center'
				})
			} else if (entity.center.ref === entity.p2.ref && entity.center.$refText === entity.p2.$refText) {
				accept('error', 'Center point of Arc must be different entity than End point', {
					node: entity,
					property: 'p2'
				})
			} else if (entity.p1.ref === entity.p2.ref && entity.p1.$refText === entity.p2.$refText) {
				accept('error', 'Start point of Arc must be different entity than End point', {
					node: entity,
					property: 'p2'
				})
			}
		}
	}

	warnNotUsingPointPlace(point: Point, accep: ValidationAcceptor): void {
		if (typeof point.place === 'undefined') {
			accep(
				'hint',
				'You might get better result with the 2D constraint solving if you give approximate position with the "around" keyword',
				{ node: point }
			)
		}
	}

	checkPointPlacePartiallyDefined(point: Point, accept: ValidationAcceptor): void {
		if (typeof point.place !== 'undefined') {
			if (typeof point.place.xBase === 'undefined' && typeof point.place.yBase === 'undefined') {
				accept('error', 'You need to give X position, Y position or both', { node: point.place })
			}
		}
	}

	checkRadiusConstraintNoPointOrLine(c: RadiusCosntraint, accept: ValidationAcceptor): void {
		if (isLine(c.entity.ref) || isPoint(c.entity.ref)) {
			accept('error', 'Only Arc or Circle can be constrained with radius', { node: c, property: 'entity' })
		}
	}
}
