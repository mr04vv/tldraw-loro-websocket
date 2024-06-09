import { WebSocket } from "ws";
import { send } from "./send";
import { WSSharedDoc } from "./wsSharedDoc";

export const propagateUpdate = (
  doc: WSSharedDoc,
  update: Uint8Array,
  ws: WebSocket
) => {
  // const encoder = encoding.createEncoder();
  // encoding.writeVarUint(encoder, messageSync);
  // syncProtocol.writeUpdate(encoder, update);
  // const message = encoding.toUint8Array(encoder);
  doc.conns.forEach((_, conn) => {
    if (ws === conn) return;
    conn.binaryType = "arraybuffer";
    send(doc, conn, update);
  });
};
