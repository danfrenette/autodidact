import { createCliRenderer } from "@opentui/core";
import { createRoot, useRenderer } from "@opentui/react";
import { useCallback } from "react";

import { Backend } from "@/backend.ts";
import { useBackend } from "@/hooks/use-backend.ts";
import { OnboardingProvider } from "@/onboarding/context";
import type { AppFlowState } from "@/providers/backend-provider.tsx";
import { BackendProvider } from "@/providers/backend-provider.tsx";
import { FileInput } from "@/screens/input/index.tsx";
import { Setup } from "@/screens/setup/index.tsx";

function AppContent() {
  const { state, analyzeSource, cancelRequest, updateConfig, setFileInputProvider, setFileInputModel, confirmChapter, cancelChapter, shutdown } = useBackend();
  const renderer = useRenderer();

  const handleExit = useCallback(() => {
    renderer?.destroy();
    void shutdown();
  }, [renderer, shutdown]);

  const chapters = state.name === "file-input" && state.status === "selecting-chapter" ? state.chapters : null;

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
          saving={state.name === "setup-saving"}
          error={state.name === "setup-error" ? state.error : null}
          onSubmit={updateConfig}
          onExit={handleExit}
        />
      );
    case "file-input":
      return (
        <FileInput
          onSubmit={analyzeSource}
          lastResult={state.lastResult}
          submitting={state.status === "submitting"}
          stage={state.status === "submitting" ? state.stage : null}
          error={state.status === "error" ? state.error : null}
          provider={state.provider}
          model={state.model}
          providerOptions={state.providerOptions}
          providerModelOptions={state.providerModelOptions}
          onProviderChange={setFileInputProvider}
          onModelChange={setFileInputModel}
          chapters={chapters}
          onConfirmChapter={confirmChapter}
          onCancelChapter={cancelChapter}
          onCancelRequest={cancelRequest}
          onExit={handleExit}
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
      name: "file-input",
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
