import * as path from 'node:path'
import * as fs from 'node:fs'
import { extractDestinationAndName } from './cli-util.js'
import { SimpleDescription } from '../language/features/smd/simple-model-description.js'

export function writeJSON(model: SimpleDescription, filePath: string, destination: string | undefined): string {
	const data = extractDestinationAndName(filePath, destination)
	const generatedFilePath = `${path.join(data.destination, data.name)}.json`

	if (!fs.existsSync(data.destination)) {
		fs.mkdirSync(data.destination, { recursive: true })
	}
	fs.writeFileSync(generatedFilePath, JSON.stringify(model, null, '\t'))
	return generatedFilePath
}
