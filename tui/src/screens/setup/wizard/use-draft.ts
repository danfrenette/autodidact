import { useMemo, useState } from "react";

import type { SetupPrefill } from "@/providers/backend-provider.tsx";
import { resolveInitialModel } from "@/screens/setup/models";
import { resolveAvailableProviders, resolveInitialProvider } from "@/screens/setup/providers";

import {
  fieldsForStep,
  firstFieldForStep,
  initialStepIndex,
  type SetupField,
  setupFields,
  type SetupStep,
  setupSteps,
  stepForField,
} from "./types";

type Params = {
  prefill: SetupPrefill;
  missingFields: string[];
  providerOptions: string[];
  providerModelOptions: Record<string, string[]>;
};

export function useDraft({ prefill, missingFields, providerOptions, providerModelOptions }: Params) {
  const availableProviders = useMemo(() => resolveAvailableProviders(providerOptions), [providerOptions]);
  const modelsForProvider = (nextProvider: string) => {
    return providerModelOptions[nextProvider] ?? [];
  };

  const [provider, setProviderState] = useState(() => resolveInitialProvider(prefill.provider, availableProviders));
  const [obsidianVaultPath, setObsidianVaultPath] = useState(prefill.obsidianVaultPath ?? "");
  const [accessToken, setAccessToken] = useState(prefill.accessToken ?? "");
  const modelValues = useMemo(() => modelsForProvider(provider), [provider, providerModelOptions]);
  const [modelId, setModelId] = useState(() => resolveInitialModel(prefill.modelId, modelValues));

  const [stepIndex, setStepIndex] = useState(() => initialStepIndex(missingFields));
  const [focusIndex, setFocusIndex] = useState(() => {
    const step = setupSteps[initialStepIndex(missingFields)] ?? setupSteps[0];
    return setupFields.indexOf(firstFieldForStep(step));
  });

  const currentStep = setupSteps[stepIndex] ?? setupSteps[0];

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
    const index = setupFields.indexOf(field);
    if (index === -1) {
      return;
    }

    setFocusIndex(index);
    setStepIndex(setupSteps.indexOf(stepForField(field)));
  };

  const focusNext = () => {
    const stepFields = fieldsForStep(currentStep);
    const firstStepField = stepFields[0] ?? firstFieldForStep(currentStep);
    const currentField = setupFields[focusIndex] ?? firstStepField;
    const currentStepPosition = stepFields.indexOf(currentField);
    if (currentStepPosition === -1) {
      focusByField(firstStepField);
      return;
    }

    const nextField = stepFields[(currentStepPosition + 1) % stepFields.length] ?? firstStepField;
    focusByField(nextField);
  };

  const goToStep = (step: SetupStep) => {
    const nextStepIndex = setupSteps.indexOf(step);
    if (nextStepIndex === -1) {
      return;
    }

    setStepIndex(nextStepIndex);
    focusByField(firstFieldForStep(step));
  };

  const goNextStep = () => {
    const nextStep = setupSteps[Math.min(stepIndex + 1, setupSteps.length - 1)];
    if (nextStep) {
      goToStep(nextStep);
    }
  };

  const goPreviousStep = () => {
    const previousStep = setupSteps[Math.max(stepIndex - 1, 0)];
    if (previousStep) {
      goToStep(previousStep);
    }
  };

  return {
    provider,
    obsidianVaultPath,
    accessToken,
    modelId,
    currentStep,
    stepIndex,
    focusIndex,
    providerValues: availableProviders,
    modelValues,
    setProvider,
    setObsidianVaultPath,
    setAccessToken,
    setModelId,
    focusByField,
    focusNext,
    goToStep,
    goNextStep,
    goPreviousStep,
  };
}
