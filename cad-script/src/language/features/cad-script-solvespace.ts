import { CadScriptServices } from '../cad-script-module.js'
import { Model } from '../generated/ast.js'
import { CadScriptExpansionService } from './cad-script-expansion.js'
import SolveSpacePackage from '../../lib/slvs.js'

export class SolveSpaceProvider {
	private expander: CadScriptExpansionService

	constructor(services: CadScriptServices) {
		this.expander = services.modelBuilder.modelExpander
	}

	public compileModel(model: Model) {
		const simpleModel = this.expander.expandModel(model)
		console.log(`Solving model: ${simpleModel.modelName}`)
		SolveSpacePackage()
			.then(slvs => {
				slvs.clearSketch()
				var groupNum = 1
				var workPlane = slvs.addBase2D(groupNum)

				var p0 = slvs.addPoint2D(groupNum, 0, 0, workPlane)
				slvs.dragged(groupNum, p0, workPlane)
				var p1 = slvs.addPoint2D(groupNum, 90, 0, workPlane)
				slvs.dragged(groupNum, p1, workPlane)
				var line0 = slvs.addLine2D(groupNum, p0, p1, workPlane)
				var p2 = slvs.addPoint2D(groupNum, 20, 20, workPlane)
				var p3 = slvs.addPoint2D(groupNum, 0, 10, workPlane)
				var p4 = slvs.addPoint2D(groupNum, 30, 20, workPlane)
				slvs.distance(groupNum, p2, p3, 40, workPlane)
				slvs.distance(groupNum, p2, p4, 40, workPlane)
				slvs.distance(groupNum, p3, p4, 70, workPlane)
				slvs.distance(groupNum, p0, p3, 35, workPlane)
				slvs.distance(groupNum, p1, p4, 70, workPlane)
				var line1 = slvs.addLine2D(groupNum, p0, p3, workPlane)
				// slvs.angle(g, line0, line1, 45, wp, false)
				slvs.addConstraint(
					groupNum,
					slvs.C_ANGLE,
					workPlane,
					45.0,
					slvs.E_NONE,
					slvs.E_NONE,
					line0,
					line1,
					slvs.E_NONE,
					slvs.E_NONE,
					false,
					false
				)
				var result = slvs.solveSketch(groupNum, false)
				console.log(result['result'], '==', 0)
				var x = slvs.getParamValue(p2.param[0])
				var y = slvs.getParamValue(p2.param[1])
				console.log(39.54852, x)
				console.log(61.91009, y)

				var r = 10
				let angle = 45
				slvs.clearSketch()
				var groupNum = 1
				var workPlane = slvs.addBase2D(groupNum)
				var p0 = slvs.addPoint2D(groupNum, 0, 0, workPlane)
				slvs.dragged(groupNum, p0, workPlane)
				var p1 = slvs.addPoint2D(groupNum, 0, 10, workPlane)
				slvs.distance(groupNum, p0, p1, r, workPlane)
				var line0 = slvs.addLine2D(groupNum, p0, p1, workPlane)

				var p2 = slvs.addPoint2D(groupNum, 10, 10, workPlane)
				var line1 = slvs.addLine2D(groupNum, p1, p2, workPlane)
				slvs.distance(groupNum, p1, p2, r * (angle * (Math.PI / 180)), workPlane)
				slvs.perpendicular(groupNum, line0, line1, workPlane, false)

				var p3 = slvs.addPoint2D(groupNum, 10, 0, workPlane)
				slvs.dragged(groupNum, p3, workPlane)
				var lineBase = slvs.addLine2D(groupNum, p0, p3, workPlane)
				slvs.angle(groupNum, line0, lineBase, angle, workPlane, false)

				var result = slvs.solveSketch(groupNum, false)
				console.log(result['result'], '==', 0)
				var x = slvs.getParamValue(p2.param[0])
				var y = slvs.getParamValue(p2.param[1])
				console.log(12.62467, '==', x)
				console.log(1.51746, '==', y)
			})
			.catch(_err => {
				console.log('Error loading solvespace module')
			})
	}
}
