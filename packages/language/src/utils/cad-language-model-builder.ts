import {
  assertPresent,
  EntityRepository,
  isPresent,
  SGArc,
  SGArcRef,
  SGCircle,
  SGCircleRef,
  SGConstraint,
  SGEntity,
  SGLine,
  SGLineRef,
  SGPoint,
  SGPointRef,
  SGRefBase,
  SimpleGeometryData,
  SimpleGeometryDescription,
} from "@cadscript/shared";
import {
  Arc,
  ArcRef,
  Circle,
  CircleRef,
  Constraint,
  isAngleConstraint,
  isArc,
  isCircle,
  isCoincidentConstraint,
  isConstraint,
  isDistanceConstraint,
  isExactCoordinate,
  isHelperDecorator,
  isLine,
  isLineDistanceConstraint,
  isLoop,
  isParallelConstraint,
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
  Line,
  LineRef,
  Loop,
  Model,
  Point,
  PointRef,
  SketchDefinition,
} from "../generated/ast.js";
import { CadScriptArgList, CadScriptContext } from "./cad-language-context.js";

export class SimpleGeometryDescriptionBuilder {
  private _entities: EntityRepository<SimpleGeometryData>;
  private _modelName: string;
  private _processSuccess: boolean = false;
  private _anonCounter: number = 0;

  private constructor() {
    this._entities = new EntityRepository<SimpleGeometryData>();
    this._modelName = "";
  }

  public static process(model: Model): SimpleGeometryDescriptionBuilder {
    const builder = new SimpleGeometryDescriptionBuilder();
    builder._processModel(model);
    return builder;
  }

  public getDescription(): SimpleGeometryDescription | undefined {
    if (!this._processSuccess) return;

    return {
      modelName: this._modelName,
      data: this._entities.getEntities(),
    };
  }

  private _processModel(model: Model) {
    const mainSketch = model.sketches.find((sk) => !sk.partial);
    if (!isPresent(mainSketch)) return;

    this._modelName = mainSketch.name;

    /**
     * Here I use the fact, that the language is hierarchic:
     *  - Points do not refer to anything
     *  - Other Entities refer to points
     *  - Constraints refer to points and entities
     * This way I can safely build up lookup tables in three passes
     */

    const rootContext = CadScriptContext.getContainer(model);
    this._processContainerRecursive(mainSketch, rootContext, "points");
    this._processContainerRecursive(mainSketch, rootContext, "entities");
    this._processContainerRecursive(mainSketch, rootContext, "constraints");

    this._processSuccess = true;
  }

  private _processContainerRecursive(
    container: SketchDefinition | Loop,
    ctx: CadScriptContext,
    target: "points" | "entities" | "constraints",
    args: CadScriptArgList = CadScriptContext.emptyArgs()
  ) {
    // add default parameters to context if container is Sketch
    if (isSketchDefinition(container)) {
      container.paramDefs.forEach((def) => {
        ctx.setVar(def.param.name, def.defVal);
      });
    }
    // override default values from arguments
    ctx.setArgs(args);

    // ctx.print(console.log);

    container.statements.forEach((stmt) => {
      // recursive logic

      if (isLoop(stmt)) {
        const start = Math.min(stmt.start, stmt.end);
        const end = Math.max(stmt.start, stmt.end);

        for (let i = start; i <= end; i++) {
          const loopCtx = ctx.getChild(stmt)!;
          if (typeof loopCtx === "undefined") {
            throw new Error(
              "Recursive loop statement found during model building"
            );
          }
          loopCtx.setVar(stmt.loopParam.name, i);
          this._processContainerRecursive(stmt, loopCtx, target);
        }
      }

      if (isPartialImport(stmt) && isPresent(stmt.partial.ref)) {
        const importContext = ctx.getChild(stmt, stmt.name);
        if (typeof importContext === "undefined") {
          throw new Error(
            "Recursive import statement found during model building"
          );
        }
        const args = new Map<string, number>();

        stmt.args.forEach((importArg) => {
          if (typeof importArg.param !== "undefined") {
            args.set(importArg.param.$refText, ctx.eval(importArg.value));
          }
        });

        this._processContainerRecursive(
          stmt.partial.ref,
          importContext,
          target,
          args
        );
      }

      // simple logic

      if (isPoint(stmt) && target === "points") {
        this._processPoint(stmt, ctx);
      }

      if (isLine(stmt) && target === "entities") {
        this.processLine(stmt, ctx);
      }

      if (isCircle(stmt) && target === "entities") {
        this.processCircle(stmt, ctx);
      }

      if (isArc(stmt) && target === "entities") {
        this.processArc(stmt, ctx);
      }

      if (isConstraint(stmt) && target === "constraints") {
        this.processConstraint(stmt, ctx);
      }
    });
  }

