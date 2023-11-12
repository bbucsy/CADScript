import { CadScriptServices } from '../cad-script-module.js'
import { LengthMeasurement, LengthUnit } from '../generated/ast.js'
import { CadScriptExpressionEnv, evaluateExpression } from './cad-script-expression.js'

export class MeasurementCompuitation {
	constructor(_services: CadScriptServices) {}

	private convertToMM(value: number, unit: LengthUnit): number {
		if (typeof unit === 'undefined') return value

		const UNIT_CONVERSION_TABLE: Map<string, number> = new Map([
			['mm', 1],
			['cm', 10],
			['dm', 100],
			['m', 1000],
			// imperial units
			['th', 0.0254],
			['in', 25.4],
			['ft', 304.8],
			['yd', 914.4]
		])

		const conversionValue = UNIT_CONVERSION_TABLE.get(unit)

		if (typeof conversionValue === 'undefined') {
			throw new Error(`$UnitError(${value} ${unit})`)
		} else {
			return value * conversionValue
		}
	}

	computeLenghtMeasurement(length: LengthMeasurement, ctx: CadScriptExpressionEnv): number {
		const numericalValue = evaluateExpression(length.value, ctx)
		return this.convertToMM(numericalValue, length.unit)
	}
}
