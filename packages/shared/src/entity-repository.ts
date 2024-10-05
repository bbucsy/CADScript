import { isPresent } from "./utils.js";

export class EntityRepository<T> {
  private repository: T[] = [];
  private lookupTable = new Map<string, number>();

  public lookup(fqdn: string): { entity: T; index: number } | undefined {
    const idx = this.lookupTable.get(fqdn);
    if (!isPresent(idx)) return undefined;

    return {
      entity: this.repository[idx],
      index: idx,
    };
  }

  public add(fqdn: string, entity: T): { fqdn: string; index: number } {
    if (this.lookupTable.has(fqdn))
      throw new Error(`Duplicate entity "${fqdn}" during model building`);

    this.repository.push(entity);
    const entityRef = this.repository.length - 1;
    this.lookupTable.set(fqdn, entityRef);

    return { index: entityRef, fqdn: fqdn };
  }

  public getEntities(): T[] {
    return Array.from(this.repository);
  }
}