  private _processPoint(p: Point, ctx: CadScriptContext): void {
    const fqdn = isPresent(p.name) ? ctx.fqdnName(p.name) : this.getAnonFqdn();

    const pointDescriptor: SGEntity = {
      type: "POINT",
      isLocked: false,
      helper:
        p.decorators.findIndex((d) => {
          return isHelperDecorator(d.type);
        }) !== -1,
      id: fqdn,
    };

    if (isPresent(p.coordinates)) {
      if (isExactCoordinate(p.coordinates)) {
        pointDescriptor.isLocked = true;
      }
      pointDescriptor.posX = ctx.evalLength(p.coordinates.x);
      pointDescriptor.posY = ctx.evalLength(p.coordinates.y);
    }

    this._entities.add(fqdn, pointDescriptor);
  }

  private lookUpPoint(
    ref: PointRef | undefined,
    ctx: CadScriptContext
  ): SGPointRef | undefined {
    if (!isPresent(ref)) {
      const fqdn = this.getAnonFqdn();
      //create new Anonym Point in entity
      const pointDescriptor: SGPoint = {
        type: "POINT",
        id: fqdn,
        helper: true,
        isLocked: false,
      };

      const { index } = this._entities.add(fqdn, pointDescriptor);

      return {
        id: fqdn,
        type: "POINT",
        index: index,
      };
    }

    if (isPresent(ref.coordinates)) {
      const fqdn = this.getAnonFqdn();
      //create new Anonym Point in entity
      const pointDescriptor: SGPoint = {
        type: "POINT",
        id: fqdn,
        helper: true,
        isLocked: isExactCoordinate(ref.coordinates),
        posX: ctx.evalLength(ref.coordinates.x),
        posY: ctx.evalLength(ref.coordinates.y),
      };

      const { index } = this._entities.add(fqdn, pointDescriptor);

      return {
        id: fqdn,
        type: "POINT",
        index: index,
      };
    }

    if (isPresent(ref.regularRef)) {
      const fqdn = ctx.fqdnName(ref.regularRef.$refText);
      const point = this._entities.lookup(fqdn);

      if (!isPresent(point))
        throw new Error(`Can not find Point ${fqdn} in entity repository`);

      return {
        id: fqdn,
        type: "POINT",
        index: point.index,
      };
    }

    if (isPresent(ref.dynamicRef)) {
      const fqdn = ctx.fqdnName(ref.dynamicRef);
      const point = this._entities.lookup(fqdn);

      if (!isPresent(point))
        throw new Error(`Can not find Point ${fqdn} in entity repository`);

      return {
        id: fqdn,
        type: "POINT",
        index: point.index,
      };
    }

    throw new Error(`Unkown PointRef found`);
  }

  private lookUpEntity(
    ref: LineRef | CircleRef | ArcRef,
    ctx: CadScriptContext,
    type: "CIRCLE" | "LINE" | "ARC"
  ): SGRefBase {
    if (isPresent(ref.regularRef)) {
      const fqdn = ctx.fqdnName(ref.regularRef.$refText);
      const entity = this._entities.lookup(fqdn);

      if (!isPresent(entity))
        throw new Error(`Can not find Entity ${fqdn} in entity repository`);

      return {
        id: fqdn,
        type: type,
        index: entity.index,
      };
    }

    if (isPresent(ref.dynamicRef)) {
      const fqdn = ctx.fqdnName(ref.dynamicRef);
      const point = this._entities.lookup(fqdn);

      if (!isPresent(point))
        throw new Error(`Can not find Point ${fqdn} in entity repository`);

      return {
        id: fqdn,
        type: type,
        index: point.index,
      };
    }

    throw new Error(`Unkown PointRef found`);
  }

  private getAnonFqdn = () => `<anon>${this._anonCounter++}`;

