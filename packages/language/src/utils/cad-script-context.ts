import { AstNode } from "langium";
import {
  AngleMeasurement,
  CadLangID,
  Expression,
  InterpolatedStringID,
  isBinExpr,
  isDiameter,
  isExpression,
  isFuncExpr,
  isGroup,
  isInterpolatedStringID,
  isInterpolatedStringPart,
  isLit,
  isNegExpr,
  isNormalID,
  isRadius,
  isRef,
  LengthMeasurement,
  LinearDimension,
} from "../generated/ast.js";
import { MeasurementCompuitation } from "./cad-script-measurement.js";

export type CadScriptArgList = Map<string, number>;

export class CadScriptContext {
  private _containers: Set<AstNode>;
  private _variables: Map<string, number>;
  private _prefixes: string[];

  private constructor() {
    this._variables = new Map<string, number>();
    this._containers = new Set<AstNode>();
    this._prefixes = [];
  }

  public static getContainer(baseContainer?: AstNode): CadScriptContext {
    const ctx = new CadScriptContext();
    if (typeof baseContainer !== "undefined")
      ctx._containers.add(baseContainer);
    return ctx;
  }

  public static emptyArgs(): CadScriptArgList {
    return new Map<string, number>();
  }

  public setVar(name: string, value: number | Expression) {
    if (isExpression(value)) {
      this._variables.set(name, this.eval(value));
    } else {
      this._variables.set(name, value);
    }
  }

  public print(log: (log: string) => void) {
    log(`Context depth: ${this._containers.size}`);
    this._variables.forEach((val, key) => {
      log(`[${key} -> ${val}]`);
    });
    log(`_____________________________________`);
  }

  public setArgs(args: CadScriptArgList) {
    args.forEach((val, key) => {
      this._variables.set(key, val);
    });
  }

  public eval(exp: Expression): number {
    if (isLit(exp)) {
      return exp.val;
    }

    if (isRef(exp)) {
      const v = this._variables.get(exp.val.$refText);
      if (v !== undefined) {
        return v;
      } else {
        console.error(`Could not find reference for ${exp.val.$refText}`);
        return NaN;
      }
    }

    if (isBinExpr(exp)) {
      const opval = exp.op;

      let v1 = this.eval(exp.e1);
      let v2 = this.eval(exp.e2);

      try {
        switch (opval) {
          case "+":
            return v1 + v2;
          case "-":
            return v1 - v2;
          case "*":
            return v1 * v2;
          case "/":
            return v1 / v2;
        }
      } catch (e) {
        console.error(e);
        return NaN;
      }
    }

    if (isNegExpr(exp)) {
      return -1 * this.eval(exp.ne);
    }

    if (isGroup(exp)) {
      return this.eval(exp.ge);
    }

    if (isFuncExpr(exp)) {
      try {
        const args = exp.args.map((e) => this.eval(e));

        switch (exp.func) {
          case "PI":
            return Math.PI;
          case "cos":
            return Math.cos(args[0]);
          case "sin":
            return Math.sin(args[0]);
          case "tan":
            return Math.tan(args[0]);
          case "mod":
            return args[0] % args[1];
          case "pow":
            return Math.pow(args[0], args[1]);
        }
      } catch (e) {
        console.error(e);
        return NaN;
      }
    }

    //throw new Error('Cannot evaluate expression. Unkown expression type')
    return NaN;
  }

  public interpolate(id: InterpolatedStringID): string {
    return id.parts
      .map((part) => {
        if (isInterpolatedStringPart(part)) {
          return this.eval(part.exp).toString();
        } else {
          return part;
        }
      })
      .join("");
  }

  /**
   * Creates a clone of the context, with an additional entry in the container list.
   * Returns undefined if it detects circular container references.
   *
   * Also updates the prefix path
   */
  public getChild(
    container: AstNode,
    prefix?: string
  ): CadScriptContext | undefined {
    // this happens when there is an infinte recursion in containers
    if (this._containers.has(container)) {
      //console.error('Recursive context found');
      return undefined;
    }

    const ctx = new CadScriptContext();

    // copy container nodes & add new one to list
    for (const node of this._containers.values()) {
      ctx._containers.add(node);
    }
    ctx._containers.add(container);

    // copy variables
    this._variables.forEach((value, key) => {
      ctx._variables.set(key, value);
    });

    //copy prefix path
    ctx._prefixes = [...this._prefixes];

    if (typeof prefix !== "undefined") ctx._prefixes.push(prefix);

    return ctx;
  }

  public needsPrefix(): boolean {
    return this._prefixes.length > 0;
  }

  public prefixName(name: string): string {
    if (!this.needsPrefix()) return name;

    return `${this._prefixes.join("->")}->${name}`;
  }

  public fqdnName(id: CadLangID | string) {
    if (typeof id === "string") {
      return this.prefixName(id);
    }
    if (isNormalID(id)) {
      return this.prefixName(id.id);
    }
    if (isInterpolatedStringID(id)) {
      return this.prefixName(this.interpolate(id));
    }
    return "";
  }

  evalLength(lenght: LengthMeasurement) {
    const val = this.eval(lenght.value);
    return MeasurementCompuitation.convertToMM(val, lenght.unit || "mm");
  }

  evalAngle(angle: AngleMeasurement) {
    const val = this.eval(angle.value);
    if (angle.unit == "rad") {
      return MeasurementCompuitation.convertToDeg(val);
    } else {
      return val;
    }
  }

  evalLinearDimension(dim: LinearDimension) {
    if (isRadius(dim)) {
      return this.evalLength(dim.r);
    } else if (isDiameter(dim)) {
      return this.evalLength(dim.d) / 2;
    }
    return NaN;
  }
}
