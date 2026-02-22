import "opentui-spinner/react";

import type { BorderCharacters } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useCallback, useState } from "react";

import { useFilePathAutocomplete } from "@/hooks/use-file-path-autocomplete";
import { useFileInputOnboarding } from "@/onboarding/file-input/use-file-input-onboarding";
import { onboardingHint } from "@/onboarding/types";
import type { AnalysisResult } from "@/requests/analyze-source";

import { FilePathAutocomplete } from "./file-path-autocomplete";
import { OnboardingFirstRun } from "./onboarding-first-run";
import { OnboardingNudge } from "./onboarding-nudge";

type Props = {
  onSubmit: (path: string) => void;
  lastResult: AnalysisResult | null;
  submitting: boolean;
  stage: string | null;
  error: string | null;
  value: string;
  onInput: (value: string) => void;
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

export function FileInput({ onSubmit, lastResult, submitting, stage, error: backendError, value, onInput }: Props) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const autocomplete = useFilePathAutocomplete({ value, onInput, submitting });
  const onboarding = useFileInputOnboarding({ inputValue: value, submitting });

  const error = validationError ?? backendError;
  const highlight = accentColor(submitting, lastResult, error);

  useKeyboard((key) => {
    if (autocomplete.handleKey(key)) {
      return;
    }

    onboarding.handleKeyboard(key);
  });

  const handleSubmit = useCallback(() => {
    if (submitting) return;

    const result = autocomplete.resolveSubmit();
    if (result.type === "validation-error") {
      setValidationError(result.message);
      return;
    }

    if (result.type === "selected-suggestion") {
      setValidationError(null);
      onboarding.onAutocompleteSelected();
      return;
    }

    setValidationError(null);
    onboarding.onSubmitSucceeded();
    onSubmit(result.path);
  }, [autocomplete, onboarding, onSubmit, submitting]);

  const handleInput = useCallback((nextValue: string) => {
    if (validationError !== null) {
      setValidationError(null);
    }

    onboarding.handleInput(nextValue);
    onInput(nextValue);
  }, [onInput, onboarding, validationError]);

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
      <OnboardingFirstRun visible={onboarding.showFirstRunPanel} width={70} />

      {onboarding.showHelp && (
        <box border borderColor="#484848" width={70} style={{ marginBottom: 1 }}>
          <box flexDirection="column" paddingLeft={1} paddingRight={1} backgroundColor="#161616">
            <text fg="#eeeeee">Help</text>
            <text fg="#9a9a9a">Enter submit path  |  @ autocomplete files  |  ? help  |  Ctrl+C cancel/clear</text>
          </box>
        </box>
      )}

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
            value={value}
            placeholder={'Enter a file path… "/path/to/chapter.txt"'}
            onInput={handleInput}
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

      <FilePathAutocomplete visible={autocomplete.visible} state={autocomplete.state} width={70} />

      <OnboardingNudge
        visible={onboarding.showAtHint}
        width={70}
        title="File autocomplete"
        message="Type @ to search .txt, .md, .rst, and .pdf files quickly."
        onDismissSession={() => onboarding.dismissHintSession(onboardingHint.at)}
        onDismissForever={() => onboarding.dismissHintForever(onboardingHint.at)}
      />

      <OnboardingNudge
        visible={!onboarding.showAtHint && onboarding.showCtrlCHint}
        width={70}
        title="Interrupt behavior"
        message="Ctrl+C cancels in-flight work, then clears input, then exits."
        onDismissSession={() => onboarding.dismissHintSession(onboardingHint.ctrlC)}
        onDismissForever={() => onboarding.dismissHintForever(onboardingHint.ctrlC)}
      />

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
            .txt .md .rst .pdf{autocomplete.query !== null ? "  |  ↑/↓ browse, Tab/Enter choose" : ""}
          </text>
        )}
      </box>
    </box>
  );
}
