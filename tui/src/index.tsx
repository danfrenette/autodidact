import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard, useRenderer } from "@opentui/react";
import { useState, useCallback } from "react";
import { useBackend } from "./hooks/use-backend.ts";
import { BackendProvider } from "./providers/backend-provider.tsx";
import { FileInput } from "./screens/file-input.tsx";
import type { SourceInfo } from "./requests/detect-source/index.ts";

type Screen = { name: "file-input" } | { name: "detected"; source: SourceInfo };

function App() {
  const backend = useBackend();
  const renderer = useRenderer();
  const [screen, setScreen] = useState<Screen>({ name: "file-input" });
  const [error, setError] = useState<string | null>(null);

  useKeyboard((key) => {
    if (key.name === "escape") {
      if (screen.name === "file-input") {
        renderer?.destroy();
        backend.shutdown();
      } else {
        setScreen({ name: "file-input" });
        setError(null);
      }
    }
  });

  const handleFileSubmit = useCallback(async (path: string) => {
    setError(null);

    try {
      const source = await backend.detectSource(path);
      setScreen({ name: "detected", source });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    }
  }, []);

  switch (screen.name) {
    case "file-input":
      return <FileInput onSubmit={handleFileSubmit} error={error} />;
    case "detected":
      return (
        <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
          <box border title={screen.source.sourceType} style={{ width: 60, padding: 1 }}>
            <text>{screen.source.path}</text>
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
