import { StateNode, TLStateNodeConstructor } from "@tldraw/editor";
import { Idle } from "./tool-states/idle";
import { Pointing } from "./tool-states/pointing";

export class MessageShapeTool extends StateNode {
  static override id = "message";
  static override initial = "idle";
  static override children = (): TLStateNodeConstructor[] => [Idle, Pointing];
  override shapeType = "message";
}
