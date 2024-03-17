export const loadStatemachinWorkerRegular = () => {
	// Language Server preparation
	const workerUrl = new URL('../src/worker/cad-script-server.ts', window.location.href)
	console.log(`Langium worker URL: ${workerUrl}`)

	return new Worker(workerUrl, {
		type: 'module',
		name: 'Cad-Script worker'
	})
}