  /**
   * Processes a Line AST node into a simplified description.
   * Creates the necessar constraints if lenght or baseLine is given in the node
   */
  private processLine(line: Line, ctx: CadScriptContext): void {
    const fqdn = isPresent(line.name)
      ? ctx.fqdnName(line.name)
      : this.getAnonFqdn();
    //resolve first point
    const iP1 = this.lookUpPoint(line.from, ctx)!;
    const iP2 = this.lookUpPoint(line.to, ctx)!;

    const lineDescription: SGLine = {
      id: fqdn,
      type: "LINE",
      helper:
        line.decorators.findIndex((d) => {
          return isHelperDecorator(d.type);
        }) !== -1,
      p1: iP1,
      p2: iP2,
    };

    const lineRef = this._entities.add(fqdn, lineDescription);

    // ADD Lenght Constraint if needed
    if (typeof line.length !== "undefined") {
      const lenght = ctx.evalLength(line.length);
      const lengthConstraint: SGConstraint = {
        type: "P2P_DISTANCE",
        p1: iP1,
        p2: iP2,
        d: lenght,
      };
      this._entities.add(this.getAnonFqdn(), lengthConstraint);
    }

    // Addd horizontal constraint if necessary
    if (typeof line.direction !== "undefined") {
      this._entities.add(this.getAnonFqdn(), {
        type: "DIRECTION",
        d: line.direction === "horizontal" ? "HORIZONTAL" : "VERTICAL",
        l: {
          id: lineRef.fqdn,
          index: lineRef.index,
          type: "LINE",
        },
      });
    }
  }

  /**
   * Processes a Circle AST node into a simplified description.
   * Creates the necessar constraints if the Radius is given in the node
   */
  private processCircle(circle: Circle, ctx: CadScriptContext): void {
    //resolve first point
    const iCenter = this.lookUpPoint(circle.center, ctx)!;

    const fqdn = isPresent(circle.name)
      ? ctx.fqdnName(circle.name)
      : this.getAnonFqdn();

    const circleDescriptor: SGCircle = {
      type: "CIRCLE",
      center: iCenter,
      helper:
        circle.decorators.findIndex((d) => {
          return isHelperDecorator(d.type);
        }) !== -1,
      id: fqdn,
    };

    const ref = this._entities.add(fqdn, circleDescriptor);

    // ADD Radius Constraint if needed
    if (isPresent(circle.dimension)) {
      this._entities.add(this.getAnonFqdn(), {
        type: "CIRCLE_RADIUS",
        r: ctx.evalLinearDimension(circle.dimension),
        c: {
          type: "CIRCLE",
          id: fqdn,
          index: ref.index,
        },
      });
    }
  }

  private processArc(arc: Arc, ctx: CadScriptContext): void {
    const istart = this.lookUpPoint(arc.start, ctx)!;
    const iEnd = this.lookUpPoint(arc.end, ctx)!;
    const iCenter = this.lookUpPoint(arc.center, ctx)!;

    const fqdn = isPresent(arc.name)
      ? ctx.fqdnName(arc.name)
      : this.getAnonFqdn();

    const arcDescriptor: SGArc = {
      type: "ARC",
      id: fqdn,
      start: istart,
      center: iCenter,
      end: iEnd,
      helper:
        arc.decorators.findIndex((d) => {
          return isHelperDecorator(d.type);
        }) !== -1,
    };

    const ref = this._entities.add(fqdn, arcDescriptor);

    // ADD Radius Constraint if needed
    if (isPresent(arc.dimension)) {
      this._entities.add(this.getAnonFqdn(), {
        type: "ARC_RADIUS",
        r: ctx.evalLinearDimension(arc.dimension),
        c: {
          type: "ARC",
          id: fqdn,
          index: ref.index,
        },
      });
    }
  }

