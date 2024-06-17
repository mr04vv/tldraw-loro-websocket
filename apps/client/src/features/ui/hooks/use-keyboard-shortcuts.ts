import { useEditor } from "@tldraw/editor";
import hotkeys from "hotkeys-js";
import { useCallback } from "react";

export const useKeyboardShortcuts = () => {
  const editor = useEditor();

  const bindKeys = useCallback(() => {
    const disposables = new Array<() => void>();

    const bindkey = (key: string, callback: (event: KeyboardEvent) => void) => {
      hotkeys(key, callback);
      disposables.push(() => {
        hotkeys.unbind(key);
      });
    };

    bindkey("backspace,del", () => {
      editor.deleteShapes(editor.getSelectedShapeIds());
    });
    bindkey("m", () => {
      editor.setCurrentTool("message");
    });

    return { disposables };
  }, [editor]);

  return {
    bindKeys,
  };
};
