import { Center, Text } from '@chakra-ui/react'
import React from 'react'

export const Footer: React.FC = () => {
	return (
		<Center width="100%" bg="grey" as="footer" position="fixed" bottom="0" left="0">
			<Text paddingY="3">Made by Benjamin Bucsy (EQN34F)</Text>
		</Center>
	)
}
