import { LengthUnit } from "../generated/ast.js";

export class MeasurementCompuitation {
  public static convertToMM(value: number, unit: LengthUnit): number {
    if (typeof unit === "undefined") return value;

    const UNIT_CONVERSION_TABLE: Map<string, number> = new Map([
      ["mm", 1],
      ["cm", 10],
      ["dm", 100],
      ["m", 1000],
      // imperial units
      ["th", 0.0254],
      ["in", 25.4],
      ["ft", 304.8],
      ["yd", 914.4],
    ]);

    const conversionValue = UNIT_CONVERSION_TABLE.get(unit);

    if (typeof conversionValue === "undefined") {
      throw new Error(`$UnitError(${value} ${unit})`);
    } else {
      return value * conversionValue;
    }
  }

  public static convertToDeg(value: number) {
    return (value * 180) / Math.PI;
  }
}
