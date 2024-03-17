import { InterpolatedId, isExpressionSubstitute } from '../generated/ast.js'
import { CadScriptExpressionEnv, evaluateExpression } from './cad-script-expression.js'

export const interpolateIDString = (id: InterpolatedId, context: CadScriptExpressionEnv): string => {
	return id.parts
		.map(part => {
			if (isExpressionSubstitute(part)) {
				return evaluateExpression(part.exp, context).toString()
			} else {
				return part
			}
		})
		.join('')
}
