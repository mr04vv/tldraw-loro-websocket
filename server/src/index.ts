import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { WebSocketServer } from "ws";

import { setupWSConnection } from "./setupWsConnection";
import urls from "url";
const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const port = 1234;
console.log(`Server is running on port ${port}`);

const server = serve({
  fetch: app.fetch,
  port,
});

const wss = new WebSocketServer({
  noServer: true,
});

wss.on("connection", async (ws, req) => {
  const url = urls.parse(req.url ?? "", true);
  const docname = url.query["docname"];
  if (typeof docname !== "string") return;
  setupWSConnection(ws, docname);
});

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});
