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
