import { Loro } from "loro-crdt";
import { useMemo } from "react";

export const useLoro = () => {
  const doc = useMemo(() => new Loro(), []);

  const wsProvider = useMemo(() => {
    return new WebSocket("ws://localhost:1234?docname=room1");
  }, []);
  wsProvider.binaryType = "arraybuffer";

  return {
    doc,
    wsProvider,
  };
};
