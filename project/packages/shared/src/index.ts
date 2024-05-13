export interface Identifiable {
	id?: string
}

export interface SimplePoint {
	id?: string
	posX?: number
	posY?: number
	locked: boolean
}

export interface SimpleCircle extends Identifiable {
	type: 'CIRCLE'
	p1: number
}

export interface SimpleLine extends Identifiable {
	type: 'LINE'
	p1: number
	p2: number
}

export interface SimpleArc extends Identifiable {
	type: 'ARC'
	p1: number
	p2: number
	p3: number
}

export type SimpleEntity = SimpleCircle | SimpleLine | SimpleArc

export interface SimpleDistanceConstrait extends Identifiable {
	type: 'DISTANCE'
	p1: number
	p2: number
	length: number
}

export interface SimpleAngleConstraint extends Identifiable {
	type: 'ANGLE'
	l1: number
	l2: number
	angle: number
}

export interface SimpleSameLengthConstraint extends Identifiable {
	type: 'SAMELENGTH'
	l1: number
	l2: number
}

export interface SimpleDirectionConstraint extends Identifiable {
	type: 'DIRECTION'
	direction: 'HORIZONTAL' | 'VERTICAL'
	l1: number
}

export interface SimpleRadiusConstraint extends Identifiable {
	type: 'RADIUS'
	e: number
	r: number
}

export interface SimplePerpendicularConstraint extends Identifiable {
	type: 'PERPENDICULAR'
	l1: number
	l2: number
}

export type SimpleConstraint =
	| SimpleDistanceConstrait
	| SimpleAngleConstraint
	| SimpleSameLengthConstraint
	| SimpleDirectionConstraint
	| SimpleRadiusConstraint
	| SimplePerpendicularConstraint

export interface SimpleDescription {
	modelName: string
	points: Array<SimplePoint>
	entities: Array<SimpleEntity>
	constraints: Array<SimpleConstraint>
}
