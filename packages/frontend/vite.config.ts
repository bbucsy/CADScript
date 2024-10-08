import { defineConfig } from "vite";
import importMetaUrlPlugin from "@codingame/esbuild-import-meta-url-plugin";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  worker: {
    format: "es",
  },
  resolve: {
    dedupe: ["monaco-editor", "vscode"],
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [importMetaUrlPlugin],
    },
  },
  plugins: [react()],
});
