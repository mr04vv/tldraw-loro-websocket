import { useEffect } from "react";
import { useLog } from "../../providers";

export const Logger = () => {
  const { logs, log } = useLog();

  useEffect(() => {
    log({ type: "info", message: "Logger mounted" });
  }, []);

  const formattedLogs = logs.map((log) => `[${log.type}] ${log.message}`);

  return formattedLogs.map((log, i) => <div key={i}>{log}</div>);
};
