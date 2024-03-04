import { defineConfig } from 'tsup'

export default defineConfig(options => {
	return {
		entry: ['src/main.ts'],
		splitting: false,
		sourcemap: true,
		clean: true,
		minify: options.minify,
		format: 'esm',
		treeshake: true,
		dts: true
	}
})
