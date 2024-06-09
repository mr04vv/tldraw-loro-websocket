import { useCallback } from "react";
import { TLRecord } from "tldraw";
import { useLoro } from "../../providers";

export const useCrdt = () => {
  const { doc } = useLoro();
  const removeFromMap = useCallback(
    (shape: TLRecord) => {
      doc.getMap("map").delete(shape.id);
    },
    [doc]
  );

  const updateMap = useCallback(
    (shape: TLRecord) => {
      doc.getMap("map").set(shape.id, shape);
    },
    [doc]
  );

  return {
    updateMap,
    removeFromMap,
  };
};
