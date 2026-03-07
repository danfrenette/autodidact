import type { TextareaRenderable } from "@opentui/core";
import type { RefObject } from "react";
import { useCallback, useRef, useState } from "react";

import type { AnalyzeSourceParams } from "@/backend.ts";
import type { SubmitResult } from "@/hooks/use-file-path-autocomplete";
import type { AnalysisResult } from "@/requests/analyze-source";

type Params = {
  resolveSubmit: () => SubmitResult;
  selectedTags: string[];
  textareaRef: RefObject<TextareaRenderable | null>;
  value: string;
  onInput: (v: string) => void;
  onSubmit: (params: AnalyzeSourceParams) => Promise<AnalysisResult | null>;
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
  const latestSelectedTags = useRef(selectedTags);
  latestSelectedTags.current = selectedTags;

  const clearValidationError = useCallback(() => setValidationError(null), []);

  let thing = 123;
  console.log(thing);

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
        const analysisResult = await onSubmit({ input: currentText.trim(), tags: latestSelectedTags.current });
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
    const analysisResult = await onSubmit({ input: result.path, tags: latestSelectedTags.current });
    if (analysisResult?.status === "completed") openOutputModal();
  }, [resolveSubmit, onInput, onSubmitSucceeded, onAutocompleteSelected, onSubmit, openOutputModal, submitting, value, textareaRef]);

  return { handleSubmit, validationError, clearValidationError };
}
