import { InterpolatedId, isExpressionSubstitute } from '../generated/ast.js'

export const interpolateIDString = (id: InterpolatedId): string => {
	return id.parts
		.map(part => {
			if (isExpressionSubstitute(part)) {
				return part.exp.toString()
			} else {
				return part
			}
		})
		.join('')
}
