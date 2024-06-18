import {
  Editor,
  StateNode,
  TLEventHandlers,
  TLPointerEventInfo,
  TLShapeId,
  Vec,
  createShapeId,
} from "@tldraw/editor";
import { WBMessageShape } from "../message-shape-schema";

export class Pointing extends StateNode {
  static override id = "pointing";

  info = {} as TLPointerEventInfo;

  shape = {} as WBMessageShape;

  markId = "";

  override onEnter = () => {
    console.debug("Pointing entered");
    const { editor } = this;

    const {
      inputs: { originPagePoint },
    } = editor;

    const id = createShapeId();

    this.markId = `creating:${id}`;
    this.editor.mark(this.markId);

    this.shape = createMessageShape(editor, id, originPagePoint);
  };

  override onPointerMove: TLEventHandlers["onPointerMove"] = (info) => {
    console.debug("Pointing pointer moved", info);
    if (this.editor.inputs.isDragging) {
      this.editor.setCurrentTool("select.translating", {
        ...info,
        target: "shape",
        shape: this.shape,
        onInteractionEnd: "message",
        isCreating: false,
      });
    }
  };

  override onPointerUp: TLEventHandlers["onPointerUp"] = () => {
    console.debug("Pointing pointer up");
    this.complete();
  };

  override onInterrupt: TLEventHandlers["onInterrupt"] = () => {
    console.debug("Pointing interrupted");
    this.cancel();
  };

  override onComplete: TLEventHandlers["onComplete"] = () => {
    console.debug("Pointing complete");
    this.complete();
  };

  override onCancel: TLEventHandlers["onCancel"] = () => {
    console.debug("Pointing canceled");
    this.cancel();
  };

  private complete() {
    this.editor.setCurrentTool("select", this.info);
  }

  private cancel() {
    this.editor.bailToMark(this.markId);
    this.parent.transition("idle");
  }
}

export function createMessageShape(editor: Editor, id: TLShapeId, center: Vec) {
  editor
    .createShapes<WBMessageShape>([
      {
        id,
        type: "message",
        x: center.x,
        y: center.y,
        props: {
          autoSize: true,
          w: 20,
        },
      },
    ])
    .select(id);

  const shape = editor.getShape<WBMessageShape>(id);
  if (!shape) throw new Error("Shape not found");
  const bounds = editor.getShapeGeometry(shape).bounds;

  editor.updateShapes([
    {
      id,
      type: "message",
      x: shape.x - bounds.w / 2,
      y: shape.y - bounds.h / 2,
    },
  ]);

  const repositionedShape = editor.getShape<WBMessageShape>(id);
  if (!repositionedShape) throw new Error("Shape not found");

  return repositionedShape;
}
