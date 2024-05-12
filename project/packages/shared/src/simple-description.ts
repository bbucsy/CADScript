

export interface SimplePoint {
	id?: string
	posX?: number
	posY?: number
	locked: boolean
}

export interface Identifiable {
	id?: string
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

export interface SimpleConstraint {
	id?: string
	type: string
	originalEntity?: number
	parameters: Array<number>
}

export interface SimpleDescription {
	modelName: string
	points: Array<SimplePoint>
	entities: Array<SimpleEntity>
	constraints: Array<SimpleConstraint>
}
