import { useEditor } from "@tldraw/editor";
import hotkeys from "hotkeys-js";
import { useCallback } from "react";

export const useKeyboardShortcuts = () => {
  const editor = useEditor();

  const bindKeys = useCallback(() => {
    const disposables = new Array<() => void>();

    hotkeys("backspace,del", () => {
      editor.deleteShapes(editor.getSelectedShapeIds());
    });

    return { disposables };
  }, [editor]);

  return {
    bindKeys,
  };
};
