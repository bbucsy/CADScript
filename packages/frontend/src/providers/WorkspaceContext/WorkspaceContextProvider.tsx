import React, { createContext } from 'react'
import { WorkspaceContextType } from './types'

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export const WorkspaceContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [document, setDocument] = React.useState<string>('')
	const [simpleModel, setSimpleModel] = React.useState<string>('')

	return (
		<WorkspaceContext.Provider value={{ document, setDocument, simpleModel, setSimpleModel }}>
			{children}
		</WorkspaceContext.Provider>
	)
}
