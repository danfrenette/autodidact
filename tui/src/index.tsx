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
  const { state, analyzeSource, updateConfig, resetToFileInput, shutdown } = useBackend();
  const renderer = useRenderer();

  useKeyboard((key) => {
    if (key.name === "escape") {
      if (state.name === "file-input") {
        renderer?.destroy();
        void shutdown();
      } else if (state.name === "analyzed") {
        resetToFileInput();
      }
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
          saving={state.name === "setup-saving"}
          error={state.name === "setup-error" ? state.error : null}
          onSubmit={updateConfig}
        />
      );
    case "file-input":
      return (
        <FileInput
          onSubmit={handleFileSubmit}
          error={state.status === "error" ? state.error : null}
        />
      );
    case "analyzed":
      return (
        <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
          <box border title="Note created" style={{ width: 60, padding: 1 }}>
            <text>{state.result.notePath}</text>
          </box>
        </box>
      );
  }
}

const backend = new Backend();
const status = await backend.setupStatus();

const initialState: AppFlowState =
  status.status === "ready"
    ? { name: "file-input", status: "idle", error: null }
    : { name: "setup-form", prefill: status.prefill, missingFields: status.missingFields, error: null };

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
});
createRoot(renderer).render(
  <BackendProvider backend={backend} initialState={initialState}>
    <App />
  </BackendProvider>,
);
