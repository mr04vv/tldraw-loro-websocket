import "./App.css";
import "tldraw/tldraw.css";
import { LoroProvider } from "./providers";
import { CollaboratorCursors } from "./features/collaborator";
import { Editor } from "./features/editor";

function App() {
  return (
    <LoroProvider>
      <CollaboratorCursors />
      <div style={{ position: "fixed", inset: 0 }}>
        <Editor />
      </div>
    </LoroProvider>
  );
}

export default App;
