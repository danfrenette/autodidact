import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard, useRenderer } from "@opentui/react";
import { useCallback, useState } from "react";

import { Backend } from "@/backend.ts";
import { useBackend } from "@/hooks/use-backend.ts";
import { OnboardingProvider, useOnboardingContext } from "@/onboarding/context";
import type { AppFlowState } from "@/providers/backend-provider.tsx";
import { BackendProvider } from "@/providers/backend-provider.tsx";
import { FileInput } from "@/screens/file-input.tsx";
import { Setup } from "@/screens/setup/index.tsx";

function AppContent() {
  const { state, analyzeSource, cancelRequest, updateConfig, shutdown } = useBackend();
  const onboarding = useOnboardingContext();
  const renderer = useRenderer();
  const [inputValue, setInputValue] = useState("");

  const handleExit = useCallback(() => {
    renderer?.destroy();
    void shutdown();
  }, [renderer, shutdown]);

  useKeyboard((key) => {
    if (state.name !== "file-input") {
      return;
    }

    if (key.name === "escape") {
      handleExit();
    }

    if (key.name === "c" && key.ctrl) {
      onboarding.onCancelUsed();

      if (state.status === "submitting") {
        cancelRequest();
        return;
      }

      if (inputValue.length > 0) {
        setInputValue("");
        return;
      }

      handleExit();
    }
  });

  const handleFileSubmit = useCallback(async (path: string) => {
    await analyzeSource(path);
  }, [analyzeSource]);

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
          onSubmit={handleFileSubmit}
          lastResult={state.lastResult}
          submitting={state.status === "submitting"}
          stage={state.status === "submitting" ? state.stage : null}
          error={state.status === "error" ? state.error : null}
          provider={state.provider}
          model={state.model}
          value={inputValue}
          onInput={setInputValue}
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
