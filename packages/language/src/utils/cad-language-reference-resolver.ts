import { AstNode } from "langium";
import {
  Entity,
  isEntity,
  isInterpolatedStringID,
  isLoop,
  isPartialImport,
  Loop,
  Model,
  PartialImport,
  SketchDefinition,
} from "../generated/ast.js";
import { CadScriptContext, CadScriptArgList } from "./cad-language-context.js";
import { isPresent } from "@cadscript/shared";

export interface EntityDescription {
  node: AstNode;
  name: string;
}

const createDescription = (node: AstNode, name: string): EntityDescription => {
  return {
    node,
    name,
  };
};

export class CadLanguageNextReferenceResolver {
  private _sketchRef: Map<string, SketchDefinition>;

  constructor(model: Model) {
    this._sketchRef = new Map<string, SketchDefinition>();
    for (const sketch of model.sketches) {
      this._sketchRef.set(sketch.name, sketch);
    }
  }

  public getSketchNamedEntites(
    sketch: SketchDefinition,
    ctx: CadScriptContext,
    args: CadScriptArgList
  ): EntityDescription[] {
    const entities: EntityDescription[] = [];

    // Check for Circular references
    if (typeof ctx === "undefined") return [];
    // set sketch params and default values
    sketch.paramDefs
      .filter((def) => {
        return isPresent(def.param) && isPresent(def.defVal);
      })
      .forEach((def) => {
        ctx.setVar(def.param.name, def.defVal);
      });
    // override default values from arguments
    ctx.setArgs(args);

    sketch.statements.forEach((stmt) => {
      try {
        // normal entity
        if (isEntity(stmt) && typeof stmt.name !== "undefined") {
          entities.push(this.handleEntityStatement(stmt, ctx));
        }

        // loop statement
        if (isLoop(stmt)) {
          entities.push(...this.handleLoopStatement(stmt, ctx));
        }

        // import statement
        if (isPartialImport(stmt)) {
          entities.push(...this.handleImportStatement(stmt, ctx));
        }
      } catch (error) {
        console.error(error);
      }
    });

    return entities;
  }

  private handleEntityStatement(
    entity: Entity,
    ctx: CadScriptContext
  ): EntityDescription {
    let name = "";
    if (isInterpolatedStringID(entity.name)) {
      name = ctx.interpolate(entity.name);
    } else {
      name = entity.name?.id || "<errror#1>";
    }
    0;
    return createDescription(entity, ctx.prefixName(name));
  }

  private handleLoopStatement(
    loop: Loop,
    ctx: CadScriptContext
  ): EntityDescription[] {
    const start = Math.min(loop.start, loop.end);
    const end = Math.max(loop.start, loop.end);
    const entities: EntityDescription[] = [];

    for (let i = start; i <= end; i++) {
      const loopCtx = ctx.getChild(loop);

      if (typeof loopCtx === "undefined") {
        //this should never happen
        return entities;
      }

      loopCtx.setVar(loop.loopParam.name, i);

      loop.statements.forEach((stmt) => {
        // in a loop only handle entity and nested loop statement

        // normal entity
        if (isEntity(stmt) && typeof stmt.name !== "undefined") {
          entities.push(this.handleEntityStatement(stmt, loopCtx));
        }

        if (isLoop(stmt)) {
          entities.push(...this.handleLoopStatement(stmt, loopCtx));
        }
      });
    }

    return entities;
  }

  private handleImportStatement(
    stmt: PartialImport,
    ctx: CadScriptContext
  ): EntityDescription[] {
    const entities: EntityDescription[] = [];
    if (!isPresent(stmt.partial)) return [];
    const sketch = this._sketchRef.get(stmt.partial.$refText);

    if (typeof sketch === "undefined") {
      console.error(`Cannot find sketch ${stmt.partial.$refText}`);
      return [];
    }

    const importContext = ctx.getChild(sketch, stmt.name);
    if (typeof importContext === "undefined") {
      return [];
    }

    const args = new Map<string, number>();

    stmt.args.forEach((importArg) => {
      if (typeof importArg.param !== "undefined") {
        args.set(importArg.param.$refText, ctx.eval(importArg.value));
      }
    });

    entities.push(...this.getSketchNamedEntites(sketch, importContext, args));

    return entities;
  }
}
