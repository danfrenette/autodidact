import type { TextareaRenderable } from "@opentui/core";
import type { RefObject } from "react";
import { useCallback, useState } from "react";

import type { SubmitResult } from "@/hooks/use-file-path-autocomplete";
import type { AnalysisResult } from "@/requests/analyze-source";

type Params = {
  resolveSubmit: () => SubmitResult;
  selectedTags: string[];
  textareaRef: RefObject<TextareaRenderable | null>;
  value: string;
  onInput: (v: string) => void;
  onSubmit: (path: string, tags: string[]) => Promise<AnalysisResult | null>;
  onSubmitSucceeded: () => void;
  onAutocompleteSelected: () => void;
  openOutputModal: () => void;
  submitting: boolean;
};

export function useSourceInputSubmit({
  resolveSubmit,
  selectedTags,
  textareaRef,
  value,
  onInput,
  onSubmit,
  onSubmitSucceeded,
  onAutocompleteSelected,
  openOutputModal,
  submitting,
}: Params) {
  const [validationError, setValidationError] = useState<string | null>(null);

  const clearValidationError = useCallback(() => setValidationError(null), []);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    const currentText = textareaRef.current?.plainText ?? value;
    if (currentText !== value) {
      onInput(currentText);
    }
    const result = resolveSubmit();
    if (result.type === "validation-error") {
      if (currentText.trim().length > 0) {
        setValidationError(null);
        onSubmitSucceeded();
        const analysisResult = await onSubmit(currentText.trim(), selectedTags);
        if (analysisResult?.status === "completed") openOutputModal();
        return;
      }
      setValidationError(result.message);
      return;
    }
    if (result.type === "selected-suggestion") {
      setValidationError(null);
      onAutocompleteSelected();
      return;
    }

    setValidationError(null);
    onSubmitSucceeded();
    const analysisResult = await onSubmit(result.path, selectedTags);
    if (analysisResult?.status === "completed") openOutputModal();
  }, [resolveSubmit, onInput, onSubmitSucceeded, onAutocompleteSelected, onSubmit, openOutputModal, submitting, value, selectedTags, textareaRef]);

  return { handleSubmit, validationError, clearValidationError };
}
