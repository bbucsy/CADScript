import { DrawableCircle } from "@cadscript/shared";
import { BoundingBox } from "../bounding-box";
import { Camera } from "../camera.base";
import { RenderEntity } from "./base";

export class Circle extends RenderEntity {
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
