import { BoundingBox } from "../bounding-box";
import { Camera } from "../camera.base";

export abstract class RenderEntity {
  constructor() {}

  abstract render(camera: Camera): void;
  abstract boundingBox(): BoundingBox;
}
