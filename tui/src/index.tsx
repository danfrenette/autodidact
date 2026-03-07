import { createCliRenderer } from "@opentui/core";
import { createRoot, useRenderer } from "@opentui/react";
import { useCallback, useEffect, useState } from "react";

import { Backend } from "@/backend.ts";
import { useBackend } from "@/hooks/use-backend.ts";
import { OnboardingProvider } from "@/onboarding/context";
import type { AppFlowState } from "@/providers/backend-provider.tsx";
import { BackendProvider } from "@/providers/backend-provider.tsx";
import { Setup } from "@/screens/setup/index.tsx";
import { SourceInput } from "@/screens/source-input/index.tsx";

function AppContent() {
  const { state, analyzeSource, cancelRequest, updateConfig, setSourceInputProvider, setSourceInputModel, confirmChapter, cancelChapter, shutdown, listVaultTags } = useBackend();
  const renderer = useRenderer();

  const [vaultTags, setVaultTags] = useState<string[]>([]);

  useEffect(() => {
    if (state.name === "source-input") {
      void listVaultTags().then(setVaultTags).catch(() => {});
    }
  }, [state.name, listVaultTags]);

  const handleExit = useCallback(() => {
    renderer?.destroy();
    void shutdown();
  }, [renderer, shutdown]);

  const chapters = state.name === "source-input" && state.status === "selecting-chapter" ? state.chapters : null;

  switch (state.name) {
    case "setup-form":
    case "setup-saving":
    case "setup-error":
      return (
        <Setup
          prefill={state.prefill}
          missingFields={state.missingFields}
          providerOptions={state.providerOptions}
          providerModelOptions={state.providerModelOptions}
          embeddingProviderOptions={state.embeddingProviderOptions}
          embeddingProviderModelOptions={state.embeddingProviderModelOptions}
          storedTokens={state.storedTokens}
          saving={state.name === "setup-saving"}
          error={state.name === "setup-error" ? state.error : null}
          onSubmit={updateConfig}
          onExit={handleExit}
        />
      );
    case "source-input":
      return (
        <SourceInput
          onSubmit={(params) => analyzeSource(params)}
          lastResult={state.lastResult}
          submitting={state.status === "submitting"}
          stage={state.status === "submitting" ? state.stage : null}
          error={state.status === "error" ? state.error : null}
          provider={state.provider}
          model={state.model}
          providerOptions={state.providerOptions}
          providerModelOptions={state.providerModelOptions}
          onProviderChange={setSourceInputProvider}
          onModelChange={setSourceInputModel}
          chapters={chapters}
          onConfirmChapter={confirmChapter}
          onCancelChapter={cancelChapter}
          onCancelRequest={cancelRequest}
          onExit={handleExit}
          vaultTags={vaultTags}
        />
      );
  }
}

function App() {
  const { onboardingState, setOnboardingState } = useBackend();

  return (
    <OnboardingProvider initialState={onboardingState} saveState={setOnboardingState}>
      <AppContent />
    </OnboardingProvider>
  );
}

const backend = new Backend();
const status = await backend.setupStatus();
const onboardingState = await backend.getOnboardingState().catch(() => null);

const initialState: AppFlowState =
  status.status === "ready"
    ? {
      name: "source-input",
      status: "idle",
      lastResult: null,
      error: null,
      provider: status.prefill.provider,
      model: status.prefill.modelId,
      providerOptions: status.providerOptions,
      providerModelOptions: status.providerModelOptions,
    }
    : {
      name: "setup-form",
      prefill: status.prefill,
      missingFields: status.missingFields,
      providerOptions: status.providerOptions,
      providerModelOptions: status.providerModelOptions,
      embeddingProviderOptions: status.embeddingProviderOptions,
      embeddingProviderModelOptions: status.embeddingProviderModelOptions,
      storedTokens: status.storedTokens,
      error: null,
    };

const renderer = await createCliRenderer({
  exitOnCtrlC: false,
});
createRoot(renderer).render(
  <BackendProvider backend={backend} initialState={initialState} initialOnboardingState={onboardingState}>
    <App />
  </BackendProvider>,
);
