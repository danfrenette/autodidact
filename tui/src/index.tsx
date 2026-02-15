import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard, useRenderer } from "@opentui/react";
import { useCallback } from "react";
import { useBackend } from "./hooks/use-backend.ts";
import { BackendProvider } from "./providers/backend-provider.tsx";
import { FileInput } from "./screens/file-input.tsx";

function App() {
  const { state, analyzeSource, resetToFileInput, shutdown } = useBackend();
  const renderer = useRenderer();

  useKeyboard((key) => {
    if (key.name === "escape") {
      if (state.name === "file-input") {
        renderer?.destroy();
        void shutdown();
      } else {
        resetToFileInput();
      }
    }
  });

  const handleFileSubmit = useCallback(async (path: string) => {
    await analyzeSource(path);
  }, [analyzeSource]);

  switch (state.name) {
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

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
});
createRoot(renderer).render(
  <BackendProvider>
    <App />
  </BackendProvider>,
);
