import React, { useEffect, useRef, useState } from "react";
import { useWorkspaceContext } from "../WorkspaceContext";
import { ISolverResult } from "@cadscript/shared";
import { drawMessages, drawSketch, getSvgString } from "./canvasRenderer";
import { Box, Button } from "@chakra-ui/react";
import { downloadSvg } from "./svg-downloader";

export const SketchDisplay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { simpleModel } = useWorkspaceContext();
  const [solverResult, setSolverResult] = useState<ISolverResult | undefined>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawSketch(canvas, []);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const messages: string[] = [];

    fetch("http://localhost:3000/solve", {
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

        drawSketch(canvas, body.sketch);
        drawMessages(canvas, messages);
        setSolverResult(body);
      })
      .catch((err) => {
        console.log(err);
        messages.push("Falure! See logs for more info");
      });
  }, [simpleModel]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={1024}
        height={1024}
        style={{ width: "100%", aspectRatio: "1" }}
      />
      <Box
        style={{
          alignItems: "flex-end",
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={() => {
            downloadSvg("sketch", getSvgString(solverResult?.sketch));
          }}
        >
          Download SVG
        </Button>
      </Box>
    </>
  );
};
