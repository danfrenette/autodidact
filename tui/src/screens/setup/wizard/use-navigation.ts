import type { KeyEvent } from "@opentui/core";
import { useKeyboard } from "@opentui/react";

type Params = {
  providerFocused: boolean;
  modelFocused: boolean;
  providerHandleKey: (key: KeyEvent) => boolean;
  modelHandleKey: (key: KeyEvent) => boolean;
  focusNext: () => void;
  focusPrevious: () => void;
  goPreviousStep: () => void;
  onExit: () => void;
};

export function useNavigation({
  providerFocused,
  modelFocused,
  providerHandleKey,
  modelHandleKey,
  focusNext,
  focusPrevious,
  goPreviousStep,
  onExit,
}: Params) {
  useKeyboard((key) => {
    if (providerFocused && providerHandleKey(key)) {
      return;
    }

    if (modelFocused && modelHandleKey(key)) {
      return;
    }

    if (key.name === "escape" || (key.name === "c" && key.ctrl)) {
      onExit();
      return;
    }

    if (key.name === "backtab" || (key.name === "tab" && key.shift)) {
      if (modelFocused) {
        focusPrevious();
      } else {
        goPreviousStep();
      }

      key.preventDefault();
      return;
    }

    if (key.name === "tab") {
      focusNext();
      key.preventDefault();
      return;
    }

    if (key.name === "left" || (key.name === "backspace" && !modelFocused && !providerFocused)) {
      goPreviousStep();
      key.preventDefault();
    }
  });
}
