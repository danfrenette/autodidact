import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard, useRenderer } from "@opentui/react";
import { useCallback } from "react";
import { Backend } from "./backend.ts";
import { useBackend } from "./hooks/use-backend.ts";
import { BackendProvider } from "./providers/backend-provider.tsx";
import type { AppFlowState } from "./providers/backend-provider.tsx";
import { FileInput } from "./screens/file-input.tsx";
import { Setup } from "./screens/setup.tsx";

function App() {
  const { state, analyzeSource, updateConfig, shutdown } = useBackend();
  const renderer = useRenderer();

  const handleExit = useCallback(() => {
    renderer?.destroy();
    void shutdown();
  }, [renderer, shutdown]);

  useKeyboard((key) => {
    if (key.name === "escape" && state.name === "file-input") {
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
          modelOptions={state.modelOptions}
          saving={state.name === "setup-saving"}
          error={state.name === "setup-error" ? state.error : null}
          onSubmit={updateConfig}
        />
      );
    case "file-input":
      return (
        <FileInput
          onSubmit={handleFileSubmit}
          lastResult={state.lastResult}
          error={state.status === "error" ? state.error : null}
        />
      );
  }
}

const backend = new Backend();
const status = await backend.setupStatus();

const initialState: AppFlowState =
  status.status === "ready"
    ? { name: "file-input", status: "idle", lastResult: null, error: null }
    : {
      name: "setup-form",
      prefill: status.prefill,
      missingFields: status.missingFields,
      modelOptions: status.modelOptions,
      error: null,
    };

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
});
createRoot(renderer).render(
  <BackendProvider backend={backend} initialState={initialState}>
    <App />
  </BackendProvider>,
);
