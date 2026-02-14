import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard, useRenderer } from "@opentui/react";
import { useState, useCallback } from "react";
import { Backend } from "./backend.ts";
import { FileInput } from "./screens/file-input.tsx";

const backend = new Backend();

type SourceInfo = {
  source_type: string;
  path: string;
  metadata: Record<string, unknown>;
};

type Screen = { name: "file-input" } | { name: "detected"; source: SourceInfo };

function App() {
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

  const handleFileSubmit = useCallback((path: string) => {
    setError(null);
    backend
      .request("detect_source", { path })
      .then((result) => {
        setScreen({ name: "detected", source: result as unknown as SourceInfo });
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }, []);

  switch (screen.name) {
    case "file-input":
      return <FileInput onSubmit={handleFileSubmit} />;
    case "detected":
      return (
        <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
          <box border title={screen.source.source_type} style={{ width: 60, padding: 1 }}>
            <text>{screen.source.path}</text>
          </box>
        </box>
      );
  }
}

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
});
createRoot(renderer).render(<App />);
