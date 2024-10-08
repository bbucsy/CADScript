import { useEffect, useState } from "react";
import { useWorkspaceContext } from "../../providers/WorkspaceContext";
import { Box } from "@chakra-ui/react";
import { syntaxHighlight } from "./util";
import "./temp.css";

export interface JSONViewerProps {
  convertURL?: string;
}

export const JSONViewer: React.FC<JSONViewerProps> = ({ convertURL }) => {
  const [jsonData, setJSONData] = useState<object>({});
  const { simpleModel } = useWorkspaceContext();

  useEffect(() => {
    try {
      if (!convertURL) {
        const data = JSON.parse(simpleModel);
        setJSONData(data);
      } else if (simpleModel !== "") {
        fetch(convertURL, {
          method: "POST",
          body: simpleModel,
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((result) => result.json())
          .then((json) => {
            console.log("parsing....");
            setJSONData(json);
          })
          .catch((err) => {
            console.log(err);
            setJSONData({
              status: "fail",
              message: "See logs for exact failure",
            });
          });
      }
    } catch (error) {
      setJSONData({ status: "fail", message: "See logs for exact failure" });
      console.log("invalid simple model");
    }
  }, [simpleModel, setJSONData]);

  return (
    <Box maxHeight={"75vh"} bg={"lightgray"} overflowY={"scroll"} padding={3}>
      <pre
        dangerouslySetInnerHTML={{
          __html: syntaxHighlight(JSON.stringify(jsonData, undefined, 4)),
        }}
      />
    </Box>
  );
};
