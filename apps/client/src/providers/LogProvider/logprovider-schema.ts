export type Log = {
  type: LogType;
  message: string;
};

export type LogType = "info" | "warn" | "error";
