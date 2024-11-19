import {
  Drawable,
  DrawableArc,
  DrawableCircle,
  DrawableLine,
  DrawablePoint,
} from "@cadscript/shared";

class BoundingBox {
  constructor(
    public readonly minX: number,
    public readonly maxX: number,
    public readonly minY: number,
    public readonly maxY: number
  ) {}

  static infiniteBox(): BoundingBox {
    return new BoundingBox(Infinity, -Infinity, Infinity, -Infinity);
  }

  /**
   * Combines two Bounding boxes in a way, that each of them is inside the resulting box
   */
  static combine(a: BoundingBox, b: BoundingBox) {
    return new BoundingBox(
      Math.min(a.minX, b.minX),
      Math.max(a.maxX, b.maxX),
      Math.min(a.minY, b.minY),
      Math.max(a.maxY, b.maxY)
    );
  }

  /**
   * Gets the appropriate scaling factor for a canvas so that the bounding box is inside completly
   * Adds extra padding if necesary
   * @param canvas
   * @param padding Must be less than 1
   * @returns
   */
  getScale(canvas: HTMLCanvasElement, padding: number = 1) {
    const scaleX = canvas.width / 2 / (this.maxX - this.minX);
    const scaleY = canvas.height / 2 / (this.maxY - this.minY);
    const suggestedScale = Math.min(scaleX, scaleY) * padding;

    if (!isFinite(suggestedScale) || Math.abs(suggestedScale) < 0.000001)
      return 1;
    return suggestedScale;
  }
}

class Camera {
  private context: CanvasRenderingContext2D;
  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly _scale: number
  ) {
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

  public get CENTER_X() {
    return this.canvasWidth / 2;
  }
  public get CENTER_Y() {
    return this.canvasHeight / 2;
  }
}

abstract class EntityBase {
  constructor() {}

  abstract render(camera: Camera): void;
  abstract boundingBox(): BoundingBox;
}

class Point extends EntityBase {
  constructor(private readonly prototype: DrawablePoint) {
    super();
  }

  render(camera: Camera): void {
    const { x, y } = camera.toCanvasWorld(this.prototype.x, this.prototype.y);

    camera.setHelperFillStyle(this.prototype.helper);
    camera.ctx.beginPath();
    camera.ctx.arc(x, y, 3, 0, 2 * Math.PI);
    camera.ctx.fill();
  }
  boundingBox(): BoundingBox {
    return new BoundingBox(
      this.prototype.x,
      this.prototype.x,
      this.prototype.y,
      this.prototype.y
    );
  }
}

class Line extends EntityBase {
  constructor(private readonly prototype: DrawableLine) {
    super();
  }

  render(camera: Camera): void {
    const str = camera.toCanvasWorld(this.prototype.x1, this.prototype.y1);
    const end = camera.toCanvasWorld(this.prototype.x2, this.prototype.y2);

    camera.setHelperFillStyle(this.prototype.helper);
    camera.ctx.beginPath();
    camera.ctx.moveTo(str.x, str.y);
    camera.ctx.lineTo(end.x, end.y);
    camera.ctx.stroke();
  }
  boundingBox(): BoundingBox {
    return new BoundingBox(
      Math.min(this.prototype.x1, this.prototype.x2),
      Math.max(this.prototype.x1, this.prototype.x2),
      Math.min(this.prototype.y1, this.prototype.y2),
      Math.max(this.prototype.y1, this.prototype.y2)
    );
  }
}

class Circle extends EntityBase {
  constructor(private readonly prototype: DrawableCircle) {
    super();
  }

  render(camera: Camera): void {
    const { x, y } = camera.toCanvasWorld(this.prototype.x, this.prototype.y);

    camera.setHelperFillStyle(this.prototype.helper);
    camera.ctx.beginPath();
    camera.ctx.arc(x, y, this.prototype.radius * camera.scale, 0, 2 * Math.PI);
    camera.ctx.stroke();
  }
  boundingBox(): BoundingBox {
    return new BoundingBox(
      this.prototype.x - this.prototype.radius,
      this.prototype.x + this.prototype.radius,
      this.prototype.y - this.prototype.radius,
      this.prototype.y + this.prototype.radius
    );
  }
}

class Arc extends EntityBase {
  constructor(private readonly prototype: DrawableArc) {
    super();
  }

