import { WebSocket } from "ws";
import { propagateUpdate } from "./propagateUpdate";
import { WSSharedDoc } from "./wsSharedDoc";
import { persistUpdate } from "./persistUpdate";

let j = 0;
export const updateHandler = async (
  update: Uint8Array,
  origin: WebSocket,
  doc: WSSharedDoc
) => {
  console.log("j", j++);
  //   let isOriginWSConn = origin instanceof WebSocket && doc.conns.has(origin);
  //   await persistUpdate(doc, update);
  propagateUpdate(doc, update, origin);
};
