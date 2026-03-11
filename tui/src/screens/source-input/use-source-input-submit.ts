import type { TextareaRenderable } from "@opentui/core";
import type { RefObject } from "react";
import { useCallback, useState } from "react";

import type { AnalyzeSourceParams } from "@/backend.ts";
import { useStableEvent } from "@/hooks/use-stable-event";
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

type SubmitIntent =
  | { type: "submit-analysis"; input: string }
  | { type: "select-autocomplete" }
  | { type: "validation-error"; message: string };

export function resolveSubmitIntent(currentText: string, result: SubmitResult): SubmitIntent {
  if (result.type === "selected-suggestion") {
    return { type: "select-autocomplete" };
  }

  if (result.type === "submit-path") {
    return { type: "submit-analysis", input: result.path };
  }

  const trimmed = currentText.trim();
  if (trimmed.length > 0) {
    return { type: "submit-analysis", input: trimmed };
  }

  return { type: "validation-error", message: result.message };
}

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

  const submitAnalysis = useStableEvent(async (input: string) => {
    onSubmitSucceeded();
    const analysisResult = await onSubmit({ input, tags: selectedTags });
    if (analysisResult?.status === "completed") openOutputModal();
  });

  const handleSubmit = useStableEvent(async () => {
    if (submitting) return;

    const currentText = textareaRef.current?.plainText ?? value;
    if (currentText !== value) {
      onInput(currentText);
    }

    const intent = resolveSubmitIntent(currentText, resolveSubmit());

    if (intent.type === "validation-error") {
      setValidationError(intent.message);
      return;
    }

    setValidationError(null);

    if (intent.type === "select-autocomplete") {
      onAutocompleteSelected();
      return;
    }

    await submitAnalysis(intent.input);
  });

  const clearValidationError = useCallback(() => setValidationError(null), []);

  return { handleSubmit, validationError, clearValidationError };
}
