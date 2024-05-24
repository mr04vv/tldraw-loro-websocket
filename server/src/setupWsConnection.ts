import { WebSocket } from "ws";
import { getDoc } from "./getDoc";
import { closeConn } from "./closeConns";
import { send } from "./send";
import { messageListener } from "./messageListener";
import { knex } from "./knex";
import { decodeImportBlobMeta } from "loro-crdt";
const pingTimeout = 30000;

export const setupWSConnection = async (conn: WebSocket, docName: string) => {
  conn.binaryType = "arraybuffer";

  let isDocLoaded = false;
  let queuedMessages: any[] = [];
  let isConnectionAlive = true;

  const [doc, isNew] = getDoc(docName, conn);

  doc.conns.set(conn, new Set());

  const sendSyncStep1 = async () => {
    const updates = await knex("items")
      .where("docname", doc.name)
      .orderBy("id");
    const updatesss = updates.map((row) => new Uint8Array(row.update));
    for (const update of updatesss) {
      //   console.log(update);
      //   console.log(decodeImportBlobMeta(update));
      //   send(doc, conn, update);
    }
  };

  if (isNew) {
    isDocLoaded = true;
    const updates = await knex("items")
      .where("docname", doc.name)
      .orderBy("id");

    const updatesss = updates.map((row) => new Uint8Array(row.update));

    sendSyncStep1();
    queuedMessages.forEach((message) => messageListener(conn, doc, message));
  } else {
    isDocLoaded = true;
    sendSyncStep1();
  }

  conn.on("message", (message) => {
    if (isDocLoaded) {
      const update = new Uint8Array(message as ArrayBuffer);
      doc.import(update);
      //   console.debug(update);
      //   messageListener(conn, doc, update);
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
