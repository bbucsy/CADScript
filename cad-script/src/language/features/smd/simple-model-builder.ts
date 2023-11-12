import { CadScriptServices } from '../../cad-script-module.js'
import {
	LoopStatement,
	Model,
	Point,
	SketchDefinition,
	isLoopStatement,
	isPartialStatement,
	isPoint
} from '../../generated/ast.js'
import { CadScriptExpressionEnv } from '../cad-script-expression.js'
import { MeasurementCompuitation } from '../cad-script-measurement.js'
import { interpolateIDString } from '../cad-script-naming.js'
import { SimpleDescription, SimplePoint } from './simple-model-description.js'

export class SimpleModelDescriptionBuilder {
	private unitConverter: MeasurementCompuitation

	private anonCounter = 0

	private pointNames = new Set<string>()

	constructor(services: CadScriptServices) {
		this.unitConverter = services.expressions.UnitConverter
	}

	public buildSimpleModel(model: Model): SimpleDescription {
		const simpleModel = {
			constraints: [],
			entities: [],
			points: []
		}

		const mainSketch = model.sketches.find(s => !s.partial)
		if (typeof mainSketch !== 'undefined') {
			const ctx = new Map<string, number>()
			this.processContainerPointsRecursive(mainSketch, ctx, '', simpleModel)
		}

		return simpleModel
	}

	private processContainerPointsRecursive(
		container: SketchDefinition | LoopStatement,
		baseCtx: CadScriptExpressionEnv,
		partialContext: string,
		output: SimpleDescription
	) {
		container.statements.forEach(stmt => {
			if (isPoint(stmt)) {
				output.points.push(this.prepearePoint(stmt, baseCtx, partialContext))
			}

			if (isLoopStatement(stmt)) {
				for (let i = 0; i < stmt.count; i++) {
					const clonedContext = new Map<string, number>(baseCtx)
					clonedContext.set(stmt.loopParam.name, i)
					this.processContainerPointsRecursive(stmt, clonedContext, partialContext, output)
				}
			}

			if (isPartialStatement(stmt)) {
				if (typeof stmt.partial.ref !== 'undefined') {
					//const pContext = `${partialContext}->${stmt.name}`
					this.processContainerPointsRecursive(stmt.partial.ref, baseCtx, stmt.name, output)
				}
			}
		})
	}

	private prepearePoint(p: Point, ctx: CadScriptExpressionEnv, partialContext: string): SimplePoint {
		const pointRawName = p.name ? interpolateIDString(p.name, ctx) : this.getUniqueAnonimName()

		const fullName = partialContext === '' ? pointRawName : `${partialContext}->${pointRawName}`

		this.pointNames.add(fullName)

		const pointEntry: SimplePoint = {
			id: fullName,
			lockX: false,
			lockY: false
		}

		if (typeof p.place !== 'undefined') {
			if (typeof p.place.xBase !== 'undefined') {
				const value = this.unitConverter.computeLenghtMeasurement(p.place.xBase, ctx)
				pointEntry.posX = value
				pointEntry.lockX = p.place.placeType === 'at'
			}

			if (typeof p.place.yBase !== 'undefined') {
				const value = this.unitConverter.computeLenghtMeasurement(p.place.yBase, ctx)
				pointEntry.posY = value
				pointEntry.lockY = p.place.placeType === 'at'
			}
		}

		return pointEntry
	}

	private getUniqueAnonimName(): string {
		let name = `anon_${this.anonCounter}`

		while (this.pointNames.has(name)) {
			this.anonCounter++
			name = `anon_${this.anonCounter}`
		}

		return name
	}
}
