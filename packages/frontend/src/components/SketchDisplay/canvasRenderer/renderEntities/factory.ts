import { Drawable } from "@cadscript/shared";
import { Arc } from "./arc";
import { Line } from "./line";
import { Point } from "./point";
import { Circle } from "./circle";

export class RenderEntityFactory {
  private constructor() {}

  public static createEntity(prototype: Drawable) {
    switch (prototype.type) {
      case "POINT":
        return new Point(prototype);
      case "LINE":
        return new Line(prototype);
      case "CIRCLE":
        return new Circle(prototype);
      case "ARC":
        return new Arc(prototype);
    }
  }
}
