import { Expr, isBinExpr, isGroup, isLit, isNegExpr, isRef } from '../generated/ast.js'

export type CadScriptExpressionEnv = Map<string, number>

export const evaluateExpression = (e: Expr, env: CadScriptExpressionEnv): number => {
	if (isLit(e)) {
		return e.val
	}

	if (isRef(e)) {
		const v = env.get(e.val.$refText)
		if (v !== undefined) {
			return v
		} else {
			throw new Error(`Cannot find reference in context: ${e.val.$refText}`)
		}
	}

	if (isBinExpr(e)) {
		const opval = e.op

		let v1 = evaluateExpression(e.e1, env)
		let v2 = evaluateExpression(e.e2, env)

		switch (opval) {
			case '+':
				return v1 + v2
			case '-':
				return v1 - v2
			case '*':
				return v1 * v2
			case '/':
				return v1 / v2
		}
	}

	if (isNegExpr(e)) {
		return -1 * evaluateExpression(e.ne, env)
	}

	if (isGroup(e)) {
		return evaluateExpression(e.ge, env)
	}

	//throw new Error('Cannot evaluate expression. Unkown expression type')
	return NaN
}
