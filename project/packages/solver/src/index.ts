import express, { NextFunction, Request, Response } from 'express'
import { ISolverResult, SimpleDescription } from 'shared'
import cors from 'cors'
import { init_planegcs_module, GcsWrapper, SolveStatus, Algorithm } from '@salusoft89/planegcs'
import { SimpleDescription2SketchPrimitive, Sketch2Drawable } from './model-converter.js'

const app = express()
const port = process.env.PORT || 3000
app.use(express.json())
app.use(cors())
async function init_gcs_wrapper() {
	const mod = await init_planegcs_module()
	const gcs_system_wasm = new mod.GcsSystem()
	const gcs_wrapper = new GcsWrapper(gcs_system_wasm)
	return gcs_wrapper
}

const getSolveStatus = (status: SolveStatus): string => {
	/*readonly Success: 0;
    readonly Converged: 1;
    readonly Failed: 2;
    readonly SuccessfulSolutionInvalid: 3;*/
	switch (status) {
		case 0:
			return 'Success'
		case 1:
			return 'Converged'
		case 2:
			return 'Failed'
		default:
			return `Unkowns Status <${status}>`
	}
}

export const asyncWrapper =
	(fn: (...params: any[]) => any) =>
	(req: Request, res: Response, next: NextFunction): Promise<any> =>
		Promise.resolve(fn(req, res, next)).catch(next)

app.post('/sd2sp', (req: Request, res: Response) => {
	const body = req.body as SimpleDescription
	console.log(body)
	SimpleDescription2SketchPrimitive(body)
		.then(sketch => {
			res.json(sketch)
		})
		.catch(err => {
			console.log(err)
			res.send(400)
		})
})

app.post(
	'/solve',
	asyncWrapper(async (req: Request, res: Response) => {
		const body = req.body as SimpleDescription
		if (typeof body === 'undefined') {
			return res.json({
				status: 'No sketch',
				dof: 0,
				sketch: []
			})
		}
		const sketch = await SimpleDescription2SketchPrimitive(body)
		const gcs_wrapper = await init_gcs_wrapper()

		for (const obj of sketch) {
			gcs_wrapper.push_primitive(obj)
		}

		const algorithms = [Algorithm.BFGS, Algorithm.LevenbergMarquardt]

		let status = gcs_wrapper.solve(Algorithm.DogLeg)

		if (status !== 0) {
			for (const alg of algorithms) {
				status = gcs_wrapper.solve(alg)
				if (status == 0) {
					break
				}
			}
		}

		gcs_wrapper.apply_solution()
		const dof = gcs_wrapper.gcs.dof()

		const solved_sketch = gcs_wrapper.sketch_index.get_primitives()
		console.log(gcs_wrapper.get_gcs_redundant_constraints())
		console.log(gcs_wrapper.get_gcs_conflicting_constraints())

		gcs_wrapper.destroy_gcs_module()

		const response: ISolverResult = {
			dof: dof,
			status: getSolveStatus(status),
			sketch: Sketch2Drawable(solved_sketch)
		}

		res.json(response)
	})
)

app.post(
	'/solve2',
	asyncWrapper(async (req: Request, res: Response) => {
		const body = req.body as SimpleDescription
		if (typeof body === 'undefined') {
			return res.json({
				status: 'No sketch',
				dof: 0,
				sketch: []
			})
		}
		const sketch = await SimpleDescription2SketchPrimitive(body)
		const gcs_wrapper = await init_gcs_wrapper()

		for (const obj of sketch) {
			gcs_wrapper.push_primitive(obj)
		}

		const status = gcs_wrapper.solve(Algorithm.LevenbergMarquardt)

		if (status == 0) {
			gcs_wrapper.apply_solution()
		}

		const dof = gcs_wrapper.gcs.dof()

		const conflict = gcs_wrapper.get_gcs_conflicting_constraints()
		const redundant = gcs_wrapper.get_gcs_redundant_constraints()

		const solved_sketch = gcs_wrapper.sketch_index.get_primitives()

		gcs_wrapper.destroy_gcs_module()

		const response = {
			dof: dof,
			status: getSolveStatus(status),
			sketch: solved_sketch,
			conflict: conflict,
			redundant: redundant
		}

		res.json(response)
	})
)

app.get('/', (req: Request, res: Response) => {
	res.json({ status: 200, message: 'ok' })
})

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`)
})
