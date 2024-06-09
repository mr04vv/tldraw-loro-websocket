import { useCallback, useEffect, useRef } from "react";
import { TLRecord, TLShape, TLShapeId, useEditor } from "tldraw";
import { LoroEventBatch, VersionVector } from "loro-crdt";
import { useCrdt } from "..";
import { useLoro } from "../../providers";

/**
 * This hook is responsible for syncing the editor state with the CRDT.
 * C3 means Connect Canvas and CRDT.
 */
export const useC3Effect = () => {
  const editor = useEditor();
  const { updateMap, removeFromMap } = useCrdt();
  const { doc, wsProvider, awareness, userName } = useLoro();
  const versionRef = useRef<VersionVector>();

  const includeAssetOrShapeString = (str: string) => {
    return str.includes("asset") || str.includes("shape");
  };
  const isAssetOrShape = (typeName: string) => {
    return typeName === "asset" || typeName === "shape";
  };

  const handleAddedObject = useCallback(
    (added: Record<string, TLRecord>) => {
      const addedObjKeys = Object.keys(added);
      const addedObj = Object.values(added);
      if (!addedObj.length) return;
      const includeShape = addedObjKeys.some((key) =>
        includeAssetOrShapeString(key),
      );
      if (includeShape) {
        addedObj.forEach((shape) => {
          if (!isAssetOrShape(shape?.typeName)) return;
          updateMap(shape);
        });
      }
      versionRef.current = doc.version();
      doc.commit();
    },
    [doc, updateMap],
  );

  const handleUpdatedObject = useCallback(
    (updated: Record<string, [from: TLRecord, to: TLRecord]>) => {
      const updatedObjKeys = Object.keys(updated);
      const updatedObj = Object.values(updated);
      if (!updatedObj.length) return;
      const includeShape = updatedObjKeys.some((key) =>
        includeAssetOrShapeString(key),
      );
      if (includeShape) {
        updatedObj.forEach((shape) => {
          const updatedShape = shape[1];
          if (!isAssetOrShape(updatedShape?.typeName)) return;
          updateMap(updatedShape);
        });
        versionRef.current = doc.version();
        doc.commit();
      }
    },
    [doc, updateMap],
  );

  const handleRemovedObject = useCallback(
    (removed: Record<string, TLRecord>) => {
      const removedObj = Object.values(removed);
      if (!removedObj.length) return;
      removedObj.forEach((shape) => {
        removeFromMap(shape);
      });
      versionRef.current = doc.version();
      doc.commit();
    },
    [doc, removeFromMap],
  );

  useEffect(() => {
    const listen = editor.store.listen((e) => {
      const { changes, source } = e;
      if (source !== "user") return;
      const { added, removed, updated } = changes;

      handleAddedObject(added);
      handleUpdatedObject(updated);
      handleRemovedObject(removed);
    });
    return listen;
  }, [
    doc,
    editor.store,
    handleAddedObject,
    handleRemovedObject,
    handleUpdatedObject,
    removeFromMap,
    updateMap,
  ]);

  const handleWsMessage = useCallback(
    async (ev: MessageEvent) => {
      const message = ev.data;
      const arrayMessage = new Uint8Array(message);
      if (arrayMessage[0] === 1) {
        awareness.apply(new Uint8Array(message));
        return;
      }

      const bytes = new Uint8Array(message as ArrayBuffer);
      doc.import(bytes);
      versionRef.current = doc.version();
    },
    [awareness, doc],
  );

  const handleMapUpdate = useCallback(
    (e: LoroEventBatch) => {
      if (e.by === "local") {
        const updated = doc.exportFrom(versionRef.current);
        wsProvider.send(updated);
      }
      if (e.by === "checkout") {
        const updateShapes: TLRecord[] = [];
        const deleteShapeIds: TLShapeId[] = [];
        const events = e.events;
        for (const event of events) {
          if (event.diff.type === "map") {
            const map = event.diff.updated;
            Object.keys(map).forEach((key) => {
              const shape = map[key] as unknown as TLShape;
              if (shape === null) {
                deleteShapeIds.push(key as TLShapeId);
              } else {
                updateShapes.push(shape);
              }
            });
          }
        }
        editor.store.mergeRemoteChanges(() => {
          editor.store.put([...updateShapes]);
          editor.store.remove([...deleteShapeIds]);
        });
      }
      if (e.by === "import") {
        const updateShapes: TLRecord[] = [];
        const deleteShapeIds: TLShapeId[] = [];
        const events = e.events;
        for (const event of events) {
          if (event.diff.type === "map") {
            const map = event.diff.updated;

            Object.keys(map).forEach((key) => {
              const shape = map[key] as unknown as TLShape;
              if (shape === null) {
                deleteShapeIds.push(key as TLShapeId);
              } else {
                updateShapes.push(shape);
              }
            });
          }
        }
        editor.store.mergeRemoteChanges(() => {
          editor.store.put([...updateShapes]);
          editor.store.remove([...deleteShapeIds]);
        });
      }
    },
    [doc, editor.store, wsProvider],
  );

  useEffect(() => {
    wsProvider.addEventListener("message", handleWsMessage);
    return () => {
      wsProvider.removeEventListener("message", handleWsMessage);
    };
  }, [handleWsMessage, wsProvider]);

  useEffect(() => {
    const subscription = doc.subscribe(handleMapUpdate);
    return () => {
      doc.unsubscribe(subscription);
    };
  }, [doc, handleMapUpdate]);

  useEffect(() => {
    const handleMouseEvent = (e: MouseEvent) => {
      const pagePosition = editor.screenToPage({ x: e.clientX, y: e.clientY });
      awareness.setLocalState({
        position: {
          x: pagePosition.x,
          y: pagePosition.y,
          z: editor.getCamera().z,
        },
        userId: doc.peerIdStr,
        userName,
      });
    };

    window.addEventListener("mousemove", handleMouseEvent);
    return () => {
      window.removeEventListener("mousemove", handleMouseEvent);
    };
  }, [awareness, doc.peerIdStr, editor]);
};
