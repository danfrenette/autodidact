import { useMemo, useState } from "react";

import type { SetupPrefill } from "@/providers/backend-provider.tsx";
import { type SetupField, setupFields } from "@/screens/setup-domain";
import {
  resolveInitialModel,
} from "@/screens/setup-models";
import {
  resolveAvailableProviders,
  resolveInitialProvider,
} from "@/screens/setup-providers";

type Params = {
  prefill: SetupPrefill;
  providerOptions: string[];
  providerModelOptions: Record<string, string[]>;
};

export function useSetupDraft({ prefill, providerOptions, providerModelOptions }: Params) {
  const availableProviders = useMemo(() => resolveAvailableProviders(providerOptions), [providerOptions]);
  const modelsForProvider = (nextProvider: string) => {
    return providerModelOptions[nextProvider] ?? [];
  };
  const [provider, setProviderState] = useState(() => resolveInitialProvider(prefill.provider, availableProviders));
  const [obsidianVaultPath, setObsidianVaultPath] = useState(prefill.obsidianVaultPath ?? "");
  const [accessToken, setAccessToken] = useState(prefill.accessToken ?? "");
  const modelValues = useMemo(() => modelsForProvider(provider), [provider, providerModelOptions]);
  const [modelId, setModelId] = useState(() => resolveInitialModel(prefill.modelId, modelValues));
  const [focusIndex, setFocusIndex] = useState(0);

  const setProvider = (nextProvider: string) => {
    setProviderState(nextProvider);
    const nextModels = modelsForProvider(nextProvider);
    setModelId((currentModel) => {
      if (nextModels.includes(currentModel)) {
        return currentModel;
      }

      return resolveInitialModel(prefill.modelId, nextModels);
    });
  };

  const focusByField = (field: SetupField) => {
    setFocusIndex(setupFields.indexOf(field));
  };

  const focusNext = () => {
    setFocusIndex((current) => (current + 1) % setupFields.length);
  };

  return {
    provider,
    obsidianVaultPath,
    accessToken,
    modelId,
    focusIndex,
    providerValues: availableProviders,
    modelValues,
    setProvider,
    setObsidianVaultPath,
    setAccessToken,
    setModelId,
    focusByField,
    focusNext,
  };
}
