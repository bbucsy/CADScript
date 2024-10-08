import {
  AstNodeDescriptionProvider,
  AstUtils,
  DefaultScopeProvider,
  EMPTY_SCOPE,
  MapScope,
  ReferenceInfo,
  Scope,
  ScopeProvider,
} from "langium";
import { LangiumServices } from "langium/lsp";
import {
  isImportArg,
  ImportArg,
  isPartialImport,
  isModel,
} from "../generated/ast.js";

export class CadScriptScopeProvider implements ScopeProvider {
  private _astNodeDescriptionProvider: AstNodeDescriptionProvider;
  private _defaultProvider: DefaultScopeProvider;

  constructor(services: LangiumServices) {
    this._defaultProvider = new DefaultScopeProvider(services);
    this._astNodeDescriptionProvider =
      services.workspace.AstNodeDescriptionProvider;
  }
  getScope(context: ReferenceInfo): Scope {
    if (isImportArg(context.container) && context.property == "param") {
      return this.handleImportArg(context.container);
    }
    return this._defaultProvider.getScope(context);
  }

  private handleImportArg(importArg: ImportArg): Scope {
    const importStmt = AstUtils.getContainerOfType(importArg, isPartialImport)!;

    const model = AstUtils.getContainerOfType(importArg, isModel)!;

    //find sketch
    const sketch = model.sketches.find(
      (s) => s.name === importStmt.partial.$refText
    );
    if (typeof sketch === "undefined") return EMPTY_SCOPE;

    const descriptions = sketch.paramDefs.map((pd) =>
      this._astNodeDescriptionProvider.createDescription(pd, pd.param.name)
    );

    return new MapScope(descriptions);
  }
}
