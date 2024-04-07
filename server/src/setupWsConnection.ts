import { WebSocket } from "ws";
import { getDoc } from "./getDoc";
import { closeConn } from "./closeConns";
import { send } from "./send";
import { messageListener } from "./messageListener";
const pingTimeout = 30000;
export const setupWSConnection = async (conn: WebSocket, docName: string) => {
  conn.binaryType = "arraybuffer";

  let isDocLoaded = false;
  let queuedMessages = [];
  let isConnectionAlive = true;

  const [doc, isNew] = getDoc(docName);

  doc.conns.set(conn, new Set());

  const sendSyncStep1 = () => {
    send(doc, conn, new TextEncoder().encode("sync"));
  };

  if (isNew) {
    isDocLoaded = true;

    sendSyncStep1();
    // bindState(doc).then(() => {
    //   if (!isConnectionAlive) {
    //     return;
    //   }

    //   isDocLoaded = true;
    //   queuedMessages.forEach((message) => messageListener(conn, doc, message));
    //   queuedMessages = [];
    //   sendSyncStep1();
    // });
  } else {
    isDocLoaded = true;
    sendSyncStep1();
  }

  conn.on("message", (message) => {
    console.log("message received", isDocLoaded);
    if (isDocLoaded) {
      messageListener(conn, doc, new Uint8Array(message as ArrayBuffer));
    } else {
      queuedMessages.push(new Uint8Array(message as ArrayBuffer));
    }
  });

  let pongReceived = true;
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      if (doc.conns.has(conn)) {
        closeConn(doc, conn);
        isConnectionAlive = false;
      }
      clearInterval(pingInterval);
    } else if (doc.conns.has(conn)) {
      pongReceived = false;
      try {
        conn.ping();
      } catch (err: any) {
        closeConn(doc, conn);
        isConnectionAlive = false;
        clearInterval(pingInterval);
        console.log(err.stack);
      }
    }
  }, pingTimeout);

  conn.on("close", () => {
    closeConn(doc, conn);
    isConnectionAlive = false;
    clearInterval(pingInterval);
  });

  conn.on("pong", () => {
    pongReceived = true;
  });
};
