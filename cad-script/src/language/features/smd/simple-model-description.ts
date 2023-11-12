export enum EntityType {
	LINE,
	ARC,
	CIRCLE
}

export enum ConstraintType {
	DISTANCE,
	ANGLE,
	SAMELENGTH
}

export interface SimplePoint {
	id: string
	posX?: number
	posY?: number
	lockX: boolean
	lockY: boolean
}

export interface Circle {
	type: 'CIRCLE'
	p1: number
}

export interface Line {
	type: 'LINE'
	p1: number
	p2: number
}

export interface Arc {
	type: 'ARC'
	p1: number
	p2: number
	p3: number
}

export type Entity = Circle | Line | Arc

export interface Constraint {
	id: string
	type: ConstraintType
	parameters: Array<number>
}

export interface SimpleDescription {
	points: Array<SimplePoint>
	entities: Array<Entity>
	constraints: Array<Constraint>
}
