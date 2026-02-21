import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard, useRenderer } from "@opentui/react";
import { useCallback, useState } from "react";
import { Backend } from "./backend.ts";
import { useBackend } from "./hooks/use-backend.ts";
import { BackendProvider } from "./providers/backend-provider.tsx";
import type { AppFlowState } from "./providers/backend-provider.tsx";
import { FileInput } from "./screens/file-input.tsx";
import { Setup } from "./screens/setup.tsx";

function App() {
  const { state, analyzeSource, cancelRequest, updateConfig, shutdown } = useBackend();
  const renderer = useRenderer();
  const [inputValue, setInputValue] = useState("");

  const handleExit = useCallback(() => {
    renderer?.destroy();
    void shutdown();
  }, [renderer, shutdown]);

  useKeyboard((key) => {
    if (key.name === "escape" && state.name === "file-input") {
      handleExit();
    }

    if (key.name === "c" && key.ctrl && state.name === "file-input") {
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
          submitting={state.status === "submitting"}
          stage={state.status === "submitting" ? state.stage : null}
          error={state.status === "error" ? state.error : null}
          value={inputValue}
          onInput={setInputValue}
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
  exitOnCtrlC: false,
});
createRoot(renderer).render(
  <BackendProvider backend={backend} initialState={initialState}>
    <App />
  </BackendProvider>,
);
