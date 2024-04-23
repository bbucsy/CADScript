import { useContext } from "react";
import { WorkspaceContext } from "./WorkspaceContextProvider";

export const useWorkspaceContext = () => {
    const context = useContext(WorkspaceContext);
    if(typeof context === 'undefined'){
        throw new Error('useWorkspaceContext must be used within a WorkspaceContextProvider');
    }

    return context;
        
}