

import { UserConfig } from 'monaco-editor-wrapper';



export const loadStatemachinWorker = () => {
    // Language Server preparatio
    const workerUrl = new URL('./worker', import.meta.url);
    console.log(`Langium worker URL: ${workerUrl}`);

    return new Worker(workerUrl, {
        type: 'module',
        name: 'Statemachine LS',
    });
};

export const createLangiumGlobalConfig = async (): Promise<UserConfig> => {



    const stateMachineWorker = loadStatemachinWorker();

    return {
        wrapperConfig: {
            serviceConfig: {
                debugLogging: true
            },
            editorAppConfig: {
                $type: 'classic',
                languageId: 'cad-script',
                code: '//lol',
                useDiffEditor: false,
            }
        },
        languageClientConfig: {
            options: {
                $type: 'WorkerDirect',
                worker: stateMachineWorker
            }
        }
    };
};