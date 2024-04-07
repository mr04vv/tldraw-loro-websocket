import { Loro, VersionVector } from "loro-crdt";
import { WebSocket } from "ws";
import { updateHandler } from "./updateHandler";

export class WSSharedDoc extends Loro {
  name: string;
  conns: Map<WebSocket, any>;
  versionVector: VersionVector;
  conn: WebSocket;
  constructor(name: string, conn: WebSocket) {
    super();
    this.name = name;
    this.conns = new Map();
    this.versionVector = this.version();
    this.conn = conn;

    this.subscribe((event) => {
      const updates = this.exportFrom(this.versionVector);
      updateHandler(updates, this.conn, this);
      this.versionVector = this.version();
    });
    // this.subscribe((event) => {
    //   const origin = event.origin;
    //   const update = event.events.map((e) => {
    //     if (e.diff.type === "map") {
    //       console.log(e.diff.updated);
    //       return e.diff.updated;
    //     }
    //   });
    //   updateHandler()
    // });

    // const awarenessChangeHandler = ({ added, updated, removed }, origin) => {
    //   const changedClients = added.concat(updated, removed);
    //   if (origin !== null) {
    //     const connControlledIds = this.conns.get(origin);
    //     if (connControlledIds) {
    //       added.forEach((clientId) => {
    //         connControlledIds.add(clientId);
    //       });
    //       removed.forEach((clientId) => {
    //         connControlledIds.delete(clientId);
    //       });
    //     }
    //   }

    //   const encoder = encoding.createEncoder();
    //   encoding.writeVarUint(encoder, messageAwareness);
    //   encoding.writeVarUint8Array(
    //     encoder,
    //     awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
    //   );
    //   const buff = encoding.toUint8Array(encoder);

    //   this.conns.forEach((_, c) => {
    //     send(this, c, buff);
    //   });
    // };
    // this.
    // this.awareness.on("update", awarenessChangeHandler);
    // this.on("update", updateHandler);

    // this.subscribe();
  }

  //   subscribe() {
  //     sub.subscribe([this.name, this.awarenessChannel]).then(() => {
  //       sub.on("messageBuffer", (channel, update) => {
  //         const channelId = channel.toString();

  //         if (channelId === this.name) {
  //           Y.applyUpdate(this, update, sub);
  //         } else if (channelId === this.awarenessChannel) {
  //           awarenessProtocol.applyAwarenessUpdate(this.awareness, update, sub);
  //         }
  //       });
  //     });
  //   }
}
