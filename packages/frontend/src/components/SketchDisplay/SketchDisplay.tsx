import React, { useEffect, useRef } from "react";
import { useWorkspaceContext } from "../../providers/WorkspaceContext";
import { drawCoordinateSystem } from "./canvas";
//import { ISolverResult } from "shared";

export const SketchDisplay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { simpleModel } = useWorkspaceContext();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawCoordinateSystem(canvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    //const messages: string[] = [];

    /*fetch("http://localhost:3000/solve", {
      method: "POST",
      body: simpleModel,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((result) => {
        messages.push(`request: ${result.status}`);
        return result.json();
      })
      .then((json) => {
        const body = json as ISolverResult;
        messages.push(`solver: ${body.status ?? "N/A"}`);
        messages.push(`dof: ${body.dof ?? "N/A"}`);

        drawCoordinateSystem(canvas);
        drawSketch(canvas, body.sketch);
        drawMessages(canvas, messages);
      })
      .catch((err) => {
        console.log(err);
        messages.push("Falure! See logs for more info");
      });*/
  }, [simpleModel]);

  return (
    <canvas
      ref={canvasRef}
      width={1024}
      height={1024}
      style={{ width: "100%", aspectRatio: "1" }}
    />
  );
};
