import { BoundingBox } from "../bounding-box";
import { Camera } from "../camera.base";
import { RenderEntity } from "./base";

export class CoordianteSystem extends RenderEntity {
  render(camera: Camera): void {
    camera.ctx.fillStyle = "white";
    camera.ctx.fillRect(0, 0, camera.canvasWidth, camera.canvasHeight);

    camera.setHelperFillStyle(false);
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
