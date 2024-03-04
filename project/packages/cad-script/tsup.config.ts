import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/language/lib.ts', 'src/language/main-browser.ts'],
	outDir: './lib',
	splitting: false,
	sourcemap: true,
	clean: true,
	dts: true,
	treeshake: true,
	minify: true,
	format: 'esm'
})
