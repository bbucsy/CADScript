import {
	Arc,
	Circle,
	Constraint,
	Line,
	LoopStatement,
	Model,
	Point,
	SketchDefinition,
	isAngleConstraint,
	isArc,
	isCircle,
	isConstraint,
	isDistanceConstraint,
	isLine,
	isLineDirectionConstraint,
	isLoopStatement,
	isPartialStatement,
	isPerpendicularConstraint,
	isPoint,
	isRadiusCosntraint,
	isSameLengthCosntraint
} from '../../generated/ast.js'
import { EntityRepository } from '../../utils/entity-repository.js'
import { CadScriptExpressionEnv } from '../cad-script-expression.js'
import { MeasurementCompuitation } from '../cad-script-measurement.js'
import { interpolateIDString } from '../cad-script-naming.js'
import {
	ConstraintType,
	SimpleArc,
	SimpleCircle,
	SimpleConstraint,
	SimpleDescription,
	SimpleEntity,
	SimpleLine,
	SimplePoint
} from './simple-model-description.js'

export class SimpleModelDescriptionBuilder {
	private unitConverter: MeasurementCompuitation
	private pointRepository: EntityRepository<SimplePoint>
	private entityRespository: EntityRepository<SimpleEntity>
	private constrainRespository: EntityRepository<SimpleConstraint>

	private modelName = ''

	constructor(unitConverter: MeasurementCompuitation) {
		this.unitConverter = unitConverter
		this.pointRepository = new EntityRepository()
		this.entityRespository = new EntityRepository()
		this.constrainRespository = new EntityRepository()
	}

	public processModel(model: Model): void {
		const mainSketch = model.sketches.find(s => !s.partial)
		if (typeof mainSketch !== 'undefined') {
			const ctx = new Map<string, number>()

			/**
			 * Here I use the fact, that the language is hierarchic:
			 *  - Points do not refer to anything
			 *  - Other Entities refer to points
			 *  - Constraints refer to points
			 * This way I can safely build up lookup tables in three passes
			 */

			this.processContainerRecursive(mainSketch, ctx, null, 'points')
			this.processContainerRecursive(mainSketch, ctx, null, 'entities')
			this.processContainerRecursive(mainSketch, ctx, null, 'constrains')
			this.modelName = mainSketch.name
		}
	}

	public fetchSimpleDescription(): SimpleDescription {
		return {
			modelName: this.modelName,
			points: this.pointRepository.getEntites(),
			entities: this.entityRespository.getEntites(),
			constraints: this.constrainRespository.getEntites(false)
		}
	}

	private processContainerRecursive(
		container: SketchDefinition | LoopStatement,
		baseCtx: CadScriptExpressionEnv,
		partialContext: string | null,
		target: 'points' | 'entities' | 'constrains'
	) {
		container.statements.forEach(stmt => {
			if (isPoint(stmt) && target === 'points') {
				this.proccesPoint(stmt, baseCtx, partialContext)
			}

			if (isLine(stmt) && target === 'entities') {
				this.processLine(stmt, baseCtx, partialContext)
			}

			if (isCircle(stmt) && target === 'entities') {
				this.processCircle(stmt, baseCtx, partialContext)
			}

			if (isArc(stmt) && target === 'entities') {
				this.processArc(stmt, baseCtx, partialContext)
			}

			if (isConstraint(stmt) && target === 'constrains') {
				this.processConstraint(stmt, baseCtx, partialContext)
			}

			if (isLoopStatement(stmt)) {
				for (let i = 0; i < stmt.count; i++) {
					const clonedContext = new Map<string, number>(baseCtx)
					clonedContext.set(stmt.loopParam.name, i)
					this.processContainerRecursive(stmt, clonedContext, partialContext, target)
				}
			}

			if (isPartialStatement(stmt)) {
				if (typeof stmt.partial.ref !== 'undefined') {
					this.processContainerRecursive(stmt.partial.ref, baseCtx, stmt.name, target)
				}
			}
		})
	}

