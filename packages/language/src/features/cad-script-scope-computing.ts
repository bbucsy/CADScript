import { isPresent } from "@cadscript/shared";
import {
  AstNodeDescription,
  DefaultScopeComputation,
  LangiumDocument,
  PrecomputedScopes,
} from "langium";
import { LangiumServices } from "langium/lsp";
import { CancellationToken } from "vscode-languageserver";
import { SketchDefinition, Model } from "../generated/ast.js";
import { CadScriptContext } from "../utils/cad-script-context.js";
import { CadScriptReferenceResolver } from "../utils/cad-script-reference-resolver.js";

export class CadScriptScopeComputation extends DefaultScopeComputation {
  private _sketchRef: Map<string, SketchDefinition>;

  constructor(services: LangiumServices) {
    super(services);
    this._sketchRef = new Map<string, SketchDefinition>();
  }

  override async computeLocalScopes(
    document: LangiumDocument,
    cancelToken?: CancellationToken
  ): Promise<PrecomputedScopes> {
    const scopes = await super.computeLocalScopes(document, cancelToken);
    const model = document.parseResult.value as Model;
    const refResolver = new CadScriptReferenceResolver(model);

    // populate local sketchRef
    this._sketchRef.clear();
    for (const sketch of model.sketches) {
      this._sketchRef.set(sketch.name, sketch);
    }

    // handle sketch scope for each sketch
    for (const sketch of model.sketches) {
      // add Paramaters to scope
      scopes.addAll(sketch, this.getParameterDescriptions(sketch));

      const namedEntities = refResolver.getSketchNamedEntites(
        sketch,
        CadScriptContext.getContainer(model),
        CadScriptContext.emptyArgs()
      );

      const descriptions = namedEntities
        .filter((n) => n.name !== "")
        .map((ne) => {
          return this.descriptions.createDescription(
            ne.node,
            ne.name,
            document
          );
        });

      scopes.addAll(sketch, descriptions);
    }

    return scopes;
  }

  private getParameterDescriptions(
    sketch: SketchDefinition
  ): AstNodeDescription[] {
    return sketch.paramDefs
      .filter((paramDef) => {
        return isPresent(paramDef.param) && isPresent(paramDef.defVal);
      })
      .map((paramDef) => {
        return this.descriptions.createDescription(
          paramDef.param,
          paramDef.param.name
        );
      });
  }

  // gets list of NodeDescriptions for a given sketch in a given context
}
