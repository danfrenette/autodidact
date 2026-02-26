import { useCallback, useMemo, useState } from "react";

import type { ConfigParams } from "@/requests/update-config/index.ts";

import { validateSetupDraft } from "./domain";

type Params = {
  obsidianVaultPath: string;
  provider: string;
  accessToken: string;
  modelId: string;
  backendError: string | null;
  onSubmit: (params: ConfigParams) => void;
};

export function useSubmit({
  obsidianVaultPath,
  provider,
  accessToken,
  modelId: currentModelId,
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
      accessToken,
      modelId,
    });

    if (!result.ok) {
      setValidationError(result.message);
      return;
    }

    setValidationError(null);
    onSubmit(result.payload);
  }, [obsidianVaultPath, onSubmit, accessToken, provider, currentModelId]);

  return {
    error,
    submit,
    clearValidationError,
  };
}