  render(camera: Camera): void {
    const start = camera.toCanvasWorld(this.prototype.xs, this.prototype.ys);
    const center = camera.toCanvasWorld(this.prototype.xc, this.prototype.yc);
    const end = camera.toCanvasWorld(this.prototype.xe, this.prototype.ye);

    const startAngle = Math.atan2(start.y - center.y, start.x - center.x);
    const endAngle = Math.atan2(end.y - center.y, end.x - center.x);

    camera.setHelperFillStyle(this.prototype.helper);

    camera.ctx.beginPath();
    camera.ctx.arc(
      center.x,
      center.y,
      this.prototype.radius * camera.scale,
      startAngle,
      endAngle
    );
    camera.ctx.stroke();
  }
  boundingBox(): BoundingBox {
    return new BoundingBox(
      Math.min(
        this.prototype.xs,
        this.prototype.xc - this.prototype.radius,
        this.prototype.xe
      ),
      Math.max(
        this.prototype.xs,
        this.prototype.xc + this.prototype.radius,
        this.prototype.xe
      ),
      Math.min(
        this.prototype.ys,
        this.prototype.yc - this.prototype.radius,
        this.prototype.ye
      ),
      Math.max(
        this.prototype.ys,
        this.prototype.yc + this.prototype.radius,
        this.prototype.ye
      )
    );
  }
}

class CoordianteSystem extends EntityBase {
  render(camera: Camera): void {
    camera.ctx.fillStyle = "white";
    camera.ctx.fillRect(0, 0, camera.canvasWidth, camera.canvasHeight);

    camera.ctx.strokeStyle = "black";
    camera.ctx.lineWidth = 1;

    // Draw x and y axes
    camera.ctx.beginPath();
    camera.ctx.moveTo(0, camera.CENTER_Y);
    camera.ctx.lineTo(camera.canvasWidth, camera.CENTER_Y);
    camera.ctx.moveTo(camera.CENTER_X, 0);
    camera.ctx.lineTo(camera.CENTER_X, camera.canvasHeight);
    camera.ctx.stroke();

    // Draw scale numbers
    camera.ctx.fillStyle = "black";
    camera.ctx.font = "14px Arial";
    camera.ctx.textAlign = "center";
    camera.ctx.textBaseline = "middle";

    // Draw tick marks on x-axis
    for (let x = 0; x <= camera.canvasWidth; x += 20) {
      camera.ctx.beginPath();
      camera.ctx.moveTo(x, camera.CENTER_Y - 5);
      camera.ctx.lineTo(x, camera.CENTER_Y + 5);
      camera.ctx.stroke();
    }

    // Draw tick marks on y-axis
    for (let y = 0; y <= camera.canvasHeight; y += 20) {
      camera.ctx.beginPath();
      camera.ctx.moveTo(camera.CENTER_X - 5, y);
      camera.ctx.lineTo(camera.CENTER_X + 5, y);
      camera.ctx.stroke();
    }

    // Top (Y-axis)
    camera.ctx.fillText(
      `${(camera.canvasHeight / 2 / camera.scale).toFixed(1)} mm`,
      camera.CENTER_X + 60,
      15 // near the top edge
    );

    // Bottom (Y-axis)
    camera.ctx.fillText(
      `${(-(camera.canvasHeight / 2 / camera.scale)).toFixed(1)} mm`,
      camera.CENTER_X + 60,
      camera.canvasHeight - 15
    );

    // Right (X-axis)
    camera.ctx.fillText(
      `${(camera.canvasWidth / 2 / camera.scale).toFixed(1)} mm`,
      camera.canvasWidth - 60,
      camera.CENTER_Y - 30
    );

    // Left (X-axis)
    camera.ctx.fillText(
      `${(-(camera.canvasWidth / 2 / camera.scale)).toFixed(1)} mm`,
      60,
      camera.CENTER_Y - 30
    );
  }

  boundingBox(): BoundingBox {
    throw new Error("Coordinate systems do not have bounding box");
  }
}

class EntityFactory {
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

export const drawSketch = (canvas: HTMLCanvasElement, sketch: Drawable[]) => {
  console.log("DRAWING SKETCH");

  const renderEntites = sketch.map((prototype) =>
    EntityFactory.createEntity(prototype)
  );

  const boundingBox = renderEntites.reduce((acc, obj) => {
    return BoundingBox.combine(acc, obj.boundingBox());
  }, BoundingBox.infiniteBox());

  console.log("Bounding Box:", boundingBox);
  console.log("Bounding Box Scale", boundingBox.getScale(canvas, 0.9));

  const camera = new Camera(canvas, boundingBox.getScale(canvas, 0.9));
  new CoordianteSystem().render(camera);
  renderEntites.forEach((r) => r.render(camera));
};
