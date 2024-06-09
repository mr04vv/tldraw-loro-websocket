import { WebSocket } from "ws";
import { getDoc } from "./getDoc";
import { closeConn } from "./closeConns";
import { send } from "./send";
import { messageListener } from "./messageListener";
import { knex } from "./knex";
const pingTimeout = 30000;

export const setupWSConnection = async (conn: WebSocket, docName: string) => {
  conn.binaryType = "arraybuffer";

  let isDocLoaded = false;
  let queuedMessages: any[] = [];
  let isConnectionAlive = true;

  const [doc, isNew] = getDoc(docName, conn);

  doc.conns.set(conn, new Set());

  const sendSyncStep1 = () => {
    const update = doc.exportSnapshot();
    const updateWithMessageType = new Uint8Array([0, ...update]);
    send(doc, conn, updateWithMessageType);
  };

  if (isNew) {
    isDocLoaded = true;
    const updates = await knex("items")
      .where("docname", doc.name)
      .orderBy("id");

    doc.importUpdateBatch(updates.map((row) => new Uint8Array(row.update)));
    sendSyncStep1();
    queuedMessages.forEach((message) => messageListener(conn, doc, message));
  } else {
    isDocLoaded = true;
    sendSyncStep1();
  }

  conn.on("message", (message) => {
    // awareness
    if (isDocLoaded) {
      const update = new Uint8Array(message as ArrayBuffer);

      if (update[0] === undefined) {
        console.debug(update);
      }
      if (update[0] === 1) {
        doc.conns.forEach((_, _conn) => {
          if (conn === _conn) return;
          _conn.binaryType = "arraybuffer";
          send(doc, _conn, update);
        });
        return;
      }
      try {
        const message = update.slice(1);
        doc.import(message);
        messageListener(conn, doc, message);
      } catch (err: any) {
        console.log(err.stack);
        closeConn(doc, conn);
      }
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
