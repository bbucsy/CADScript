import { Camera } from "./camera.base";

export class CanvasCamera extends Camera {
  private context: CanvasRenderingContext2D;
  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly _scale: number
  ) {
    super();

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get canvas context");
    }
    this.context = context;
  }

  public toCanvasWorld(x: number, y: number) {
    return {
      x: this.canvas.width / 2 + x * this._scale,
      y: this.canvas.height / 2 - y * this._scale,
    };
  }

  public setHelperFillStyle(helper: boolean) {
    this.context.strokeStyle = helper ? "blue" : "black";
    this.context.fillStyle = helper ? "blue" : "black";
    this.context.setLineDash(helper ? [5, 5] : []);
  }

  public get scale() {
    return this._scale;
  }

  public get ctx() {
    return this.context;
  }

  public get canvasWidth() {
    return this.canvas.width;
  }
  public get canvasHeight() {
    return this.canvas.height;
  }
}
