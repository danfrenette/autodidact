import { useCallback, useMemo, useState } from "react";

import type { ConfigParams } from "@/requests/update-config/index.ts";
import { validateSetupDraft } from "@/screens/setup-domain";

type Params = {
  obsidianVaultPath: string;
  provider: string;
  accessToken: string;
  modelId: string;
  backendError: string | null;
  onSubmit: (params: ConfigParams) => void;
};

export function useSetupSubmit({
  obsidianVaultPath,
  provider,
  accessToken,
  modelId,
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

  const submit = useCallback(() => {
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
  }, [obsidianVaultPath, onSubmit, accessToken, provider, modelId]);

  return {
    error,
    submit,
    clearValidationError,
  };
}
