import { Drawable } from "@cadscript/shared";
import { BoundingBox } from "./bounding-box";
import { RenderEntityFactory } from "./renderEntities";
import { SVGCamera } from "./camera.svg";

export const getSvgString = (sketch?: Drawable[]): string => {
  console.log("DRAWING SVG");

  if (typeof sketch === "undefined") {
    return "";
  }

  // only render non helper entites
  // We also don't need Points in svg
  const renderEntites = sketch
    .filter((drawable) => !drawable.helper)
    //.filter((drawable) => drawable.type !== "POINT")
    .map((prototype) => RenderEntityFactory.createEntity(prototype));

  const boundingBox = renderEntites.reduce((acc, obj) => {
    return BoundingBox.combine(acc, obj.boundingBox());
  }, BoundingBox.infiniteBox());

  const camera = new SVGCamera(boundingBox);
  renderEntites.forEach((r) => r.render(camera));
  return camera.svgString;
};
