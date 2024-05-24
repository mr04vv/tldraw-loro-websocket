import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import "tldraw/tldraw.css";
import { useLoro } from "./useLoro";
import { LoroEventBatch, OpId, VersionVector } from "loro-crdt";
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

  useEffect(() => {
    console.debug(editor.getPageStates()[0].editingShapeId);
  }, [editor]);

  console.log("peerId", doc.peerId);

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
        // editor.cancel();
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

  const versionsRef = useRef<OpId[][]>([]);
  const [versionNum, setVersionNum] = useState(-1);
  const [maxVersion, setMaxVersion] = useState(-1);
  const handleMapUpdate = (e: LoroEventBatch) => {
    console.log(i);
    if (e.by !== "checkout") {
      versionsRef.current.push(doc.frontiers());
      setMaxVersion(versionsRef.current.length - 1);
      setVersionNum(versionsRef.current.length - 1);
    }
    if (e.by === "local") {
      console.debug("hogehoge");
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
      console.debug("import");
      const updateShapes: TLRecord[] = [];
      const deleteShapeIds: TLShapeId[] = [];
      const events = e.events;
      console.log(doc.frontiers());
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
  };

  let i = 0;
  const handleWsMessage = useCallback(
    async (ev: MessageEvent) => {
      const bytes = new Uint8Array(ev.data as ArrayBuffer);
      console.log(i++);
      // doc.import()
      doc.import(bytes);
      versionRef.current = doc.version();
    },
    [doc, i]
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

  const selectedShapes = editor.inputs;
  const a = useMemo(() => selectedShapes, [selectedShapes]);
  console.debug(a);
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
          versionRef.current = doc.version();
          doc.commit();
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
        versionRef.current = doc.version();
        doc.commit();
      }
    });
    return listen;
  }, [_handleAdded, doc, editor.store, removeFromMap, updateMap]);

  useEffect(() => {
    setTimeout(() => {
      localStorage.setItem("versionsRef", JSON.stringify(versionsRef.current));
    }, 1000);
  });

  useEffect(() => {
    const versionsRefFromLS = localStorage.getItem("versionsRef");
    versionsRef.current = JSON.parse(versionsRefFromLS || "[]");
  }, []);
  return (
    <div
      style={{
        position: "absolute",
        top: 200,
        left: 100,
        zIndex: 1000,
      }}
    >
      <input
        type="range"
        name="speed"
        min={-1}
        value={versionNum}
        max={maxVersion}
        style={{
          width: 500,
        }}
        onChange={(e) => {
          const v = Number(e.target.value);
          setVersionNum(v);
          if (v === -1) {
            doc.checkout([]);
          } else {
            if (v === versionsRef.current.length - 1) {
              doc.checkoutToLatest();
            } else {
              console.log(versionsRef.current);
              doc.checkout(versionsRef.current[v]);
            }
          }
        }}
      />
    </div>
  );
};
