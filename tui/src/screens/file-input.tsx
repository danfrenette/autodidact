import { useState, useCallback } from "react";
import type { AnalysisResult } from "../requests/analyze-source/index.ts";

type Props = {
  onSubmit: (path: string) => void;
  lastResult: AnalysisResult | null;
  error: string | null;
};

function obsidianUri(notePath: string): string {
  return `obsidian://open?path=${encodeURIComponent(notePath)}`;
}

export function FileInput({ onSubmit, lastResult, error: backendError }: Props) {
  const [path, setPath] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const error = validationError ?? backendError;

  const handleSubmit = useCallback(() => {
    if (path.trim().length === 0) {
      setValidationError("Please enter a file path");
      return;
    }
    setValidationError(null);
    onSubmit(path.trim());
  }, [path, onSubmit]);

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
      {lastResult && (
        <box border style={{ width: 60, padding: 1, marginBottom: 1 }} borderColor="green">
          <text>
            Note created: <a href={obsidianUri(lastResult.notePath)}>{lastResult.notePath}</a>
          </text>
        </box>
      )}

      <text style={{ marginBottom: 1 }}>Enter path to a file you want to learn from</text>

      <box border title="file path" style={{ width: 60, height: 3 }}>
        <input
          placeholder="/path/to/file"
          onInput={setPath}
          onSubmit={handleSubmit}
          focused
        />
      </box>

      {error && (
        <text fg="red" style={{ marginTop: 1 }}>
          {error}
        </text>
      )}

      <text fg="#666666" style={{ marginTop: 1 }}>
        Supports: .txt, .md, .pdf
      </text>
    </box>
  );
}
