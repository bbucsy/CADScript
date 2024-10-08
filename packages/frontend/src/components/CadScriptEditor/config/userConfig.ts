import getEditorServiceOverride from "@codingame/monaco-vscode-editor-service-override";
import getKeybindingsServiceOverride from "@codingame/monaco-vscode-keybindings-service-override";
import { useOpenEditorStub } from "monaco-editor-wrapper/vscode/services";
import { UserConfig } from "monaco-editor-wrapper";
import {
  BrowserMessageReader,
  BrowserMessageWriter,
} from "vscode-languageclient/browser.js";
import { loadCadScriptWorker } from "./workerWrapper";
import syntax from "../sytaxes/cad-script.tmLanguage.json?raw";
import languageconfig from "./cad-script-configuration.json?raw";

export const getUserConfig = (): UserConfig => {
  const extensionFilesOrContents = new Map<string, string | URL>();
  // vite build is easier with string content
  extensionFilesOrContents.set(
    "/cad-script-configuration.json",
    languageconfig
  );
  extensionFilesOrContents.set("/cad-script-grammar.json", syntax);

  const langiumWorker = loadCadScriptWorker();
  const reader = new BrowserMessageReader(langiumWorker);
  const writer = new BrowserMessageWriter(langiumWorker);

  return {
    loggerConfig: {
      enabled: true,
      debugEnabled: true,
    },
    wrapperConfig: {
      serviceConfig: {
        userServices: {
          ...getEditorServiceOverride(useOpenEditorStub),
          ...getKeybindingsServiceOverride(),
        },
        debugLogging: true,
      },
      editorAppConfig: {
        $type: "extended",
        codeResources: {
          main: {
            text: "Sketch Main {}",
            fileExt: "cad-script",
          },
        },
        useDiffEditor: false,
        extensions: [
          {
            config: {
              name: "cad-script",
              publisher: "bbucsy",
              version: "1.0.0",
              engines: {
                vscode: "*",
              },
              contributes: {
                languages: [
                  {
                    id: "cad-script",
                    extensions: [".sketch"],
                    aliases: ["cadscript", "CADSCRIPT"],
                    configuration: "./cad-script-configuration.json",
                  },
                ],
                grammars: [
                  {
                    language: "cad-script",
                    scopeName: "source.cad-script",
                    path: "./cad-script-grammar.json",
                  },
                ],
              },
            },
            filesOrContents: extensionFilesOrContents,
          },
        ],
        userConfiguration: {
          json: JSON.stringify({
            "workbench.colorTheme": "Default Dark Modern",
            "editor.wordBasedSuggestions": "off",
          }),
        },
      },
    },
    languageClientConfig: {
      languageId: "cad-script",
      name: "CAD Script Language Servier",
      options: {
        $type: "WorkerDirect",
        worker: langiumWorker,
      },
      connectionProvider: {
        get: async () => ({ reader, writer }),
      },
    },
  };
};