  private processConstraint(
    constraint: Constraint,
    ctx: CadScriptContext
  ): void {
    if (isSameLengthCosntraint(constraint)) {
      const l1 = this.lookUpEntity(constraint.l1, ctx, "LINE") as SGLineRef;
      const l2 = this.lookUpEntity(constraint.l2, ctx, "LINE") as SGLineRef;

      assertPresent(l1, l2);
      this._entities.add(this.getAnonFqdn(), {
        type: "SAMELENGTH",
        l1: l1,
        l2: l2,
      });
    }

    if (isPerpendicularConstraint(constraint)) {
      const l1 = this.lookUpEntity(constraint.l1, ctx, "LINE") as SGLineRef;
      const l2 = this.lookUpEntity(constraint.l2, ctx, "LINE") as SGLineRef;

      assertPresent(l1, l2);
      this._entities.add(this.getAnonFqdn(), {
        type: "PERPENDICULAR",
        l1: l1,
        l2: l2,
      });
    }

    if (isParallelConstraint(constraint)) {
      const l1 = this.lookUpEntity(constraint.l1, ctx, "LINE") as SGLineRef;
      const l2 = this.lookUpEntity(constraint.l2, ctx, "LINE") as SGLineRef;

      assertPresent(l1, l2);
      this._entities.add(this.getAnonFqdn(), {
        type: "PARALLEL",
        l1: l1,
        l2: l2,
      });
    }

    if (isAngleConstraint(constraint)) {
      const l1 = this.lookUpEntity(constraint.l1, ctx, "LINE") as SGLineRef;
      const l2 = this.lookUpEntity(constraint.l2, ctx, "LINE") as SGLineRef;
      const angle = ctx.evalAngle(constraint.angle);
      assertPresent(l1, l2);
      this._entities.add(this.getAnonFqdn(), {
        type: "ANGLE",
        l1: l1,
        l2: l2,
        a: angle,
      });
    }

    if (isDistanceConstraint(constraint)) {
      const p1 = this.lookUpPoint(constraint.p1, ctx)!;
      const p2 = this.lookUpPoint(constraint.p2, ctx)!;
      const distance = ctx.evalLength(constraint.distance);
      assertPresent(p1, p2);
      this._entities.add(this.getAnonFqdn(), {
        type: "P2P_DISTANCE",
        p1: p1,
        p2: p2,
        d: distance,
      });
    }

    if (isCoincidentConstraint(constraint)) {
      const p1 = this.lookUpPoint(constraint.p1, ctx)!;
      const p2 = this.lookUpPoint(constraint.p2, ctx)!;
      assertPresent(p1, p2);
      this._entities.add(this.getAnonFqdn(), {
        type: "COINCIDENT",
        p1: p1,
        p2: p2,
      });
    }

    if (isLineDistanceConstraint(constraint)) {
      const p = this.lookUpPoint(constraint.p, ctx)!;
      const l = this.lookUpEntity(constraint.l, ctx, "LINE") as SGLineRef;
      const distance = ctx.evalLength(constraint.distance);
      assertPresent(p, l);
      this._entities.add(this.getAnonFqdn(), {
        type: "P2L_Distance",
        p: p,
        l: l,
        d: distance,
      });
    }

    if (isTangentConstraint(constraint)) {
      const l = this.lookUpEntity(constraint.l, ctx, "LINE") as SGLineRef;
      const a = this.lookUpEntity(constraint.a, ctx, "ARC") as SGArcRef;

      assertPresent(a, l);
      this._entities.add(this.getAnonFqdn(), {
        type: "TANGENT",
        a: a,
        l: l,
      });
    }

    if (isPointOnConstraint(constraint)) {
      const p = this.lookUpPoint(constraint.ptConstrain.p, ctx)!;
      if (isPointOnLine(constraint.ptConstrain)) {
        const l = this.lookUpEntity(
          constraint.ptConstrain.l,
          ctx,
          "LINE"
        ) as SGLineRef;

        assertPresent(p, l);
        this._entities.add(this.getAnonFqdn(), {
          type: "P_ON_L",
          p: p,
          l: l,
          midpoint: isPresent(constraint.ptConstrain.bisect),
        });
      }

      if (isPointOnCircle(constraint.ptConstrain)) {
        const c = this.lookUpEntity(
          constraint.ptConstrain.c,
          ctx,
          "CIRCLE"
        ) as SGCircleRef;

        assertPresent(p, c);
        this._entities.add(this.getAnonFqdn(), {
          type: "P_ON_C",
          p: p,
          c: c,
        });
      }
      if (isPointOnArc(constraint.ptConstrain)) {
        const a = this.lookUpEntity(
          constraint.ptConstrain.a,
          ctx,
          "ARC"
        ) as SGArcRef;

        assertPresent(p, a);
        this._entities.add(this.getAnonFqdn(), {
          type: "P_ON_A",
          p: p,
          a: a,
        });
      }
    }
  }
}
