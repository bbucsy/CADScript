import express, { NextFunction, Request, Response } from 'express'
import { SimpleDescription } from 'shared'
import { init_planegcs_module, GcsWrapper, SolveStatus } from '@salusoft89/planegcs'
import { SimpleDescription2SketchPrimitive } from './model-converter.js'

const app = express()
const port = process.env.PORT || 3000
app.use(express.json())
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
		console.log(body)
		const sketch = await SimpleDescription2SketchPrimitive(body)
		const gcs_wrapper = await init_gcs_wrapper()

		for (const obj of sketch) {
			gcs_wrapper.push_primitive(obj)
		}

		const status = gcs_wrapper.solve()
		const dof = gcs_wrapper.gcs.dof()
		if (status == 0) {
			gcs_wrapper.apply_solution()
		}

		const solved = gcs_wrapper.sketch_index.get_primitives()

		gcs_wrapper.destroy_gcs_module()

		res.json({ status: getSolveStatus(status), dof: dof, sketch: solved })
	})
)

app.get('/', (req: Request, res: Response) => {
	res.json({ status: 200, message: 'ok' })
})

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`)
})
