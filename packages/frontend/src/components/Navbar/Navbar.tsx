import { Box, HStack, Heading } from '@chakra-ui/react'
import React from 'react'

export const CadScriptNavbar: React.FC = () => {
	return (
		<Box width="100%" padding={'5'}>
			<HStack spacing="24px">
				<Heading>CadScript Cloud</Heading>
			</HStack>
		</Box>
	)
}
