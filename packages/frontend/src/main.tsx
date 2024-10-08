import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ChakraProvider } from "@chakra-ui/react";
import "./index.css";
import { WorkspaceContextProvider } from "./providers/WorkspaceContext/WorkspaceContextProvider.tsx";
import { useWorkerFactory } from "monaco-editor-wrapper/workerFactory";

const configureMonacoWorkers = () => {
  useWorkerFactory({
    ignoreMapping: true,
    workerLoaders: {
      editorWorkerService: () =>
        new Worker(
          new URL(
            "monaco-editor/esm/vs/editor/editor.worker.js",
            import.meta.url
          ),
          { type: "module" }
        ),
    },
  });
};

configureMonacoWorkers();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider>
      <WorkspaceContextProvider>
        <App />
      </WorkspaceContextProvider>
    </ChakraProvider>
  </StrictMode>
);
