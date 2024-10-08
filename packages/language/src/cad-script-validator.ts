import {
  AstUtils,
  type ValidationAcceptor,
  type ValidationChecks,
} from "langium";
import {
  ArcRef,
  CadScriptAstType,
  CircleRef,
  isAngleConstraint,
  isArc,
  isCircle,
  isCoincidentConstraint,
  isDistanceConstraint,
  isInterpolatedStringID,
  isLine,
  isLineDistanceConstraint,
  isLoop,
  isParallelConstraint,
  isParameterDefinition,
  isPartialImport,
  isPerpendicularConstraint,
  isPoint,
  isPointOnArc,
  isPointOnCircle,
  isPointOnConstraint,
  isPointOnLine,
  isSameLengthCosntraint,
  isSketchDefinition,
  isTangentConstraint,
  LineRef,
  Loop,
  Model,
  PartialImport,
  PointRef,
  Ref,
  SketchDefinition,
} from "./generated/ast.js";

import { CadScriptContext } from "./utils/cad-language-context.js";
import {
  CadLanguageNextReferenceResolver,
  EntityDescription,
} from "./utils/cad-language-reference-resolver.js";
import { isPresent, popFirstFromSet } from "@cadscript/shared";
import { CadScriptServices } from "./cad-script-module.js";

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: CadScriptServices) {
  const registry = services.validation.ValidationRegistry;
  const validator = services.validation.CadScriptValidator;
  const checks: ValidationChecks<CadScriptAstType> = {
    Ref: [validator.checkInterpolationNotContainsParameter],
    Model: [
      validator.checkMainSketch,
      validator.checkSketchNameUnique,
      validator.checkDynamicReferences,
    ],
    SketchDefinition: [
      validator.checkEntityNamesUnique,
      validator.checkImportNamesUnique,
    ],
    PartialImport: [
      validator.checkImportRefersToPartial,
      validator.checkImportNotInLoop,
      validator.checkRecursiveImport,
    ],
  };
  registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */

export class CadScriptValidator {
  checkMainSketch(model: Model, accept: ValidationAcceptor): void {
    // if the model is empty, then its all ok
    if (model.sketches.length === 0) return;

    // otherwise there must be exactly one main sketch (non partial)
    const mainSketches = model.sketches.filter((s) => !s.partial);
    const numMain = mainSketches.length;

    // if there is no main sketch pt error to first sketch
    if (numMain === 0) {
      accept("error", "Each file must contain 1 main sketch", {
        node: model.sketches[0],
        property: "partial",
      });
    } else if (numMain > 1) {
      mainSketches.forEach((sketch, idx) => {
        if (idx !== 0) {
          accept("error", "Each file must contain exactly 1 main sketch", {
            node: sketch,
            property: "name",
          });
        }
      });
    }
  }

  checkSketchNameUnique(model: Model, accept: ValidationAcceptor): void {
    const sketchNames = new Set();
    model.sketches.forEach((sketch) => {
      if (sketchNames.has(sketch.name)) {
        accept("error", `Sketch has non unique name '${sketch.name}'`, {
          node: sketch,
          property: "name",
        });
      }
      sketchNames.add(sketch.name);
    });
  }

  checkEntityNamesUnique(sketch: SketchDefinition, accept: ValidationAcceptor) {
    const refResolver = new CadLanguageNextReferenceResolver(sketch.$container);

    const entities = refResolver.getSketchNamedEntites(
      sketch,
      CadScriptContext.getContainer(sketch),
      CadScriptContext.emptyArgs()
    );

    // TODO: REmove polyfill by providing better TSConfig
    const findLastIndex = <T>(
      list: T[],
      predicate: (value: T) => boolean
    ): number => {
      for (let i = list.length - 1; i >= 0; i--) {
        if (predicate(list[i])) {
          return i;
        }
      }
      return -1;
    };

    const duplicates = entities.filter((entity, idx) => {
      return (
        findLastIndex(
          entities,
          (e: EntityDescription) => e.name === entity.name
        ) !== idx
      );
    });

    duplicates.forEach((d) => {
      accept(
        "error",
        `Duplicate entity named ${d.name} found in a single sketch scope`,
        {
          node: d.node,
          property: "name",
        }
      );
    });
  }

  checkImportNamesUnique(
    sketch: SketchDefinition,
    accept: ValidationAcceptor
  ): void {
    const usedNames = new Set<string>();

    sketch.statements.filter(isPartialImport).forEach((stmt) => {
      if (usedNames.has(stmt.name)) {
        accept("error", `Import has non unique name: '${stmt.name}'`, {
          node: stmt,
          property: "name",
        });
      }
      usedNames.add(stmt.name);
    });
  }

  checkInterpolationNotContainsParameter(ref: Ref, accept: ValidationAcceptor) {
    const parameter = ref.val.ref;
    if (typeof parameter === "undefined") return;

    if (
      isParameterDefinition(parameter.$container) &&
      AstUtils.hasContainerOfType(ref, isInterpolatedStringID)
    ) {
      accept("error", `Cannot use sketch parameters in interpolated strings`, {
        node: ref,
        property: "val",
      });
    }
  }

  checkDynamicReferences(model: Model, accept: ValidationAcceptor): void {
    const rootCtx = CadScriptContext.getContainer(model);
    const refResolver = new CadLanguageNextReferenceResolver(model);

    for (const sketch of model.sketches) {
      const scope = refResolver.getSketchNamedEntites(
        sketch,
        rootCtx,
        CadScriptContext.emptyArgs()
      );

      this._handleContainer(sketch, rootCtx, scope, accept);
    }
  }

  checkImportRefersToPartial(
    importStmt: PartialImport,
    accept: ValidationAcceptor
  ) {
    if (
      isPresent(importStmt.partial) &&
      isPresent(importStmt.partial.ref) &&
      isSketchDefinition(importStmt.partial.ref) &&
      !importStmt.partial.ref.partial
    ) {
      accept(
        "error",
        `Cannot import non partial sketch '${importStmt.partial.$refText}'`,
        {
          node: importStmt,
          property: "partial",
        }
      );
    }
  }

  checkImportNotInLoop(importStmt: PartialImport, accept: ValidationAcceptor) {
    if (isLoop(importStmt.$container)) {
      accept("error", `Import cannot be used inside of a loop`, {
        node: importStmt,
      });
    }
  }

  checkRecursiveImport(importStmt: PartialImport, accept: ValidationAcceptor) {
    const referencedSketches = new Set<SketchDefinition>();
    const parentSketch = importStmt.$container;
    if (!isSketchDefinition(parentSketch)) return;
    if (!isPresent(importStmt.partial)) return;

    const targetSketch = importStmt.partial.ref;
    if (!isPresent(targetSketch)) return;

    const visitable = new Set(
      targetSketch.statements
        .filter(isPartialImport)
        .filter((stmt) => isPresent(stmt.partial))
        .map((stmt) => stmt.partial.ref)
        .filter(isPresent)
    );

    while (visitable.size > 0) {
      const current = popFirstFromSet(visitable);
      if (!isPresent(current)) return;
      referencedSketches.add(current);

      if (current === parentSketch) {
        accept("error", "Circular dependency detected", {
          node: importStmt,
          property: "partial",
        });
      }

      current.statements
        .filter(isPartialImport)
        .filter((stmt) => isPresent(stmt.partial))
        .map((stmt) => stmt.partial.ref)
        .filter(isPresent)
        .filter((sketch) => !referencedSketches.has(sketch))
        .forEach((sketch) => {
          visitable.add(sketch);
        });
    }
  }

  private _handleContainer(
    container: SketchDefinition | Loop,
    ctx: CadScriptContext,
    scope: EntityDescription[],
    accept: ValidationAcceptor
  ) {
    container.statements.forEach((stmt) => {
      if (isLine(stmt)) {
        this._checkPointRef(stmt.from, ctx, scope, accept);
        this._checkPointRef(stmt.to, ctx, scope, accept);
      }

      if (isCircle(stmt)) {
        this._checkPointRef(stmt.center, ctx, scope, accept);
      }

      if (isArc(stmt)) {
        this._checkPointRef(stmt.start, ctx, scope, accept);
        this._checkPointRef(stmt.center, ctx, scope, accept);
        this._checkPointRef(stmt.end, ctx, scope, accept);
      }

      if (isDistanceConstraint(stmt)) {
        this._checkPointRef(stmt.p1, ctx, scope, accept);
        this._checkPointRef(stmt.p2, ctx, scope, accept);
      }

      if (isSameLengthCosntraint(stmt)) {
        this._checkLineRef(stmt.l1, ctx, scope, accept);
        this._checkLineRef(stmt.l2, ctx, scope, accept);
      }

      if (isPerpendicularConstraint(stmt)) {
        this._checkLineRef(stmt.l1, ctx, scope, accept);
        this._checkLineRef(stmt.l2, ctx, scope, accept);
      }

      if (isParallelConstraint(stmt)) {
        this._checkLineRef(stmt.l1, ctx, scope, accept);
        this._checkLineRef(stmt.l2, ctx, scope, accept);
      }

      if (isLineDistanceConstraint(stmt)) {
        this._checkPointRef(stmt.p, ctx, scope, accept);
        this._checkLineRef(stmt.l, ctx, scope, accept);
      }

      if (isAngleConstraint(stmt)) {
        this._checkLineRef(stmt.l1, ctx, scope, accept);
        this._checkLineRef(stmt.l2, ctx, scope, accept);
      }

      if (isPointOnConstraint(stmt)) {
        this._checkPointRef(stmt.ptConstrain.p, ctx, scope, accept);
        if (isPointOnLine(stmt.ptConstrain)) {
          this._checkLineRef(stmt.ptConstrain.l, ctx, scope, accept);
        }
        if (isPointOnCircle(stmt.ptConstrain)) {
          this._checkCircleRef(stmt.ptConstrain.c, ctx, scope, accept);
        }
        if (isPointOnArc(stmt.ptConstrain)) {
          this._checkArcRef(stmt.ptConstrain.a, ctx, scope, accept);
        }
      }

      if (isCoincidentConstraint(stmt)) {
        this._checkPointRef(stmt.p1, ctx, scope, accept);
        this._checkPointRef(stmt.p2, ctx, scope, accept);
      }

      if (isTangentConstraint(stmt)) {
        this._checkLineRef(stmt.l, ctx, scope, accept);
        this._checkArcRef(stmt.a, ctx, scope, accept);
      }

      ///HANDLE LOOP
      if (isLoop(stmt)) {
        const start = Math.min(stmt.start, stmt.end);
        const end = Math.max(stmt.start, stmt.end);
        for (let i = start; i <= end; i++) {
          const loopCtx = ctx.getChild(stmt)!;
          loopCtx.setVar(stmt.loopParam.name, i);

          this._handleContainer(stmt, loopCtx, scope, accept);
        }
      }
    });
  }

  private _checkPointRef(
    ref: PointRef | undefined,
    ctx: CadScriptContext,
    scope: EntityDescription[],
    accept: ValidationAcceptor
  ) {
    if (!isPresent(ref)) return;
    if (typeof ref.dynamicRef === "undefined") return;

    const refText = ctx.interpolate(ref.dynamicRef);

    const availablePointNames = scope
      .filter((entity) => {
        return isPoint(entity.node);
      })
      .map((entity) => entity.name);

    if (!availablePointNames.includes(refText)) {
      accept(
        "error",
        `Could not resolve dynamic reference to point: "${refText}"`,
        {
          node: ref,
          property: "dynamicRef",
        }
      );
    }
  }

  private _checkLineRef(
    ref: LineRef | undefined,
    ctx: CadScriptContext,
    scope: EntityDescription[],
    accept: ValidationAcceptor
  ) {
    if (!isPresent(ref)) return;
    if (typeof ref.dynamicRef === "undefined") return;

    const refText = ctx.interpolate(ref.dynamicRef);

    const availablePointNames = scope
      .filter((entity) => {
        return isLine(entity.node);
      })
      .map((entity) => entity.name);

    if (!availablePointNames.includes(refText)) {
      accept(
        "error",
        `Could not resolve dynamic reference to line: "${refText}"`,
        {
          node: ref,
          property: "dynamicRef",
        }
      );
    }
  }

  private _checkCircleRef(
    ref: CircleRef | undefined,
    ctx: CadScriptContext,
    scope: EntityDescription[],
    accept: ValidationAcceptor
  ) {
    if (!isPresent(ref)) return;
    if (typeof ref.dynamicRef === "undefined") return;

    const refText = ctx.interpolate(ref.dynamicRef);

    const availablePointNames = scope
      .filter((entity) => {
        return isCircle(entity.node);
      })
      .map((entity) => entity.name);

    if (!availablePointNames.includes(refText)) {
      accept(
        "error",
        `Could not resolve dynamic reference to Circle: "${refText}"`,
        {
          node: ref,
          property: "dynamicRef",
        }
      );
    }
  }

  private _checkArcRef(
    ref: ArcRef | undefined,
    ctx: CadScriptContext,
    scope: EntityDescription[],
    accept: ValidationAcceptor
  ) {
    if (!isPresent(ref)) return;
    if (typeof ref.dynamicRef === "undefined") return;

    const refText = ctx.interpolate(ref.dynamicRef);

    const availablePointNames = scope
      .filter((entity) => {
        return isArc(entity.node);
      })
      .map((entity) => entity.name);

    if (!availablePointNames.includes(refText)) {
      accept(
        "error",
        `Could not resolve dynamic reference to Arc: "${refText}"`,
        {
          node: ref,
          property: "dynamicRef",
        }
      );
    }
  }
}
