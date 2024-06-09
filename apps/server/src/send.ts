import { WebSocket } from "ws";
import { closeConn } from "./closeConns";
import { WSSharedDoc } from "./wsSharedDoc";
const wsReadyStateConnecting = 0;
const wsReadyStateOpen = 1;
export const send = (doc: WSSharedDoc, conn: WebSocket, m: Uint8Array) => {
  if (
    conn.readyState !== wsReadyStateConnecting &&
    conn.readyState !== wsReadyStateOpen
  ) {
    closeConn(doc, conn);
  }

  try {
    conn.send(m, (err) => {
      if (err) {
        closeConn(doc, conn);
        console.error("err while send", err);
        console.log(err.stack);
      }
    });
  } catch (err: any) {
    closeConn(doc, conn);
    console.error('catched error during "send"', err);
    console.log(err.stack);
  }
};
