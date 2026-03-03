import { useCallback, useMemo, useState } from "react";

import type { ConfigParams } from "@/requests/update-config/index.ts";

import { validateSetupDraft } from "./types";

type Params = {
  obsidianVaultPath: string;
  provider: string;
  modelId: string;
  chatToken: string;
  embeddingProvider: string;
  embeddingModel: string;
  embeddingToken: string;
  backendError: string | null;
  onSubmit: (params: ConfigParams) => void;
};

export function useSubmit({
  obsidianVaultPath,
  provider,
  modelId: currentModelId,
  chatToken,
  embeddingProvider,
  embeddingModel,
  embeddingToken,
  backendError,
  onSubmit,
}: Params) {
  const [validationError, setValidationError] = useState<string | null>(null);

  const error = useMemo(() => validationError ?? backendError, [backendError, validationError]);

  const clearValidationError = useCallback(() => {
    if (validationError !== null) {
      setValidationError(null);
    }
  }, [validationError]);

  const submit = useCallback((modelId: string = currentModelId) => {
    const result = validateSetupDraft({
      obsidianVaultPath,
      provider,
      modelId,
      chatToken,
      embeddingProvider,
      embeddingModel,
      embeddingToken,
    });

    if (!result.ok) {
      setValidationError(result.message);
      return;
    }

    setValidationError(null);
    onSubmit(result.payload);
  }, [obsidianVaultPath, onSubmit, provider, currentModelId, chatToken, embeddingProvider, embeddingModel, embeddingToken]);

  return {
    error,
    submit,
    clearValidationError,
  };
}
