import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/language/lib.ts'],
	outDir: './lib',
	splitting: false,
	sourcemap: true,
	clean: true,
	dts: true,
	treeshake: true,
	format: 'esm'
})
