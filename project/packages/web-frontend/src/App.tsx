import { AspectRatio, Box, Center, Container, SimpleGrid } from '@chakra-ui/react'
import { CADScriptEditor } from './components/CadScriptEditor'
import { CadScriptNavbar } from './components/Navbar'
import { SketchDisplay } from './components/SketchDisplay'
import { Footer } from './components/Footer'

function App() {
	return (
		<>
			<CadScriptNavbar></CadScriptNavbar>
			<Container padding={'10px'}>
				<SimpleGrid columns={2} spacing={10}>
					<Box>
						<CADScriptEditor></CADScriptEditor>
					</Box>
					<AspectRatio>
						<SketchDisplay></SketchDisplay>
					</AspectRatio>
				</SimpleGrid>
			</Container>
			<Center>
				<Footer />
			</Center>
		</>
	)
}

export default App
