import { TldrawEditor, useEditorComponents } from "@tldraw/editor";
import { useC3Effect } from "../../hooks";
import { SelectTool, TextShapeUtil } from "tldraw";
import { UI } from "../ui";
import { MessageShapeTool, MessageShapeUtil } from "./shapes";

export const Editor = () => {
  return (
    <TldrawEditor
      initialState="select"
      shapeUtils={[TextShapeUtil, MessageShapeUtil]}
      tools={[SelectTool, MessageShapeTool]}
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
