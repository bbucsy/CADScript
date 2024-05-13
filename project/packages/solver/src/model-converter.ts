import { SketchPrimitive } from '@salusoft89/planegcs'
import { SimpleDescription } from 'shared'

export const SimpleDescription2SketchPrimitive = async (model: SimpleDescription): Promise<SketchPrimitive[]> => {
	const sketchPrimitives: Array<SketchPrimitive> = []
	// convert points into sketch primitive

	const pointReference = (ref: number): string => `${ref}`
	const entityReference = (ref: number): string => `${ref + model.points.length}`

	const pointPlaceAlgorithm = (pos: number | undefined): number => {
		// TODO: replace this algorithm with something more sophisticated
		if (typeof pos === 'undefined') {
			return Math.random() + 0.01 // so no point is placed at origo
		} else return pos
	}

	model.points.forEach(point => {
		sketchPrimitives.push({
			type: 'point',
			fixed: point.locked,
			x: pointPlaceAlgorithm(point.posX),
			y: pointPlaceAlgorithm(point.posY),
			id: `${sketchPrimitives.length}`
		})
	})

	// convert entities
	model.entities.forEach(entity => {
		if (entity.type == 'LINE') {
			sketchPrimitives.push({
				type: 'line',
				id: `${sketchPrimitives.length}`,
				p1_id: pointReference(entity.p1),
				p2_id: pointReference(entity.p2)
			})
		}

		if (entity.type == 'CIRCLE') {
			sketchPrimitives.push({
				type: 'circle',
				c_id: pointReference(entity.p1),
				id: `${sketchPrimitives.length}`,
				radius: 1
			})
		}

		if (entity.type == 'ARC') {
			sketchPrimitives.push({
				type: 'arc',
				id: `${sketchPrimitives.length}`,
				c_id: pointReference(entity.p2),
				start_id: pointReference(entity.p1),
				end_id: pointReference(entity.p3),
				radius: 1,
				start_angle: 0,
				end_angle: Math.PI / 2
			})
		}
	})

	// convert contraints
	model.constraints.forEach(constraint => {
		if (constraint.type == 'DISTANCE') {
			sketchPrimitives.push({
				type: 'p2p_distance',
				id: `${sketchPrimitives.length}`,
				distance: constraint.length,
				p1_id: pointReference(constraint.p1),
				p2_id: pointReference(constraint.p2)
			})
		}

		if (constraint.type == 'ANGLE') {
			sketchPrimitives.push({
				type: 'l2l_angle_ll',
				id: `${sketchPrimitives.length}`,
				angle: constraint.angle * (Math.PI / 180),
				l1_id: entityReference(constraint.l1),
				l2_id: entityReference(constraint.l2)
			})
		}

		if (constraint.type == 'SAMELENGTH') {
			sketchPrimitives.push({
				type: 'equal_length',
				id: `${sketchPrimitives.length}`,
				l1_id: entityReference(constraint.l1),
				l2_id: entityReference(constraint.l2)
			})
		}

		if (constraint.type == 'DIRECTION' && constraint.direction == 'HORIZONTAL') {
			sketchPrimitives.push({
				type: 'horizontal_l',
				id: `${sketchPrimitives.length}`,
				l_id: entityReference(constraint.l1)
			})
		}

		if (constraint.type == 'DIRECTION' && constraint.direction == 'VERTICAL') {
			sketchPrimitives.push({
				type: 'vertical_l',
				id: `${sketchPrimitives.length}`,
				l_id: entityReference(constraint.l1)
			})
		}

		if (constraint.type == 'RADIUS') {
			sketchPrimitives.push({
				type: 'equal',
				id: `${sketchPrimitives.length}`,
				param1: { o_id: entityReference(constraint.e), prop: 'radius' },
				param2: constraint.r
			})
		}

		if (constraint.type == 'PERPENDICULAR') {
			sketchPrimitives.push({
				type: 'perpendicular_ll',
				id: `${sketchPrimitives.length}`,
				l1_id: entityReference(constraint.l1),
				l2_id: entityReference(constraint.l2)
			})
		}
	})

	return sketchPrimitives
}
