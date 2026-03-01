import type { KeyEvent } from "@opentui/core";
import { useKeyboard } from "@opentui/react";

type KeyHandler = (key: KeyEvent) => boolean;


export function useKeyboardDispatch(handlers: ReadonlyArray<KeyHandler>) {
  useKeyboard((key) => {
    for (const handler of handlers) {
      if (handler(key)) return;
    }
  });
}
