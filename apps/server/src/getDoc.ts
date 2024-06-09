import { WebSocket } from "ws";
import { docs } from "./map";
import { WSSharedDoc } from "./wsSharedDoc";

export const getDoc = (
  docname: string,
  conn: WebSocket
): [WSSharedDoc, boolean] => {
  const existing = docs.get(docname);
  if (existing) {
    return [existing, false];
  }

  const doc = new WSSharedDoc(docname, conn);

  docs.set(docname, doc);

  return [doc, true];
};
