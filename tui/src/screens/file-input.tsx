import { useState, useCallback, useRef } from "react";
import type { InputRenderable } from "@opentui/core";
import { usePaste } from "../hooks/use-paste.ts";

type Props = {
  onSubmit: (path: string) => void;
  error: string | null;
};

export function FileInput({ onSubmit, error: backendError }: Props) {
  const [path, setPath] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<InputRenderable>(null);

  usePaste(
    useCallback((text: string) => {
      inputRef.current?.insertText(text);
    }, []),
  );

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
      <text style={{ marginBottom: 1 }}>Enter path to a file you want to learn from</text>

      <box border title="file path" style={{ width: 60, height: 3 }}>
        <input
          ref={inputRef}
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
