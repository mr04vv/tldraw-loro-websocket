import { useEditor } from "@tldraw/editor";
import hotkeys from "hotkeys-js";
import { useCallback } from "react";
import { useLog } from "../../../providers";

export const useKeyboardShortcuts = () => {
  const { log } = useLog();
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
    bindkey("c", () => {
      const count = editor.getCurrentPageShapes().length;
      log({ type: "info", message: `Shape count: ${count}` });
    });

    return { disposables };
  }, [editor]);

  return {
    bindKeys,
  };
};
