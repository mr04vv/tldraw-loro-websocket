import { Awareness, Loro } from "loro-crdt";
import { useEffect, useMemo } from "react";
import { createContextWrapper } from "../../utils/createContextWrapper";

export type AwarenessState = {
  userId: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  userName: string;
};
type LoroContextType = {
  doc: Loro;
  wsProvider: WebSocket;
  awareness: Awareness<AwarenessState>;
  userName: string;
};
const [useLoro, LoroContext] = createContextWrapper<LoroContextType>();
// eslint-disable-next-line react-refresh/only-export-components
export { useLoro };
type Props = {
  children: React.ReactNode;
};

export const LoroProvider = ({ children }: Props) => {
  const doc = useMemo(() => new Loro(), []);
  const docname = new URLSearchParams(location.search).get("docname");
  const userName =
    new URLSearchParams(location.search).get("userName") || "name";
  const wsProvider = useMemo(() => {
    return new WebSocket(`ws://localhost:1234?docname=${docname}`);
  }, [docname]);
  wsProvider.binaryType = "arraybuffer";
  const awareness = useMemo(
    () => new Awareness<AwarenessState>(doc.peerIdStr),
    [doc.peerIdStr]
  );

  useEffect(() => {
    awareness.addListener((_, origin) => {
      if (origin !== "local") return;
      const peerId = awareness.getLocalState()?.userId;
      if (!peerId) return;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const encoded = awareness.encode([peerId, peerId, peerId]);
      const messageType = 1;
      // messageTypeを先頭に付けてencodedを送信
      const message = new Uint8Array([messageType, ...encoded]);
      wsProvider.send(message);
    });
  }, [awareness, wsProvider]);

  return (
    <LoroContext.Provider value={{ doc, wsProvider, awareness, userName }}>
      {children}
    </LoroContext.Provider>
  );
};
