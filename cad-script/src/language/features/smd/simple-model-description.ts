export enum EntityType {
	LINE,
	ARC,
	CIRCLE
}

export enum ConstraintType {
	DISTANCE = "DISTANCE",
	ANGLE = "ANGLE",
	SAMELENGTH = "SAMELENGTH",
	HORIZONTAL = "HORIZONTAL",
	VERTICAL = "VERTICAL",
	RADIUS = "RADIUS",
	PERPENDICULAR = "PERPENDICULAR"
}


export interface SimplePoint {
	id?: string
	posX?: number
	posY?: number
	lockX: boolean
	lockY: boolean
}

interface Identifiably {
	id?: string
}

export interface SimpleCircle extends Identifiably {
	type: 'CIRCLE'
	p1: number
}

export interface SimpleLine extends Identifiably {
	type: 'LINE'
	p1: number
	p2: number
}

export interface SimpleArc extends Identifiably {
	type: 'ARC'
	p1: number
	p2: number
	p3: number
}

export type SimpleEntity = SimpleCircle | SimpleLine | SimpleArc;

export interface SimpleConstraint {
	id?: string
	type: ConstraintType
	originalEntity?: number
	parameters: Array<number>
}

export interface SimpleDescription {
	points: Array<SimplePoint>
	entities: Array<Identifiably>
	constraints: Array<SimpleConstraint>
}
