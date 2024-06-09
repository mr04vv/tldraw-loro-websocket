import { WebSocket } from "ws";
import { WSSharedDoc } from "./wsSharedDoc";
import { docs } from "./map";

export const closeConn = (doc: WSSharedDoc, conn: WebSocket) => {
  const controlledIds = doc.conns.get(conn);
  if (controlledIds) {
    doc.conns.delete(conn);

    if (doc.conns.size === 0) {
      conn.send("");
      docs.delete(doc.name);
    }
  }
  conn.close();
};
