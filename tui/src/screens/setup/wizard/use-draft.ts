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
  embeddingProviderOptions: string[];
  embeddingProviderModelOptions: Record<string, string[]>;
  storedTokens: Record<string, string>;
};

export function useDraft({
  prefill,
  missingFields,
  providerOptions,
  providerModelOptions,
  embeddingProviderOptions,
  embeddingProviderModelOptions,
  storedTokens,
}: Params) {
  // --- chat provider / model ---
  const availableProviders = useMemo(() => resolveAvailableProviders(providerOptions), [providerOptions]);
  const chatModelsForProvider = (p: string) => providerModelOptions[p] ?? [];

  const [provider, setProviderState] = useState(() => resolveInitialProvider(prefill.provider, availableProviders));
  const [obsidianVaultPath, setObsidianVaultPath] = useState(prefill.obsidianVaultPath ?? "");
  const [chatToken, setChatToken] = useState(() => storedTokens[prefill.provider] ?? "");
  const chatModelValues = useMemo(() => chatModelsForProvider(provider), [provider, providerModelOptions]);
  const [modelId, setModelId] = useState(() => resolveInitialModel(prefill.modelId, chatModelValues));

  // --- embedding provider / model ---
  const availableEmbeddingProviders = useMemo(
    () => resolveAvailableProviders(embeddingProviderOptions),
    [embeddingProviderOptions],
  );
  const embeddingModelsForProvider = (p: string) => embeddingProviderModelOptions[p] ?? [];

  const [embeddingProvider, setEmbeddingProviderState] = useState(() =>
    resolveInitialProvider(prefill.embeddingProvider, availableEmbeddingProviders),
  );
  const [embeddingToken, setEmbeddingToken] = useState(() => storedTokens[prefill.embeddingProvider] ?? "");
  const embeddingModelValues = useMemo(
    () => embeddingModelsForProvider(embeddingProvider),
    [embeddingProvider, embeddingProviderModelOptions],
  );
  const [embeddingModel, setEmbeddingModelState] = useState(() =>
    resolveInitialModel(prefill.embeddingModel, embeddingModelValues),
  );

  // --- step / focus ---
  const [stepIndex, setStepIndex] = useState(() => initialStepIndex(missingFields));
  const [focusIndex, setFocusIndex] = useState(() => {
    const step = setupSteps[initialStepIndex(missingFields)] ?? setupSteps[0];
    return setupFields.indexOf(firstFieldForStep(step));
  });

  const currentStep = setupSteps[stepIndex] ?? setupSteps[0];

  // --- setters ---
  const setProvider = (nextProvider: string) => {
    setProviderState(nextProvider);
    // auto-fill token from storedTokens if available, but don't clobber user-entered value
    setChatToken((current) => (current.length === 0 ? (storedTokens[nextProvider] ?? "") : current));
    const nextModels = chatModelsForProvider(nextProvider);
    setModelId((currentModel) =>
      nextModels.includes(currentModel) ? currentModel : resolveInitialModel(prefill.modelId, nextModels),
    );
  };

  const setEmbeddingProvider = (nextProvider: string) => {
    setEmbeddingProviderState(nextProvider);
    setEmbeddingToken((current) => (current.length === 0 ? (storedTokens[nextProvider] ?? "") : current));
    const nextModels = embeddingModelsForProvider(nextProvider);
    setEmbeddingModelState((currentModel) =>
      nextModels.includes(currentModel) ? currentModel : resolveInitialModel(prefill.embeddingModel, nextModels),
    );
  };

  // --- focus helpers (unchanged logic, new field set) ---
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

  const focusPrevious = () => {
    const stepFields = fieldsForStep(currentStep);
    const firstStepField = stepFields[0] ?? firstFieldForStep(currentStep);
    const currentField = setupFields[focusIndex] ?? firstStepField;
    const currentStepPosition = stepFields.indexOf(currentField);
    if (currentStepPosition === -1) {
      focusByField(firstStepField);
      return;
    }

    const previousIndex = currentStepPosition === 0 ? stepFields.length - 1 : currentStepPosition - 1;
    const previousField = stepFields[previousIndex] ?? firstStepField;
    focusByField(previousField);
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
    // vault
    obsidianVaultPath,
    setObsidianVaultPath,
    // chat
    provider,
    modelId,
    chatToken,
    providerValues: availableProviders,
    modelValues: chatModelValues,
    setProvider,
    setModelId,
    setChatToken,
    // embedding
    embeddingProvider,
    embeddingModel,
    embeddingToken,
    embeddingProviderValues: availableEmbeddingProviders,
    embeddingModelValues,
    setEmbeddingProvider,
    setEmbeddingModel: setEmbeddingModelState,
    setEmbeddingToken,
    // navigation
    currentStep,
    stepIndex,
    focusIndex,
    focusByField,
    focusNext,
    focusPrevious,
    goToStep,
    goNextStep,
    goPreviousStep,
  };
}
