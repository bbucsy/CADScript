import { DrawableArc } from "@cadscript/shared";
import { BoundingBox } from "../bounding-box";
import { Camera } from "../camera.base";
import { RenderEntity } from "./base";

export class Arc extends RenderEntity {
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
