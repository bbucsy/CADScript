import {
	isPoint,
	Point,
	type Model,
	LengthMeasurement,
	Line,
	isLine,
	Circle,
	isCircle,
	Arc,
	isArc,
	Constraint,
	isConstraint,
	AngleMeasurement,
	isDegree,
	isDegreeWithMinutes,
	isRadian,
	isAngleConstraint,
	isDistanceConstraint,
	isPerpendicularConstraint,
	isSameLengthCosntraint,
	StringID,
	isInterpolatedExpression,
	isStringID
} from '../language/generated/ast.js'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { extractDestinationAndName } from './cli-util.js'
import { CompositeGeneratorNode, NL, toString } from 'langium'

export function expandSketch(model: Model, filePath: string, destination: string | undefined): string {
	const data = extractDestinationAndName(filePath, destination)
	const generatedFilePath = `${path.join(data.destination, data.name)}.e.sketch`

	const fileNode = new CompositeGeneratorNode()
	fileNode.append('// Sketch expansion', NL)
	fileNode.append('// Base unit of length measurement: mm', NL)
	fileNode.append('// Base unit of angles: degree', NL)
	fileNode.append(`// Source file: ${filePath}`, NL, NL)

	if (typeof model.sketch !== 'undefined') {
		fileNode.append('define Sketch (', NL)
		// expand current model

		model.sketch.statements.forEach(stmt => {
			fileNode.indent(sketchNode => {
				if (isPoint(stmt)) {
					generatePoint(stmt, sketchNode)
					sketchNode.append(NL)
				} else if (isLine(stmt)) {
					generateLine(stmt, sketchNode)
					sketchNode.append(NL)
				} else if (isCircle(stmt)) {
					generateCircle(stmt, sketchNode)
					sketchNode.append(NL)
				} else if (isArc(stmt)) {
					generateArc(stmt, sketchNode)
					sketchNode.append(NL)
				} else if (isConstraint(stmt)) {
					generateConstraint(stmt, sketchNode)
					sketchNode.append(NL)
				} else if (isStringID(stmt)) {
					sketchNode.append(NL, 'interpolated_string: ', expandStringID(stmt), NL)
				} else {
					sketchNode.append('// Unknown statement ', NL)
				}
			})
		})
		fileNode.append(')', NL)
	}

	if (!fs.existsSync(data.destination)) {
		fs.mkdirSync(data.destination, { recursive: true })
	}
	fs.writeFileSync(generatedFilePath, toString(fileNode))
	return generatedFilePath
}

const generatePoint = (point: Point, node: CompositeGeneratorNode) => {
	node.append('add Point')

	if (typeof point.name !== 'undefined') {
		node.append(' as ', point.name)
	}

	if (
		typeof point.place !== 'undefined' &&
		(typeof point.place.xBase !== 'undefined' || typeof point.place.yBase !== 'undefined')
	) {
		node.append(' ', point.place.placeType, ' ')

		if (typeof point.place.xBase !== 'undefined') {
			node.append(' X = ', expandLengthMeasurement(point.place.xBase))
		}

		if (typeof point.place.yBase !== 'undefined') {
			node.append(' Y = ', expandLengthMeasurement(point.place.yBase))
		}
	}
	node.append(NL)
}

const generateLine = (line: Line, node: CompositeGeneratorNode) => {
	node.append('add')

	if (typeof line.length !== 'undefined') {
		node.append(' ', expandLengthMeasurement(line.length))
	}

	if (typeof line.baseLineConstraint !== 'undefined') {
		node.append(' ', line.baseLineConstraint)
	}

	node.append(' Line from ', line.p1.ref?.name, ' to ', line.p2.ref?.name)

	if (typeof line.name !== 'undefined') {
		node.append(' as ', line.name)
	}

	node.append(NL)
}

const generateCircle = (circle: Circle, node: CompositeGeneratorNode) => {
	node.append('add')

	if (typeof circle.radius !== 'undefined') {
		node.append(' ', expandLengthMeasurement(circle.radius))
	}

	node.append(' Circle')

	if (typeof circle.center !== 'undefined') {
		node.append(' at ', circle.center.ref?.name)
	}

	node.append(NL)
}

const generateArc = (arc: Arc, node: CompositeGeneratorNode) => {
	node.append('add')

	if (typeof arc.radius !== 'undefined') {
		node.append(' ', expandLengthMeasurement(arc.radius))
	}

	node.append(' Arc ', arc.p1.ref?.name, ' ', arc.center.ref?.name, ' ', arc.p2.ref?.name)

	if (typeof arc.name !== 'undefined') {
		node.append(' as ', arc.name)
	}

	node.append(NL)
}

const expandStringID = (id: StringID): string => {
	return id.parts
		.map(part => {
			if (isInterpolatedExpression(part)) {
				return part.exp.toString()
			} else {
				return part
			}
		})
		.join('')
}

const generateConstraint = (c: Constraint, node: CompositeGeneratorNode) => {
	if (isAngleConstraint(c)) {
		node.append('constrain ', expandAngleMesurement(c.angle), ' angle to ', c.l1.ref?.name, ' and ', c.l2.ref?.name)
	} else if (isDistanceConstraint(c)) {
		node.append(
			'constrain ',
			expandLengthMeasurement(c.length),
			' distance to ',
			c.p1.ref?.name,
			' and ',
			c.p2.ref?.name
		)
	} else if (isPerpendicularConstraint(c)) {
		node.append('constrain perpendicular ', c.l1.ref?.name, ' and ', c.l2.ref?.name)
	} else if (isSameLengthCosntraint(c)) {
		node.append('constrain samelength ', c.l1.ref?.name, ' and ', c.l2.ref?.name)
	}

	node.append(NL)
}

const expandAngleMesurement = (angle: AngleMeasurement): string => {
	if (isDegree(angle)) return `${angle.value} °`
	else if (isDegreeWithMinutes(angle)) return `${(1 / 60) * angle.minutes + angle.value} °`
	else if (isRadian(angle)) return `${(angle.value * 180) / Math.PI} °`
	else return `$UnitError`
}

// returns milimeter representation of measurement
const expandLengthMeasurement = (length: LengthMeasurement): string => {
	if (typeof length.unit === 'undefined') return `${length.value} mm`
	//ft' | 'in' | 'th' | 'yd'
	const UNIT_CONVERSION_TABLE: Map<string, number> = new Map([
		['mm', 1],
		['cm', 10],
		['dm', 100],
		['m', 1000],
		// imperial units
		['th', 0.0254],
		['in', 25.4],
		['ft', 304.8],
		['yd', 914.4]
	])

	const conversionValue = UNIT_CONVERSION_TABLE.get(length.unit)

	if (typeof conversionValue === 'undefined') {
		return `$UnitError(${length.value} ${length.unit})`
	} else {
		return `${length.value * conversionValue} mm`
	}
}
