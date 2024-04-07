import { useCallback, useEffect, useRef } from "react";
import "./App.css";
import "tldraw/tldraw.css";
import { useLoro } from "./useLoro";
import { LoroEventBatch, VersionVector } from "loro-crdt";
import { TLRecord, TLShape, TLShapeId, Tldraw, useEditor } from "tldraw";
function App() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw>
        <Component />
      </Tldraw>
    </div>
  );
}

export default App;

const Component = () => {
  const versionRef = useRef<VersionVector>();

  const editor = useEditor();
  const { doc, wsProvider } = useLoro();

  const includeAssetOrShapeString = (str: string) => {
    return str.includes("asset") || str.includes("shape");
  };

  const isAssetOrShape = (typeName: string) => {
    return typeName === "asset" || typeName === "shape";
  };

  const updateMap = useCallback(
    (shape: TLRecord) => {
      doc.getMap("map").set(shape.id, shape);
    },
    [doc]
  );

  const _handleAdded = useCallback(
    (added: TLRecord[]) => {
      added.forEach((shape) => {
        // TODO: ここにキャンバスに追加されたときの処理を書く
        if (!isAssetOrShape(shape?.typeName)) return;
        updateMap(shape);
      });
    },
    [updateMap]
  );

  const removeFromMap = useCallback(
    (shape: TLRecord) => {
      doc.getMap("map").delete(shape.id);
    },
    [doc]
  );

  const handleMapUpdate = (e: LoroEventBatch) => {
    console.log("hogehoge");
    if (e.by === "local") {
      const updated = doc.exportFrom(versionRef.current);
      console.log(updated);
      wsProvider.send(updated);
    }
    if (e.by === "checkout") {
      console.log("checkout", e);
    }
    if (e.by === "import") {
      const updateShapes: TLRecord[] = [];
      const deleteShapeIds: TLShapeId[] = [];
      const events = e.events;
      console.log(events);
      for (const event of events) {
        if (event.diff.type === "map") {
          const map = event.diff.updated;
          console.log(map);
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
  };

  const handleWsMessage = useCallback(
    async (ev: MessageEvent) => {
      const bytes = new Uint8Array(ev.data as ArrayBuffer);
      console.log(bytes);
      doc.import(bytes);
      versionRef.current = doc.version();
    },
    [doc]
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
  });

  useEffect(() => {
    const listen = editor.store.listen((e) => {
      const { changes, source } = e;
      if (source !== "user") return;
      const { added, removed, updated } = changes;
      const addedObjKey = Object.keys(added);
      const addedObj = Object.values(added);
      const updatedObjKey = Object.keys(updated);
      const updatedObj = Object.values(updated);
      const removedObj = Object.values(removed);

      if (addedObj.length) {
        const includeShape = addedObjKey.some((key) =>
          includeAssetOrShapeString(key)
        );
        if (includeShape) {
          _handleAdded(addedObj);
        }
      }

      if (updatedObj.length) {
        const includeShape = updatedObjKey.some((key) =>
          includeAssetOrShapeString(key)
        );
        if (includeShape) {
          updatedObj.forEach((shape) => {
            // TODO: ここに編集されたときの処理を書く
            const updatedShape = shape[1];
            if (!isAssetOrShape(updatedShape?.typeName)) return;
            updateMap(updatedShape);
          });
        }
      }

      if (removedObj.length) {
        removedObj.forEach((shape) => {
          removeFromMap(shape);
        });
      }
      versionRef.current = doc.version();
      doc.commit();
    });
    return listen;
  }, [_handleAdded, doc, editor.store, removeFromMap, updateMap]);
  return <></>;
};
