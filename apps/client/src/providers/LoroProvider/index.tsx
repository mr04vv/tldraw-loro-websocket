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

const isNumberString = (str: string): str is `${number}` => !isNaN(Number(str));

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
    [doc.peerIdStr],
  );

  useEffect(() => {
    awareness.addListener((_, origin) => {
      if (origin !== "local") return;
      if (wsProvider.readyState !== wsProvider.OPEN) return;
      const peerId = awareness.getLocalState()?.userId;
      if (!peerId) return;
      if (!isNumberString(peerId)) return;
      const encoded = awareness.encode([peerId]);
      wsProvider.send(encoded);
    });
  }, [awareness, wsProvider]);

  return (
    <LoroContext.Provider value={{ doc, wsProvider, awareness, userName }}>
      {children}
    </LoroContext.Provider>
  );
};
