import {
  Drawable,
  DrawablePoint,
  DrawableLine,
  DrawableCircle,
  DrawableArc,
} from "@cadscript/shared";

export const drawCoordinateSystem = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d");
  if (ctx == null) return;

  // Clear canvas
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Translate origin to the center of the canvas
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // Draw x-axis
  ctx.beginPath();
  ctx.moveTo(-canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, 0);
  ctx.strokeStyle = "black";
  ctx.stroke();

  // Draw y-axis
  ctx.beginPath();
  ctx.moveTo(0, -canvas.height / 2);
  ctx.lineTo(0, canvas.height / 2);
  ctx.strokeStyle = "black";
  ctx.stroke();

  // Draw tick marks on x-axis
  for (let x = -canvas.width / 2; x <= canvas.width / 2; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, -5);
    ctx.lineTo(x, 5);
    ctx.stroke();
  }

  // Draw tick marks on y-axis
  for (let y = -canvas.height / 2; y <= canvas.height / 2; y += 20) {
    ctx.beginPath();
    ctx.moveTo(-5, y);
    ctx.lineTo(5, y);
    ctx.stroke();
  }

  // Reset transformation matrix to the identity matrix
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

export const drawMessages = (canvas: HTMLCanvasElement, messages: string[]) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Canvas 2D context is not supported.");
    return;
  }

  // Set font style
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";

  // Write messages
  const lineHeight = 20; // Adjust line height as needed
  const padding = 10; // Padding from top and left edges
  let y = padding;
  for (const message of messages) {
    ctx.fillText(message, padding, y);
    y += lineHeight;
  }
};

export const drawSketch = (canvas: HTMLCanvasElement, sketch: Drawable[]) => {
  console.log("DRAWING SKETCH");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Canvas 2D context is not supported.");
    return;
  }

  sketch.forEach((item) => {
    if (item.type == "POINT") {
      drawPoint(ctx, item);
    }
    if (item.type == "LINE") {
      drawLine(ctx, item);
    }
    if (item.type == "CIRCLE") {
      drawCircle(ctx, item);
    }
    if (item.type == "ARC") {
      drawArc(ctx, item);
    }
  });
};

const drawPoint = (
  ctx: CanvasRenderingContext2D,
  point: DrawablePoint
): void => {
  // Get the center of the canvas
  const centerX = ctx.canvas.width / 2;
  const centerY = ctx.canvas.height / 2;

  // Translate the point coordinates relative to the center
  const x = centerX + point.x;
  const y = centerY - point.y; // Invert y-axis to match usual Cartesian coordinates

  ctx.fillStyle = "black";
  // Draw the point
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
};

const drawLine = (ctx: CanvasRenderingContext2D, line: DrawableLine): void => {
  // Get the center of the canvas
  const centerX = ctx.canvas.width / 2;
  const centerY = ctx.canvas.height / 2;

  // Translate line coordinates relative to the center
  const x1 = centerX + line.x1;
  const y1 = centerY - line.y1; // Invert y-axis to match usual Cartesian coordinates
  const x2 = centerX + line.x2;
  const y2 = centerY - line.y2; // Invert y-axis to match usual Cartesian coordinates

  // Draw the line
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

const drawCircle = (
  ctx: CanvasRenderingContext2D,
  circle: DrawableCircle
): void => {
  // Get the center of the canvas
  const centerX = ctx.canvas.width / 2;
  const centerY = ctx.canvas.height / 2;

  // Translate circle coordinates relative to the center
  const x = centerX + circle.x;
  const y = centerY - circle.y; // Invert y-axis to match usual Cartesian coordinates

  // Draw the circle
  ctx.beginPath();
  ctx.arc(x, y, circle.radius, 0, Math.PI * 2);
  ctx.stroke();
};

const drawArc = (ctx: CanvasRenderingContext2D, arc: DrawableArc): void => {
  // Get the center of the canvas
  const centerX = ctx.canvas.width / 2;
  const centerY = ctx.canvas.height / 2;

  // Translate arc coordinates relative to the center
  const xs = centerX + arc.xs;
  const ys = centerY - arc.ys; // Invert y-axis to match usual Cartesian coordinates
  const xc = centerX + arc.xc;
  const yc = centerY - arc.yc; // Invert y-axis to match usual Cartesian coordinates
  const xe = centerX + arc.xe;
  const ye = centerY - arc.ye; // Invert y-axis to match usual Cartesian coordinates

  drawArcWithPoints(
    ctx,
    { x: xs, y: ys },
    { x: xe, y: ye },
    { x: xc, y: yc },
    arc.radius
  );
};

function drawArcWithPoints(
  ctx: CanvasRenderingContext2D,
  start: { x: number; y: number },
  end: { x: number; y: number },
  center: { x: number; y: number },
  radius: number
): void {
  // Calculate vectors from center to start and end points
  const startVector = { x: start.x - center.x, y: start.y - center.y };
  const endVector = { x: end.x - center.x, y: end.y - center.y };

  // Calculate angles
  const startAngle = Math.atan2(startVector.y, startVector.x);
  const endAngle = Math.atan2(endVector.y, endVector.x);

  // Draw arc
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, startAngle, endAngle);
  ctx.stroke();
}
