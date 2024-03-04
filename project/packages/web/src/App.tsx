import { useEffect } from 'react';
import './App.css'
import Editor, { useMonaco } from '@monaco-editor/react';
function App() {


  const monaco = useMonaco();

  useEffect(() => {
    // do conditional chaini
    // or make sure that it exists by other ways
    if (monaco) {
      console.log('here is the monaco instance:', monaco);
    }
  }, [monaco]);

  return (
    
    <Editor
      height="90vh"
      defaultLanguage="javascript"
      defaultValue="// some comment"
    />

  )
}

export default App
