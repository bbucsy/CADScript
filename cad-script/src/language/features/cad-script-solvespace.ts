import { CadScriptServices } from '../cad-script-module.js'
import { Model } from '../generated/ast.js'
import { CadScriptExpansionService } from './cad-script-expansion.js'
import SolveSpacePackage, { Entity } from '../../lib/slvs.js'
import { ConstraintType } from './smd/simple-model-description.js'

export class SolveSpaceProvider {
	private expander: CadScriptExpansionService

	constructor(services: CadScriptServices) {
		this.expander = services.modelBuilder.modelExpander
	}

	public async compileModel(model: Model) {
		const simpleModel = this.expander.expandModel(model)
		console.log(`Solving model: ${simpleModel.modelName}`)
		return SolveSpacePackage()
			.then(slvs => {
				slvs.clearSketch()
				const g = 1
				const fixedGroup = 2
				const workPlane = slvs.addBase2D(g)

				const pointHandlers: Entity[] = []
				const entityHandlers: Entity[] = []

				simpleModel.points.forEach(p => {
					//console.log(`Adding point to X = ${p.posX ?? 0} Y = ${p.posY ?? 0}`)
					if (p.locked) {
						pointHandlers.push(slvs.addPoint2D(fixedGroup, p.posX ?? 0, p.posY ?? 0, workPlane))
					} else {
						pointHandlers.push(slvs.addPoint2D(g, p.posX ?? 0, p.posY ?? 0, workPlane))
					}
				})

				simpleModel.entities.forEach(e => {
					if (e.type === 'LINE') {
						const p1 = pointHandlers[e.p1]
						const p2 = pointHandlers[e.p2]
						entityHandlers.push(slvs.addLine2D(g, p1, p2, workPlane))
					} else if (e.type === 'ARC') {
						const p1 = pointHandlers[e.p1]
						const p2 = pointHandlers[e.p2]
						const p3 = pointHandlers[e.p3]
						const normal = slvs.addNormal3D(g, 0, 0, 0, 1)
						entityHandlers.push(slvs.addArc(g, normal, p2, p1, p3, workPlane))
					} else if (e.type === 'CIRCLE') {
						const p1 = pointHandlers[e.p1]
						const normal = slvs.addNormal3D(g, 0, 0, 0, 1)
						entityHandlers.push(slvs.addCircle(g, normal, p1, slvs.E_NONE, workPlane))
					}
				})

				simpleModel.constraints.forEach(c => {
					if (c.type == ConstraintType.DISTANCE) {
						const p1 = pointHandlers[c.parameters[0]]
						const p2 = pointHandlers[c.parameters[1]]
						const d = c.parameters[2]
						slvs.distance(g, p1, p2, d, workPlane)
					} else if (c.type === ConstraintType.HORIZONTAL) {
						const p1 = pointHandlers[c.parameters[0]]
						const p2 = pointHandlers[c.parameters[1]]
						slvs.horizontal(g, p1, workPlane, p2)
					}
				})

				const result = slvs.solveSketch(g, true)

				console.log(`result: ${result.result}`)
				console.log(`rank: ${result.rank}`)
				console.log(`dof: ${result.dof}`)
				if (result.result !== 0) {
					console.log(`bad ${result.bad}`)
				}

				pointHandlers.forEach((p, i) => {
					console.log(
						`${simpleModel.points[i].id ?? '<anon>'}: x = ${slvs.getParamValue(
							p.param[0]
						)} y = ${slvs.getParamValue(p.param[1])}`
					)
				})
			})
			.catch(_err => {
				console.log('Error loading solvespace module')
			})
	}
}
