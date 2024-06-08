import { Loro } from "loro-crdt";
import { useMemo } from "react";
import { createContextWrapper } from "../../utils/createContextWrapper";
type LoroContextType = {
  doc: Loro;
  wsProvider: WebSocket;
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
  const wsProvider = useMemo(() => {
    return new WebSocket(`ws://localhost:1234?docname=${docname}`);
  }, [docname]);
  wsProvider.binaryType = "arraybuffer";

  return (
    <LoroContext.Provider value={{ doc, wsProvider }}>
      {children}
    </LoroContext.Provider>
  );
};
