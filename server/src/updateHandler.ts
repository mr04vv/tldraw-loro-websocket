import { WebSocket } from "ws";
import { propagateUpdate } from "./propagateUpdate";
import { WSSharedDoc } from "./wsSharedDoc";

export const updateHandler = async (
  update: Uint8Array,
  origin: WebSocket,
  doc: WSSharedDoc
) => {
  let isOriginWSConn = origin instanceof WebSocket && doc.conns.has(origin);
  console.log(origin, doc.conns.has(origin));
  // if (isOriginWSConn) {
  //   try {
  //     propagateUpdate(doc, update);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // } else {
  propagateUpdate(doc, update, origin);
  // }
};
