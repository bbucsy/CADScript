import {
  Container,
  SimpleGrid,
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  AspectRatio,
  Center,
} from "@chakra-ui/react";
import {
  CadScriptNavbar,
  CADScriptEditor,
  JSONViewer,
  SketchDisplay,
  Footer,
} from "./components";

function App() {
  return (
    <>
      <CadScriptNavbar></CadScriptNavbar>
      <Container maxW={"container.2xl"}>
        <SimpleGrid columns={2} spacing={10}>
          <Box>
            <CADScriptEditor></CADScriptEditor>
          </Box>
          <Tabs>
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
                <AspectRatio>
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
