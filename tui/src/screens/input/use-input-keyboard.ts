import type { KeyEvent } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useCallback, useState } from "react";

type KeyHandler = (key: KeyEvent) => boolean;

type Params = {
  chapterActive: boolean;
  chapterHandleKey: KeyHandler;
  autocompleteHandleKey: KeyHandler;
  modelPickerOpen: boolean;
  activePicker: "provider" | "model";
  setActivePicker: (picker: "provider" | "model") => void;
  providerComboboxHandleKey: KeyHandler;
  modelComboboxHandleKey: KeyHandler;
  modelPickerHandleKeyboard: KeyHandler;
  onboardingHandleKeyboard: (key: KeyEvent) => void;
};

export function useInputKeyboard({
  chapterActive,
  chapterHandleKey,
  autocompleteHandleKey,
  modelPickerOpen,
  activePicker,
  setActivePicker,
  providerComboboxHandleKey,
  modelComboboxHandleKey,
  modelPickerHandleKeyboard,
  onboardingHandleKeyboard,
}: Params) {
  const [showOutputModal, setShowOutputModal] = useState(false);

  const openOutputModal = useCallback(() => setShowOutputModal(true), []);
  const closeOutputModal = useCallback(() => setShowOutputModal(false), []);

  useKeyboard((key) => {
    if (chapterActive && chapterHandleKey(key)) {
      return;
    }

    if (showOutputModal && (key.name === "escape" || key.name === "return")) {
      key.preventDefault();
      setShowOutputModal(false);
      return;
    }

    if (autocompleteHandleKey(key)) {
      return;
    }

    if (modelPickerOpen) {
      if (activePicker === "provider" && providerComboboxHandleKey(key)) {
        return;
      }
      if (activePicker === "model" && modelComboboxHandleKey(key)) {
        return;
      }
      if (key.name === "backtab" || (key.name === "tab" && key.shift)) {
        key.preventDefault();
        setActivePicker(activePicker === "provider" ? "model" : "provider");
        return;
      }
      if (key.name === "tab") {
        key.preventDefault();
        setActivePicker(activePicker === "provider" ? "model" : "provider");
        return;
      }
    }

    if (modelPickerHandleKeyboard(key)) {
      return;
    }

    onboardingHandleKeyboard(key);
  });

  return { showOutputModal, openOutputModal, closeOutputModal };
}
