import "opentui-spinner/react";

import { execSync } from "node:child_process";

import { useCallback, useState } from "react";

const STAGE_LABELS: Record<string, string> = {
  detect_source: "Detecting source type...",
  ingest: "Reading file...",
  persist: "Saving to database...",
  analyze: "Analyzing with provider (this may take a minute)...",
  write: "Writing note...",
};

function stageLabel(stage: string | null): string {
  if (!stage) return "Starting...";
  return STAGE_LABELS[stage] ?? stage;
}

function copyToClipboard(text: string, onCopied: (v: boolean) => void) {
  try {
    execSync("pbcopy", { input: text });
    onCopied(true);
    setTimeout(() => onCopied(false), 1500);
  } catch {
    // pbcopy not available
  }
}

type Props = {
  submitting: boolean;
  stage: string | null;
  error: string | null;
};

export function StatusMessage({ submitting, stage, error }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (error) copyToClipboard(error, setCopied);
  }, [error]);

  if (submitting) {
    return (
      <box flexDirection="row" alignItems="center">
        <spinner name="dots" color="cyan" />
        <text fg="#56b6c2" style={{ marginLeft: 1 }}>{stageLabel(stage)}</text>
      </box>
    );
  }

  if (error) {
    return (
      <box flexDirection="row" gap={1} alignItems="center">
        <text fg="#e06c75">{error}</text>
        <text fg="#808080" onMouseDown={handleCopy}>{copied ? "copied!" : "copy"}</text>
      </box>
    );
  }

  return null;
}
