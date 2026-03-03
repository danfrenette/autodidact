import type { KeyEvent } from "@opentui/core";
import { useKeyboard } from "@opentui/react";

type Params = {
  providerFocused: boolean;
  modelFocused: boolean;
  embeddingProviderFocused: boolean;
  embeddingModelFocused: boolean;
  providerHandleKey: (key: KeyEvent) => boolean;
  modelHandleKey: (key: KeyEvent) => boolean;
  embeddingProviderHandleKey: (key: KeyEvent) => boolean;
  embeddingModelHandleKey: (key: KeyEvent) => boolean;
  focusNext: () => void;
  focusPrevious: () => void;
  goPreviousStep: () => void;
  onExit: () => void;
};

export function useNavigation({
  providerFocused,
  modelFocused,
  embeddingProviderFocused,
  embeddingModelFocused,
  providerHandleKey,
  modelHandleKey,
  embeddingProviderHandleKey,
  embeddingModelHandleKey,
  focusNext,
  focusPrevious,
  goPreviousStep,
  onExit,
}: Params) {
  const anyComboboxFocused = providerFocused || modelFocused || embeddingProviderFocused || embeddingModelFocused;

  useKeyboard((key) => {
    if (providerFocused && providerHandleKey(key)) {
      return;
    }

    if (modelFocused && modelHandleKey(key)) {
      return;
    }

    if (embeddingProviderFocused && embeddingProviderHandleKey(key)) {
      return;
    }

    if (embeddingModelFocused && embeddingModelHandleKey(key)) {
      return;
    }

    if (key.name === "escape" || (key.name === "c" && key.ctrl)) {
      onExit();
      return;
    }

    if (key.name === "backtab" || (key.name === "tab" && key.shift)) {
      if (modelFocused || embeddingModelFocused) {
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

    if (key.name === "left" || (key.name === "backspace" && !anyComboboxFocused)) {
      goPreviousStep();
      key.preventDefault();
    }
  });
}
