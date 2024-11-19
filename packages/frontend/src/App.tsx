import {
  AspectRatio,
  Box,
  Center,
  Container,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { CADScriptEditor } from "./components/CadScriptEditor";
import { CadScriptNavbar } from "./components/Navbar";
import { SketchDisplay } from "./components/SketchDisplay";
import { Footer } from "./components/Footer";
import { JSONViewer } from "./components/JSONViewer";

function App() {
  return (
    <>
      <CadScriptNavbar></CadScriptNavbar>
      <Container maxW={"container.2xl"}>
        <SimpleGrid columns={2} spacing={10}>
          <Box>
            <CADScriptEditor></CADScriptEditor>
          </Box>
          <Tabs defaultIndex={2}>
            <TabList>
              <Tab>Intermediate Representation</Tab>
              <Tab>PlaneGCS Input</Tab>
              <Tab>Graphical</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <JSONViewer></JSONViewer>
              </TabPanel>
              <TabPanel>
                <JSONViewer convertURL="http://localhost:3000/sd2sp"></JSONViewer>
              </TabPanel>
              <TabPanel>
                <AspectRatio maxW="720px" ratio={1}>
                  <SketchDisplay></SketchDisplay>
                </AspectRatio>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </SimpleGrid>
      </Container>
      <Center>
        <Footer />
      </Center>
    </>
  );
}

export default App;
