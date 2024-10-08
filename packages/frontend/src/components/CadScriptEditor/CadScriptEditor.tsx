import React from "react";
import { UserConfig } from "monaco-editor-wrapper";
import { MonacoEditorReactComp } from "@typefox/monaco-editor-react";
import { loadStatemachinWorkerRegular } from "./config/workerWrapper";

const worker = loadStatemachinWorkerRegular();
worker.onmessage = (event) => {
  console.log(`onRecevie: ${event.data}`);
};

export const CADScriptEditor: React.FC = () => {
  const userConfig: UserConfig = {
    wrapperConfig: {
      editorAppConfig: {
        $type: "extended",
        useDiffEditor: false,
        userConfiguration: {
          json: JSON.stringify({
            "workbench.colorTheme": "Default Dark Modern",
            "semanticHighlighting.enabled": true,
          }),
        },
        codeResources: {
          main: {
            text: 'print("Hello, World!")',
            uri: "/workspace/hello.py",
          },
        },
      },
    },
    languageClientConfig: {
      languageId: "cad-script",
      options: {
        $type: "WorkerDirect",
        worker: worker,
      },
    },
  };
  return (
    <MonacoEditorReactComp
      userConfig={userConfig}
      onLoad={(wrapper) => {
        console.log(`OnLoad. [WRAPPER: ${typeof wrapper !== "undefined"}]`);
      }}
      style={{
        background: "black",
        paddingTop: "5px",
        width: "100%",
        height: "85vh",
      }}
      onTextChanged={(text) => {
        console.log(text.main);
      }}
    />
  );
};
