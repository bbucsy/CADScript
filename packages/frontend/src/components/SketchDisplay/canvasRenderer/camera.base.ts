export abstract class Camera {
  constructor() {}

  public abstract toCanvasWorld(x: number, y: number): { x: number; y: number };

  public abstract setHelperFillStyle(helper: boolean): void;

  public abstract get scale(): number;

  public abstract get ctx(): CanvasRenderingContext2D;

  public abstract get canvasWidth(): number;

  public abstract get canvasHeight(): number;

  public get CENTER_X() {
    return this.canvasWidth / 2;
  }
  public get CENTER_Y() {
    return this.canvasHeight / 2;
  }
}
