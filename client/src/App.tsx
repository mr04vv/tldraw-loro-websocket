import { Tldraw } from "tldraw";
import "./App.css";
import "tldraw/tldraw.css";
import { View } from "./view";
import { LoroProvider } from "./providers";

function App() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw>
        <LoroProvider>
          <View />
        </LoroProvider>
      </Tldraw>
    </div>
  );
}

export default App;
