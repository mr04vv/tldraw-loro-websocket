import { Tldraw } from "tldraw";
import { useC3Effect } from "../../hooks";

export const Editor = () => {
  return (
    <Tldraw>
      <Inner />
    </Tldraw>
  );
};

const Inner = () => {
  useC3Effect();

  return null;
};
