import { createContext, useContext } from "react";

export const createContextWrapper = <T>() => {
  const ctx = createContext<T | undefined>(undefined);
  function useCtx() {
    const c = useContext(ctx);
    if (!c) {
      // コンテキストの中身がundefined(Providerでvalueを渡してない)の場合エラーがthrowされる
      throw new Error("useCtx must be inside a Provider with a value");
    }
    return c;
  }
  return [useCtx, ctx] as const;
};
