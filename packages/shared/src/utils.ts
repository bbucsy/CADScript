export const isPresent = <T>(object: T | undefined | null): object is T => {
  return typeof object !== "undefined" && object !== null && object !== "";
};

export function popFirstFromSet<T>(set: Set<T>): T | undefined {
  const firstElement = Array.from(set)[0]; // Get the first element
  if (firstElement !== undefined) {
    set.delete(firstElement); // Remove the first element from the set
  }
  return firstElement;
}

export function assertPresent(...objs: any[]): true | never {
  if (objs.every(isPresent)) return true;

  throw new Error("Assert failed! Found non values in array");
}
