import { StateNode } from "@tldraw/editor";
import { WBMessageShape } from "../message-shape-schema";

export class Pointing extends StateNode {
  static override id = "pointing";

  shape?: WBMessageShape;
}
