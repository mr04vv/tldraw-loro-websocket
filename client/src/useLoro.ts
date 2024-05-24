import { Loro } from "loro-crdt";
import { useMemo } from "react";

export const useLoro = () => {
  const doc = useMemo(() => new Loro(), []);
  const docname = new URLSearchParams(location.search).get("docname");
  const wsProvider = useMemo(() => {
    return new WebSocket(`ws://localhost:1235?docname=${docname}`);
  }, [docname]);
  wsProvider.binaryType = "arraybuffer";

  return {
    doc,
    wsProvider,
  };
};
