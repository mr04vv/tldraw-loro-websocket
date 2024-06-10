import { useEffect } from "react";
import { useKeyboardShortcuts } from "./hooks";

type UIProps = {
  children: React.ReactNode;
};

export const UI = (props: UIProps) => {
  const { children } = props;

  const { bindKeys } = useKeyboardShortcuts();

  useEffect(() => {
    const { disposables } = bindKeys();
    return () => {
      disposables.forEach((d) => d());
    };
  }, [bindKeys]);

  return <>{children}</>;
};
