import { useKeyboardShortcuts } from "tldraw";

type UIProps = {
  children: React.ReactNode;
};

export const UI = (props: UIProps) => {
  const { children } = props;

  useKeyboardShortcuts();

  return <>{children}</>;
};