	/**
	 * Processes a Point AST node and stores them in a lookup table
	 */
	private proccesPoint(p: Point, ctx: CadScriptExpressionEnv, partialContext: string | null): void {
		const pointDescription: SimplePoint = {
			locked: false
		}

		if (typeof p.place !== 'undefined') {
			pointDescription.locked = p.place.placeType === 'at'

			const xValue = this.unitConverter.computeLenghtMeasurement(p.place.xBase, ctx)
			pointDescription.posX = xValue

			const yValue = this.unitConverter.computeLenghtMeasurement(p.place.yBase, ctx)
			pointDescription.posY = yValue
		}

		if (typeof p.name !== 'undefined') {
			const interpolatedLocalReference = interpolateIDString(p.name, ctx)
			this.pointRepository.addNamed(partialContext, interpolatedLocalReference, pointDescription)
		} else {
			this.pointRepository.addAnonym(pointDescription)
		}
	}

	/**
	 * Processes a Line AST node into a simplified description.
	 * Creates the necessar constraints if lenght or baseLine is given in the node
	 */
	private processLine(line: Line, ctx: CadScriptExpressionEnv, partialContext: string | null): void {
		//resolve first point
		const iP1 = this.pointRepository.lookup(partialContext, line.p1.$refText)
		const iP2 = this.pointRepository.lookup(partialContext, line.p2.$refText)

		if (typeof iP1 === 'undefined' || typeof iP2 === 'undefined') {
			console.log('Expansion error: could not lookup point reference')
			return
		}

		const lineDescription: SimpleLine = {
			type: 'LINE',
			p1: iP1,
			p2: iP2
		}

		let lineRef = NaN
		if (typeof line.name !== 'undefined') {
			const interpolatedLocalReference = interpolateIDString(line.name, ctx)
			lineRef = this.entityRespository.addNamed(partialContext, interpolatedLocalReference, lineDescription)
		} else {
			lineRef = this.entityRespository.addAnonym(lineDescription)
		}

		// ADD Lenght Constraint if needed
		if (typeof line.length !== 'undefined') {
			const length = this.unitConverter.computeLenghtMeasurement(line.length, ctx)
			this.constrainRespository.addAnonym({
				type: ConstraintType.DISTANCE,
				originalEntity: lineRef,
				parameters: [iP1, iP2, length]
			})
		}

		// Addd horizontal constraint if necessary
		if (line.baseLineConstraint === 'horizontal') {
			this.constrainRespository.addAnonym({
				type: ConstraintType.HORIZONTAL,
				originalEntity: lineRef,
				parameters: [iP1, iP2]
			})
		}

		// Addd vertical constraint if necessary
		if (line.baseLineConstraint === 'vertical') {
			this.constrainRespository.addAnonym({
				type: ConstraintType.VERTICAL,
				originalEntity: lineRef,
				parameters: [iP1, iP2]
			})
		}
	}

	/**
	 * Processes a Circle AST node into a simplified description.
	 * Creates the necessar constraints if the Radius is given in the node
	 */
	private processCircle(circle: Circle, ctx: CadScriptExpressionEnv, partialContext: string | null): void {
		//resolve first point
		const iCenter =
			typeof circle.center !== 'undefined'
				? this.pointRepository.lookup(partialContext, circle.center?.$refText)
				: this.pointRepository.addAnonym({ locked: false })

		if (typeof iCenter === 'undefined') {
			console.log('Expansion error: could not lookup point reference')
			return
		}

		const lineDescription: SimpleCircle = {
			type: 'CIRCLE',
			p1: iCenter
		}

		let eRef = NaN
		if (typeof circle.name !== 'undefined') {
			const interpolatedLocalReference = interpolateIDString(circle.name, ctx)
			eRef = this.entityRespository.addNamed(partialContext, interpolatedLocalReference, lineDescription)
		} else {
			eRef = this.entityRespository.addAnonym(lineDescription)
		}

		// ADD Radius Constraint if needed
		if (typeof circle.radius !== 'undefined') {
			const radius = this.unitConverter.computeLenghtMeasurement(circle.radius, ctx)
			this.constrainRespository.addAnonym({
				type: ConstraintType.RADIUS,
				parameters: [eRef, radius]
			})
		}
	}

