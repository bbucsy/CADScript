export class CategoricalSet {
	private _nameSets: Map<string, Set<string>>

	constructor() {
		this._nameSets = new Map<string, Set<string>>()
	}

	public has(category: string, name: string): boolean {
		const nameSet = this._nameSets.get(category)

		if (typeof nameSet === 'undefined') return false

		return nameSet.has(name)
	}

	public add(category: string, name: string): void {
		const nameSet = this._nameSets.get(category)

		if (typeof nameSet === 'undefined') {
			const newNameSet = new Set<string>()
			newNameSet.add(name)
			this._nameSets.set(category, newNameSet)
		} else {
			nameSet.add(name)
		}
	}
}
