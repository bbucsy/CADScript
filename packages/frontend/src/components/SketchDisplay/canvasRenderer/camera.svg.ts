import { BoundingBox } from "./bounding-box";
import { Camera } from "./camera.base";

import CanvasToSvg from "canvas-to-svg";

export class SVGCamera extends Camera {
  private readonly context: CanvasToSvg;
  private readonly _scale: number = 1;
  private readonly width: number;
  private readonly height: number;

  constructor(box: BoundingBox) {
    super();
    // set a minimum 100*100 box for svg
    this.width = (box.width < 100 ? 100 : box.width) * 2;
    this.height = (box.height < 100 ? 100 : box.height) * 2;
    this.context = new CanvasToSvg(this.width, this.height);
  }

  public toCanvasWorld(x: number, y: number) {
    return {
      x: this.width / 2 + x * this._scale,
      y: this.height / 2 - y * this._scale,
    };
  }

  public setHelperFillStyle() {
    //NO-OP
  }

  public get scale() {
    return this._scale;
  }

  public get ctx() {
    return this.context;
  }

  public get canvasWidth() {
    return this.width;
  }
  public get canvasHeight() {
    return this.height;
  }

  public get svgString(): string {
    return this.context.getSerializedSvg(false);
  }
}
