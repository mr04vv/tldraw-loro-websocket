import { useCallback, useState } from "react";
import { createContextWrapper } from "../../utils/createContextWrapper";
import { Log } from "./logprovider-schema";

export * from "./logprovider-schema";

type LogContextState = {
  logs: Log[];
  maxLogs: number;
  visible: boolean;
};

type LogContextType = LogContextState & {
  log: (log: Log) => void;
  toggleLog: () => void;
  setMaxLogs: (maxLogs: number) => void;
};

const [useLog, LogContext] = createContextWrapper<LogContextType>();

export { useLog };

type Props = { children: React.ReactNode };

export const LogProvider = ({ children }: Props) => {
  const [state, setState] = useState<LogContextState>({
    logs: [],
    maxLogs: 10,
    visible: true,
  });

  const log = useCallback((log: Log) => {
    setState((prevState) => {
      const logs = [...prevState.logs, log];
      if (logs.length > prevState.maxLogs) {
        logs.shift();
      }
      return { ...prevState, logs };
    });
  }, []);

  const toggleLog = useCallback(() => {
    setState((prevState) => ({ ...prevState, visible: !prevState.visible }));
  }, []);

  const setMaxLogs = useCallback((maxLogs: number) => {
    setState((prevState) => ({ ...prevState, maxLogs }));
  }, []);

  return (
    <LogContext.Provider value={{ ...state, log, toggleLog, setMaxLogs }}>
      {children}
    </LogContext.Provider>
  );
};
