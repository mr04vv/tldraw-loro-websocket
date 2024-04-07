import { WebSocket } from "ws";
import { propagateUpdate } from "./propagateUpdate";
import { WSSharedDoc } from "./wsSharedDoc";
import { persistUpdate } from "./persistUpdate";

export const updateHandler = async (
  update: Uint8Array,
  origin: WebSocket,
  doc: WSSharedDoc
) => {
  //   let isOriginWSConn = origin instanceof WebSocket && doc.conns.has(origin);
  await persistUpdate(doc, update);
  propagateUpdate(doc, update, origin);
};
