import { TldrawEditor, useEditorComponents } from "@tldraw/editor";
import { useC3Effect } from "../../hooks";
import { GeoShapeUtil, SelectTool } from "tldraw";
import { UI } from "../ui";

export const Editor = () => {
  return (
    <TldrawEditor
      initialState="select"
      shapeUtils={[GeoShapeUtil]}
      tools={[SelectTool]}
    >
      <UI>
        <Inner />
      </UI>
    </TldrawEditor>
  );
};

const Inner = () => {
  const { Canvas } = useEditorComponents();

  useC3Effect();

  if (Canvas) return <Canvas />;
  return null;
};
