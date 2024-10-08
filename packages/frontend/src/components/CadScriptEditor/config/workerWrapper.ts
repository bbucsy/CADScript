export const loadCadScriptWorker = () => {
  // Language Server preparation
  const workerUrl = new URL(
    "../../../worker/cad-script-server.ts",
    import.meta.url
  );
  console.log(`Langium worker URL: ${workerUrl}`);

  return new Worker(
    new URL("../../../worker/cad-script-server.ts", import.meta.url),
    {
      type: "module",
      name: "Cad-Script worker",
    }
  );
};
