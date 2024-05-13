import { SketchPoint, SketchPrimitive } from '@salusoft89/planegcs'
import { Drawable, SimpleDescription } from 'shared'

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
			const arc_id = `${sketchPrimitives.length}`
			sketchPrimitives.push({
				type: 'arc',
				id: arc_id,
				c_id: pointReference(entity.p2),
				start_id: pointReference(entity.p1),
				end_id: pointReference(entity.p3),
				radius: 1,
				start_angle: 1,
				end_angle: 1
			})
			sketchPrimitives.push({
				type: 'arc_rules',
				id: `${sketchPrimitives.length}`,
				a_id: arc_id
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

export const Sketch2Drawable = (sketch: SketchPrimitive[]): Drawable[] => {
	const result: Drawable[] = []

	const pLookUp = (p_id: string): SketchPoint => {
		const res = sketch.find(s => {
			return s.type == 'point' && s.id == p_id
		}) as SketchPoint

		if (typeof res === 'undefined') {
			throw new Error(`Cannot find point with id(${p_id}) in sketch`)
		}
		return res
	}

	sketch.forEach(primitve => {
		if (primitve.type == 'point') {
			result.push({
				type: 'POINT',
				x: primitve.x,
				y: primitve.y
			})
		}

		if (primitve.type == 'line') {
			const p1 = pLookUp(primitve.p1_id)
			const p2 = pLookUp(primitve.p2_id)
			result.push({
				type: 'LINE',
				x1: p1.x,
				y1: p1.y,
				x2: p2.x,
				y2: p2.y
			})
		}

		if (primitve.type == 'arc') {
			const start = pLookUp(primitve.start_id)
			const center = pLookUp(primitve.c_id)
			const end = pLookUp(primitve.end_id)
			result.push({
				type: 'ARC',
				radius: primitve.radius,
				xs: start.x,
				ys: start.y,
				xc: center.x,
				yc: center.y,
				xe: end.x,
				ye: end.y
			})
		}

		if (primitve.type == 'circle') {
			const c = pLookUp(primitve.c_id)
			result.push({
				type: 'CIRCLE',
				radius: primitve.radius,
				x: c.x,
				y: c.y
			})
		}
	})

	return result
}
