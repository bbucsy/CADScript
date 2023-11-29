import * as path from 'node:path'
import * as fs from 'node:fs'
import { extractDestinationAndName } from '../cli-util.js'
import { CompositeGeneratorNode, NL, toString } from 'langium'
import {
	ConstraintType,
	SimpleConstraint,
	SimpleDescription,
	SimpleEntity,
	SimplePoint
} from '../../language/features/smd/simple-model-description.js'

export class SketchWriter {
	private model: SimpleDescription
	private filePath: string
	private destination: string | undefined
	private trace: boolean

	private pointNames: Map<number, string> = new Map()
	private entityNames: Map<number, string> = new Map()

	constructor(model: SimpleDescription, filePath: string, destination: string | undefined, trace = false) {
		this.model = model
		this.filePath = filePath
		this.destination = destination
		this.trace = trace
	}

	public writeSketchToFile(): string {
		const data = extractDestinationAndName(this.filePath, this.destination)
		const generatedFilePath = `${path.join(data.destination, data.name)}.e.sketch`

		const fileNode = new CompositeGeneratorNode()
		fileNode.append('// Sketch expansion', NL)
		fileNode.append('// Base unit of length measurement: mm', NL)
		fileNode.append('// Base unit of angles: degree', NL)
		fileNode.append(`// Source file: ${this.filePath}`, NL, NL)
		fileNode.append(`define Sketch ${this.model.modelName} (`, NL, NL)

		fileNode.indent(indentNode => {
			indentNode.append('// Point definitions', NL, NL)
			this.model.points.forEach((point, index) => {
				this.processPoint(point, index, indentNode)
			})
			indentNode.append('// Entity definitions', NL, NL)
			this.model.entities.forEach((e, i) => {
				this.processEntity(e, i, indentNode)
			})
			indentNode.append('// Constraints', NL, NL)
			this.model.constraints.forEach((c, i) => {
				this.processConstraint(c, indentNode)
			})
		})

		fileNode.append(')')

		if (!fs.existsSync(data.destination)) {
			fs.mkdirSync(data.destination, { recursive: true })
		}
		fs.writeFileSync(generatedFilePath, toString(fileNode))
		return generatedFilePath
	}

	private processPoint(point: SimplePoint, index: number, node: CompositeGeneratorNode) {
		if (this.trace) node.append(`// trace: ${point.id ?? '<>'}`, NL)
		const name = `Point_${index}`
		this.pointNames.set(index, name)

		node.append(`add Point as ${name}`)
		if (point.locked) {
			node.append(' at ')

			node.append(`X = ${point.posX} mm `)

			node.append(`Y = ${point.posY} mm `)
		}

		node.append(NL, NL)
	}

	private processEntity(entity: SimpleEntity, index: number, node: CompositeGeneratorNode) {
		if (this.trace) node.append(`// trace: ${entity.id ?? '<>'}`, NL)
		const name = `${entity.type}_E${index}`
		this.entityNames.set(index, name)

		if (entity.type === 'LINE') {
			const p1 = this.pointNames.get(entity.p1)
			const p2 = this.pointNames.get(entity.p2)
			node.append(`add Line from ${p1} to ${p2} as ${name}`)
		} else if (entity.type === 'CIRCLE') {
			const p = this.pointNames.get(entity.p1)
			node.append(`add Circle at ${p} as ${name}`)
		} else if (entity.type === 'ARC') {
			const p1 = this.pointNames.get(entity.p1)
			const p2 = this.pointNames.get(entity.p2)
			const p3 = this.pointNames.get(entity.p3)
			node.append(`add Arc ${p1} ${p2} ${p3} as ${name}`)
		}
		node.append(NL, NL)
	}

	private processConstraint(c: SimpleConstraint, node: CompositeGeneratorNode) {
		if (this.trace && typeof c.originalEntity !== 'undefined') {
			node.append(`// trace: applied to -> ${this.model.entities[c.originalEntity]?.id}`, NL)
		}

		node.append('constrain ')

		switch (c.type) {
			case ConstraintType.ANGLE:
				{
					const e1 = this.entityNames.get(c.parameters[0])
					const e2 = this.entityNames.get(c.parameters[1])
					node.append(`${c.parameters[2]} ° angle to ${e1} and ${e2}`)
				}
				break
			case ConstraintType.SAMELENGTH:
				{
					const e1 = this.entityNames.get(c.parameters[0])
					const e2 = this.entityNames.get(c.parameters[1])
					node.append(`samelength to ${e1} and ${e2}`)
				}
				break
			case ConstraintType.PERPENDICULAR:
				{
					const e1 = this.entityNames.get(c.parameters[0])
					const e2 = this.entityNames.get(c.parameters[1])
					node.append(`perpendicular to ${e1} and ${e2}`)
				}
				break
			case ConstraintType.DISTANCE:
				{
					const p1 = this.pointNames.get(c.parameters[0])
					const p2 = this.pointNames.get(c.parameters[1])
					node.append(`${c.parameters[2]} mm distance to ${p1} and ${p2}`)
				}
				break
			case ConstraintType.HORIZONTAL:
				{
					const e1 = this.entityNames.get(c.parameters[0])
					node.append(`horizontal ${e1}`)
				}
				break
			case ConstraintType.VERTICAL:
				{
					const e1 = this.entityNames.get(c.parameters[0])
					node.append(`vertical ${e1}`)
				}
				break
			case ConstraintType.RADIUS:
				{
					const e1 = this.entityNames.get(c.parameters[0])
					node.append(`${c.parameters[1]} mm radius to ${e1}`)
				}
				break

			default:
				break
		}

		node.append(NL, NL)
	}
}
