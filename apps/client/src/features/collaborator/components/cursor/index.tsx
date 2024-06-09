import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AwarenessState, useLoro } from "../../../../providers";

export const CollaboratorCursors = () => {
  const { awareness } = useLoro();
  const [awarenessStates, setAwarenessStates] = useState<{
    [clientId: string]: AwarenessState;
  }>({});
  useEffect(() => {
    awareness.addListener((updated, origin) => {
      if (origin === "local") return;
      const awarenessStates = awareness.getAllStates();
      updated.updated.forEach((updatedClientId) => {
        const state = awarenessStates[updatedClientId];
        setAwarenessStates((prev) => ({
          ...prev,
          [updatedClientId]: state,
        }));
      });
    });
  }, [awareness]);

  return (
    <div
      style={{
        zIndex: 999999,
        position: "fixed",
        pointerEvents: "none",
        userSelect: "none",
        top: 0,
      }}
    >
      <>
        {Object.values(awarenessStates).map((value) => {
          if (!value.position || !value.userName || !value.userId) return null;
          return (
            <motion.div
              style={{
                backgroundColor: "blue",
                borderRadius: 40,
                padding: 8,
                width: 100,
                height: 40,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 16,
                overflow: "visible",
                pointerEvents: "none",
                transformOrigin: "top left",
                position: "absolute",
                x: value.position.x,
                y: value.position.y,
              }}
              key={value.userId}
            >
              {value.userName}
            </motion.div>
          );
        })}
      </>
    </div>
  );
};
