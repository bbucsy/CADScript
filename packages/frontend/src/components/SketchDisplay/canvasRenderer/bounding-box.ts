export class BoundingBox {
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

  public get width(): number {
    return this.maxX - this.minX;
  }

  public get height(): number {
    return this.maxY - this.minY;
  }
}
