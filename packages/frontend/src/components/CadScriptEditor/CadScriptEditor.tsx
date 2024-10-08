import React from "react";
import { MonacoEditorReactComp } from "@typefox/monaco-editor-react";
import { getUserConfig } from "./config/userConfig";

export const CADScriptEditor: React.FC = () => {
  return (
    <MonacoEditorReactComp
      userConfig={getUserConfig()}
      onLoad={(wrapper) => {
        console.log(`Loaded ${wrapper.reportStatus().join("\n").toString()}`);
        wrapper
          .getLanguageClient()
          ?.onNotification("browser/DocumentChange", (event) => {
            console.log(`Notification arrived: ${JSON.stringify(event)}`);
            //setSimpleModel(event.content)
          });
      }}
      style={{
        background: "black",
        paddingTop: "5px",
        width: "100%",
        height: "85vh",
      }}
      onTextChanged={(text) => {
        console.log(`Text changed: ${text.main}`);
      }}
    />
  );
};
