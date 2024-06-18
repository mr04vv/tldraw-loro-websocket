import "@tldraw/editor/editor.css";
import { LogProvider, LoroProvider } from "./providers";
import { Editor } from "./features/editor";
import { Logger } from "./features/logger";

function App() {
  return (
    <LoroProvider>
      <LogProvider>
        <div style={{ position: "fixed", zIndex: 999 }}>
          <Logger />
        </div>
        <div style={{ position: "fixed", inset: 0 }}>
          <Editor />
        </div>
      </LogProvider>
    </LoroProvider>
  );
}

export default App;
