import { useEffect, useState } from 'react'
import { useWorkspaceContext } from '../WorkspaceContext'
import { Box } from '@chakra-ui/react'
import { syntaxHighlight } from './util'
import './temp.css'

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
			<pre
				dangerouslySetInnerHTML={{
					__html: syntaxHighlight(JSON.stringify(jsonData, undefined, 4))
				}}
			/>
		</Box>
	)
}
