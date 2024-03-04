interface Identifiable {
	id?: string
}

export class EntityRepository<T extends Identifiable> {
	private repository: T[] = []

	private lookupTable: Map<string, number>

	constructor() {
		this.lookupTable = new Map()
	}

	public addNamed(ctx: string | null, ref: string, entity: T): number {
		const fqdn = `${ctx ?? ''}::${ref}`
		this.repository.push(entity)
		const entityRef = this.repository.length - 1

		this.lookupTable.set(fqdn, entityRef)

		if (ctx !== null) {
			// We must add null context reference as well
			const fqdn2 = `::${ctx}->${ref}`
			this.lookupTable.set(fqdn2, entityRef)
		}

		return entityRef
	}

	public addAnonym(entity: T): number {
		this.repository.push(entity)
		return this.repository.length - 1
	}

	public lookup(ctx: string | null, ref: string): number | undefined {
		const fqdn = `${ctx ?? ''}::${ref}`

		return this.lookupTable.get(fqdn)
	}

	public getEntites(named = true): T[] {
		if (!named) return this.repository
		return this.repository.map((item, idx) => {
			item.id = this.reverseLookup(idx)
			return item
		})
	}

	public get(idx: number): T {
		return this.repository[idx]
	}

	private reverseLookup(idx: number): string | undefined {
		const result = [...this.lookupTable.entries()].find(entry => {
			return entry[1] === idx
		})?.[0]

		return result ?? '<anon>'
	}
}
