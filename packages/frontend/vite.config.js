import { defineConfig } from 'vite';
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    build: {
        target: 'esnext'
    },
    worker: {
        format: 'es'
    },
    resolve: {
        dedupe: ['monaco-editor', 'vscode']
    },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [importMetaUrlPlugin]
        }
    },
    define: {
        rootDirectory: JSON.stringify(__dirname)
    },
    plugins: [react()]
});
