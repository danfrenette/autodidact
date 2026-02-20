import { useState, useCallback } from "react";
import "opentui-spinner/react";
import type { AnalysisResult } from "../requests/analyze-source/index.ts";
import type { BorderCharacters } from "@opentui/core";

type Props = {
  onSubmit: (path: string) => void;
  lastResult: AnalysisResult | null;
  submitting: boolean;
  stage: string | null;
  error: string | null;
};

const STAGE_LABELS: Record<string, string> = {
  detect_source: "Detecting source type…",
  ingest: "Reading file…",
  persist: "Saving to database…",
  analyze: "Analyzing with provider (this may take a minute)…",
  write: "Writing note…",
};

const EMPTY_BORDER: BorderCharacters = {
  topLeft: "",
  bottomLeft: "",
  vertical: "",
  topRight: "",
  bottomRight: "",
  horizontal: " ",
  bottomT: "",
  topT: "",
  cross: "",
  leftT: "",
  rightT: "",
};

function stageLabel(stage: string | null): string {
  if (!stage) return "Starting…";
  return STAGE_LABELS[stage] ?? stage;
}

function obsidianUri(notePath: string): string {
  return `obsidian://open?path=${encodeURIComponent(notePath)}`;
}

function accentColor(submitting: boolean, lastResult: AnalysisResult | null, error: string | null): string {
  if (error) return "#e06c75";
  if (submitting) return "#56b6c2";
  if (lastResult) return "#98c379";
  return "#fab283";
}

export function FileInput({ onSubmit, lastResult, submitting, stage, error: backendError }: Props) {
  const [path, setPath] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const error = validationError ?? backendError;
  const highlight = accentColor(submitting, lastResult, error);

  const handleSubmit = useCallback(() => {
    if (submitting) return;

    if (path.trim().length === 0) {
      setValidationError("Please enter a file path");
      return;
    }
    setValidationError(null);
    onSubmit(path.trim());
  }, [path, onSubmit, submitting]);

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
      {/* Success banner */}
      {lastResult && !submitting && (
        <text fg="#98c379" style={{ marginBottom: 1 }}>
          Note created: <a href={obsidianUri(lastResult.notePath)}>{lastResult.notePath}</a>
        </text>
      )}

      {/* Accent bar + input area */}
      <box
        border={["left"]}
        borderColor={highlight}
        customBorderChars={{ ...EMPTY_BORDER, vertical: "┃", bottomLeft: "╹" }}
        width={70}
      >
        <box
          paddingLeft={2}
          paddingRight={2}
          paddingTop={1}
          flexGrow={1}
          backgroundColor="#1e1e1e"
        >
          {/* Input */}
          <input
            placeholder={'Enter a file path… "/path/to/chapter.txt"'}
            onInput={setPath}
            onSubmit={handleSubmit}
            focused={!submitting}
            textColor="#eeeeee"
            cursorColor="#eeeeee"
            focusedBackgroundColor="#1e1e1e"
            backgroundColor="#1e1e1e"
          />

          {/* Status line: app name + model + provider */}
          <box flexDirection="row" flexShrink={0} paddingTop={1} gap={1}>
            <text fg={highlight}>autodidact</text>
            <text fg="#eeeeee">gpt-4o-mini</text>
            <text fg="#808080">openai</text>
          </box>
        </box>
      </box>

      {/* Bottom shadow */}
      <box
        width={70}
        height={1}
        border={["left"]}
        borderColor={highlight}
        customBorderChars={{ ...EMPTY_BORDER, vertical: "╹" }}
      >
        <box
          height={1}
          border={["bottom"]}
          borderColor="#1e1e1e"
          customBorderChars={{ ...EMPTY_BORDER, horizontal: "▀" }}
        />
      </box>

      {/* Footer: spinner/status or hints */}
      <box flexDirection="row" justifyContent="space-between" width={70} style={{ marginTop: 0 }}>
        <box flexDirection="row" alignItems="center">
          {submitting && (
            <>
              <spinner name="dots" color="cyan" />
              <text fg="#56b6c2" style={{ marginLeft: 1 }}>{stageLabel(stage)}</text>
            </>
          )}
          {error && !submitting && (
            <text fg="#e06c75">{error}</text>
          )}
        </box>

        {!submitting && (
          <text fg="#808080">
            .txt .md .pdf
          </text>
        )}
      </box>
    </box>
  );
}
