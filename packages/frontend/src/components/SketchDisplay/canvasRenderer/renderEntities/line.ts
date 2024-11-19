import { DrawableLine } from "@cadscript/shared";
import { RenderEntity } from "./base";
import { Camera } from "../camera.base";
import { BoundingBox } from "../bounding-box";

export class Line extends RenderEntity {
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