	/**
	 * Processes a Arc AST node into a simplified description.
	 * Creates the necessar constraints if the Radius is given in the node
	 */
	private processArc(arc: Arc, ctx: CadScriptExpressionEnv, partialContext: string | null): void {
		const iP1 = this.pointRepository.lookup(partialContext, arc.p1.$refText)
		const iP2 = this.pointRepository.lookup(partialContext, arc.p2.$refText)

		const iCenter = this.pointRepository.lookup(partialContext, arc.center?.$refText)

		if (typeof iCenter === 'undefined' || typeof iP1 === 'undefined' || typeof iP2 === 'undefined') {
			console.log('Expansion error: could not lookup point reference')
			return
		}

		const lineDescription: SimpleArc = {
			type: 'ARC',
			p1: iP1,
			p2: iCenter,
			p3: iP2
		}

		let eRef = NaN
		if (typeof arc.name !== 'undefined') {
			const interpolatedLocalReference = interpolateIDString(arc.name, ctx)
			eRef = this.entityRespository.addNamed(partialContext, interpolatedLocalReference, lineDescription)
		} else {
			eRef = this.entityRespository.addAnonym(lineDescription)
		}

		// ADD Radius Constraint if needed
		if (typeof arc.radius !== 'undefined') {
			const radius = this.unitConverter.computeLenghtMeasurement(arc.radius, ctx)
			this.constrainRespository.addAnonym({
				type: ConstraintType.RADIUS,
				parameters: [eRef, radius]
			})
		}
	}

	private processConstraint(
		constraint: Constraint,
		ctx: CadScriptExpressionEnv,
		partialContext: string | null
	): void {
		if (isAngleConstraint(constraint)) {
			const l1 = this.entityRespository.lookup(partialContext, constraint.l1.$refText)
			const l2 = this.entityRespository.lookup(partialContext, constraint.l2.$refText)
			const angle = this.unitConverter.computeAngleMeasurement(constraint.angle, ctx)

			if (typeof l1 === 'undefined' || typeof l2 === 'undefined') {
				console.log('Expansion error: could not lookup line reference')
				return
			}

			this.constrainRespository.addAnonym({
				type: ConstraintType.ANGLE,
				parameters: [l1, l2, angle]
			})
		}

		if (isSameLengthCosntraint(constraint)) {
			const l1 = this.entityRespository.lookup(partialContext, constraint.l1.$refText)
			const l2 = this.entityRespository.lookup(partialContext, constraint.l2.$refText)

			if (typeof l1 === 'undefined' || typeof l2 === 'undefined') {
				console.log('Expansion error: could not lookup line reference')
				return
			}

			this.constrainRespository.addAnonym({
				type: ConstraintType.SAMELENGTH,
				parameters: [l1, l2]
			})
		}

		if (isPerpendicularConstraint(constraint)) {
			const l1 = this.entityRespository.lookup(partialContext, constraint.l1.$refText)
			const l2 = this.entityRespository.lookup(partialContext, constraint.l2.$refText)

			if (typeof l1 === 'undefined' || typeof l2 === 'undefined') {
				console.log('Expansion error: could not lookup line reference')
				return
			}

			this.constrainRespository.addAnonym({
				type: ConstraintType.PERPENDICULAR,
				parameters: [l1, l2]
			})
		}

		if (isDistanceConstraint(constraint)) {
			const iP1 = this.pointRepository.lookup(partialContext, constraint.p1.$refText)
			const iP2 = this.pointRepository.lookup(partialContext, constraint.p2.$refText)
			const value = this.unitConverter.computeLenghtMeasurement(constraint.length, ctx)
			if (typeof iP1 === 'undefined' || typeof iP2 === 'undefined') {
				console.log('Expansion error: could not lookup point reference')
				return
			}
			this.constrainRespository.addAnonym({
				type: ConstraintType.DISTANCE,
				parameters: [iP1, iP2, value]
			})
		}

		if (isRadiusCosntraint(constraint)) {
			const iEntity = this.entityRespository.lookup(partialContext, constraint.entity.$refText)
			const radiusValue = this.unitConverter.computeLenghtMeasurement(constraint.radius, ctx)
			if (typeof iEntity === 'undefined') {
				console.log('Expansion error: could not lookup Entity reference')
				return
			}

			this.constrainRespository.addAnonym({
				type: ConstraintType.RADIUS,
				parameters: [iEntity, radiusValue]
			})
		}

		if (isLineDirectionConstraint(constraint)) {
			const l1 = this.entityRespository.lookup(partialContext, constraint.l1.$refText)
			if (typeof l1 === 'undefined') {
				console.log('Expansion error: could not lookup Entity reference')
				return
			}

			this.constrainRespository.addAnonym({
				type:
					constraint.baseLineConstraint === 'horizontal'
						? ConstraintType.HORIZONTAL
						: ConstraintType.VERTICAL,
				parameters: [l1]
			})
		}
	}
}
