import { useEffect, useState } from 'react'
import { useWorkspaceContext } from '../WorkspaceContext'
import { Box } from '@chakra-ui/react'

export const JSONViewer: React.FC = () => {
	const [jsonData, setJSONData] = useState<object>({})
	const { simpleModel } = useWorkspaceContext()

	useEffect(() => {
		try {
			const data = JSON.parse(simpleModel)
			setJSONData(data)
		} catch (error) {
			console.log('invalid simple model')
		}
	}, [simpleModel, setJSONData])

	return (
		<Box maxHeight={'75vh'} bg={'lightgray'} overflowY={'scroll'} padding={3}>
			<Box as="pre">{JSON.stringify(jsonData, null, 2)}</Box>
		</Box>
	)
}
