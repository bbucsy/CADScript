import { Drawable } from "@cadscript/shared";
import { BoundingBox } from "./bounding-box";
import { RenderEntityFactory, CoordianteSystem } from "./renderEntities";
import { CanvasCamera } from "./camera.canvas";

export const drawMessages = (canvas: HTMLCanvasElement, messages: string[]) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Canvas 2D context is not supported.");
    return;
  }

  // Set font style
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  // Write messages
  const lineHeight = 30; // Adjust line height as needed
  const padding = 60; // Padding from top and left edges
  let y = padding;
  for (const message of messages) {
    ctx.fillText(message, padding, y);
    y += lineHeight;
  }
};

export const drawSketch = (canvas: HTMLCanvasElement, sketch: Drawable[]) => {
  console.log("DRAWING SKETCH");

  const renderEntites = sketch.map((prototype) =>
    RenderEntityFactory.createEntity(prototype)
  );

  const boundingBox = renderEntites.reduce((acc, obj) => {
    return BoundingBox.combine(acc, obj.boundingBox());
  }, BoundingBox.infiniteBox());

  const camera = new CanvasCamera(canvas, boundingBox.getScale(canvas, 0.8));
  new CoordianteSystem().render(camera);
  renderEntites.forEach((r) => r.render(camera));
};
