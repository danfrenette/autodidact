import type { KeyEvent } from "@opentui/core";
import { useCallback, useMemo, useState } from "react";

import { resolveAvailableModels } from "@/screens/setup/models";
import { resolveAvailableProviders } from "@/screens/setup/providers";
import { useCombobox } from "@/screens/setup/wizard/use-combobox";

import { useModelPickerDisclosure } from "./use-model-picker-disclosure";

type Params = {
  provider: string;
  model: string;
  providerOptions: string[];
  providerModelOptions: Record<string, string[]>;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
  submitting: boolean;
};

export function useModelPicker({
  provider,
  model,
  providerOptions,
  providerModelOptions,
  onProviderChange,
  onModelChange,
  submitting,
}: Params) {
  const [activePicker, setActivePicker] = useState<"provider" | "model">("model");
  const disclosure = useModelPickerDisclosure({ disabled: submitting });

  const resolvedProviderOptions = useMemo(
    () => resolveAvailableProviders(providerOptions),
    [providerOptions],
  );

  const resolvedModelOptions = useMemo(
    () => resolveAvailableModels(providerModelOptions[provider] ?? []),
    [provider, providerModelOptions],
  );

  const providerCombobox = useCombobox({
    options: resolvedProviderOptions,
    selectedValue: provider,
    focused: disclosure.isOpen && activePicker === "provider",
    onCommit: (nextValue) => {
      onProviderChange(nextValue);
      setActivePicker("model");
    },
  });

  const modelCombobox = useCombobox({
    options: resolvedModelOptions,
    selectedValue: model,
    focused: disclosure.isOpen && activePicker === "model",
    onCommit: (nextValue) => {
      onModelChange(nextValue);
    },
  });

  const onProviderPress = useCallback(() => {
    setActivePicker("provider");
    disclosure.open();
  }, [disclosure]);

  const onModelPress = useCallback(() => {
    setActivePicker("model");
    disclosure.open();
  }, [disclosure]);

  const onChevronPress = useCallback(() => {
    if (disclosure.isOpen) {
      disclosure.close();
      return;
    }
    setActivePicker("model");
    disclosure.open();
  }, [disclosure]);

  const handleKey = useCallback(
    (key: KeyEvent): boolean => {
      if (!disclosure.isOpen) return false;
      if (activePicker === "provider" && providerCombobox.handleKey(key)) return true;
      if (activePicker === "model" && modelCombobox.handleKey(key)) return true;
      if (key.name === "tab" || key.name === "backtab" || (key.name === "tab" && key.shift)) {
        key.preventDefault();
        setActivePicker(activePicker === "provider" ? "model" : "provider");
        return true;
      }
      return false;
    },
    [activePicker, disclosure.isOpen, modelCombobox, providerCombobox],
  );

  return {
    isOpen: disclosure.isOpen,
    handleKeyboard: disclosure.handleKeyboard,
    handleKey,
    activePicker,
    providerCombobox: { ...providerCombobox, focused: disclosure.isOpen && activePicker === "provider" },
    modelCombobox: { ...modelCombobox, focused: disclosure.isOpen && activePicker === "model" },
    onProviderPress,
    onModelPress,
    onChevronPress,
  };
}
