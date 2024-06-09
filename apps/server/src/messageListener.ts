import { WebSocket } from "ws";
import { WSSharedDoc } from "./wsSharedDoc";
import { send } from "./send";
import { propagateUpdate } from "./propagateUpdate";

export const messageListener = async (
  conn: WebSocket,
  doc: WSSharedDoc,
  message: Uint8Array
) => {
  try {
    // propagateUpdate(doc, message, conn);
  } catch (err: any) {
    console.log(err.stack);
  }
};
