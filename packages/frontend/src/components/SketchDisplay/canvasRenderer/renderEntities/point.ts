import { DrawablePoint } from "@cadscript/shared";
import { BoundingBox } from "../bounding-box";
import { Camera } from "../camera.base";
import { RenderEntity } from "./base";

export class Point extends RenderEntity {
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
