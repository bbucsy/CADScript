import React from "react";
import { UserConfig } from "monaco-editor-wrapper";
import { MonacoEditorReactComp } from "@typefox/monaco-editor-react";

export const CADScriptEditor: React.FC = () => {
  const userConfig: UserConfig = {
    wrapperConfig: {
      editorAppConfig: {
        $type: "extended",
        useDiffEditor: false,
        codeResources: {
          main: {
            text: 'print("Hello, World!")',
            uri: "/workspace/hello.py",
          },
        },
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
