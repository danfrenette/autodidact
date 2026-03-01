import "opentui-spinner/react";

import { execSync } from "node:child_process";

import type { BorderCharacters } from "@opentui/core";
import { useCallback, useMemo, useState } from "react";

import { useFilePathAutocomplete } from "@/hooks/use-file-path-autocomplete";
import { useFileInputOnboarding } from "@/onboarding/file-input/use-file-input-onboarding";
import { onboardingHint } from "@/onboarding/types";
import type { AnalysisResult, Chapter } from "@/requests/analyze-source";
import { resolveAvailableModels } from "@/screens/setup/models";
import { resolveAvailableProviders } from "@/screens/setup/providers";
import { useCombobox } from "@/screens/setup/wizard/use-combobox";

import { OnboardingFirstRun } from "./onboarding-first-run";
import { OnboardingNudge } from "./onboarding-nudge";
import { ChapterSelectionSection } from "./sections/chapter-selection-section";
import { InputSection } from "./sections/input-section";
import { OutputModal } from "./sections/output-modal";
import { TagsSection } from "./sections/tags-section";
import { PANEL_WIDTH } from "./styles";
import { useInputBadges } from "./use-badges";
import { useChapterSelection } from "./use-chapter-selection";
import { useInputKeyboard } from "./use-input-keyboard";
import { useModelPickerDisclosure } from "./use-model-picker-disclosure";

type Props = {
  onSubmit: (path: string) => void;
  lastResult: AnalysisResult | null;
  submitting: boolean;
  stage: string | null;
  error: string | null;
  provider: string;
  model: string;
  providerOptions: string[];
  providerModelOptions: Record<string, string[]>;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
  value: string;
  onInput: (value: string) => void;
  chapters: Chapter[] | null;
  onConfirmChapter: (chapter: Chapter) => void;
  onCancelChapter: () => void;
};

const STAGE_LABELS: Record<string, string> = {
  detect_source: "Detecting source type...",
  ingest: "Reading file...",
  persist: "Saving to database...",
  analyze: "Analyzing with provider (this may take a minute)...",
  write: "Writing note...",
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
  if (!stage) return "Starting...";
  return STAGE_LABELS[stage] ?? stage;
}

function accentColor(submitting: boolean, lastResult: AnalysisResult | null, error: string | null): string {
  if (error) return "#e06c75";
  if (submitting) return "#56b6c2";
  if (lastResult) return "#98c379";
  return "#fab283";
}

function copyToClipboard(text: string, onCopied: (v: boolean) => void) {
  try {
    execSync("pbcopy", { input: text });
    onCopied(true);
    setTimeout(() => onCopied(false), 1500);
  } catch {
    // silently ignore clipboard failures
  }
}

export function FileInput({
  onSubmit,
  lastResult,
  submitting,
  stage,
  error: backendError,
  provider,
  model,
  providerOptions,
  providerModelOptions,
  onProviderChange,
  onModelChange,
  value,
  onInput,
  chapters,
  onConfirmChapter,
  onCancelChapter,
}: Props) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activePicker, setActivePicker] = useState<"provider" | "model">("model");
  const modelPicker = useModelPickerDisclosure({ disabled: submitting });
  const autocomplete = useFilePathAutocomplete({ value, onInput, submitting });
  const onboarding = useFileInputOnboarding({ inputValue: value, submitting });
  const badges = useInputBadges(value);
  const chapterSelection = useChapterSelection({
    chapters: chapters ?? [],
    onConfirm: onConfirmChapter,
    onCancel: onCancelChapter,
    active: chapters !== null,
  });

  const resolvedProviderOptions = useMemo(
    () => resolveAvailableProviders(providerOptions),
    [providerOptions],
  );

  const resolvedModelOptions = useMemo(
    () => resolveAvailableModels(providerModelOptions[provider] ?? []),
    [provider, providerModelOptions],
  );

  const providerCombobox = useCombobox({
    options: resolvedProviderOptions,
    selectedValue: provider,
    focused: modelPicker.isOpen && activePicker === "provider",
    onCommit: (nextValue) => {
      onProviderChange(nextValue);
      setActivePicker("model");
    },
  });

  const modelCombobox = useCombobox({
    options: resolvedModelOptions,
    selectedValue: model,
    focused: modelPicker.isOpen && activePicker === "model",
    onCommit: (nextValue) => {
      onModelChange(nextValue);
    },
  });

  const error = validationError ?? backendError;
  const highlight = accentColor(submitting, lastResult, error);
  const detectedBadgeLabel = badges.inputBadge ? `${badges.inputBadge.supported ? "✓" : "✕"} ${badges.inputBadge.label}` : null;

  const { showOutputModal, openOutputModal, closeOutputModal } = useInputKeyboard({
    chapterActive: chapters !== null,
    chapterHandleKey: chapterSelection.handleKey,
    autocompleteHandleKey: autocomplete.handleKey,
    modelPickerOpen: modelPicker.isOpen,
    activePicker,
    setActivePicker,
    providerComboboxHandleKey: providerCombobox.handleKey,
    modelComboboxHandleKey: modelCombobox.handleKey,
    modelPickerHandleKeyboard: modelPicker.handleKeyboard,
    onboardingHandleKeyboard: onboarding.handleKeyboard,
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
    openOutputModal();
    onboarding.onSubmitSucceeded();
    onSubmit(result.path);
  }, [autocomplete, onboarding, onSubmit, openOutputModal, submitting]);

  const handleInput = useCallback((nextValue: string) => {
    if (validationError !== null) {
      setValidationError(null);
    }

    if (showOutputModal) {
      closeOutputModal();
    }

    onboarding.handleInput(nextValue);
    onInput(nextValue);
  }, [closeOutputModal, onInput, onboarding, showOutputModal, validationError]);

  const handleProviderPress = useCallback(() => {
    setActivePicker("provider");
    modelPicker.open();
  }, [modelPicker]);

  const handleModelPress = useCallback(() => {
    setActivePicker("model");
    modelPicker.open();
  }, [modelPicker]);

  const handleChevronPress = useCallback(() => {
    if (modelPicker.isOpen) {
      modelPicker.close();
      return;
    }

    setActivePicker("model");
    modelPicker.open();
  }, [modelPicker]);

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
      <OnboardingFirstRun visible={onboarding.showFirstRunPanel} width={PANEL_WIDTH} />

      {onboarding.showHelp && (
        <box border borderColor="#484848" width={PANEL_WIDTH} style={{ marginBottom: 1 }}>
          <box flexDirection="column" paddingLeft={1} paddingRight={1} backgroundColor="#161616">
            <text fg="#eeeeee">Help</text>
            <text fg="#9a9a9a">Enter submit path  |  @ autocomplete files  |  ? help  |  Ctrl+C cancel/clear</text>
          </box>
        </box>
      )}

      {chapters ? (
        <ChapterSelectionSection
          query={chapterSelection.query}
          onInput={chapterSelection.handleInput}
          filteredChapters={chapterSelection.filteredChapters}
          totalCount={chapterSelection.totalCount}
          highlightedIndex={chapterSelection.highlightedIndex}
          visibleChapters={chapterSelection.visibleChapters}
          windowStart={chapterSelection.windowStart}
          width={PANEL_WIDTH}
        />
      ) : (
        <InputSection
          value={value}
          submitting={submitting}
          onInput={handleInput}
          onSubmit={handleSubmit}
          badgeLabel={detectedBadgeLabel}
          badgeSupported={badges.inputBadge?.supported ?? false}
          model={model}
          provider={provider}
          modelPickerExpanded={modelPicker.isOpen}
          onProviderPress={handleProviderPress}
          onModelPress={handleModelPress}
          onChevronPress={handleChevronPress}
          providerCombobox={{ ...providerCombobox, focused: modelPicker.isOpen && activePicker === "provider" }}
          modelCombobox={{ ...modelCombobox, focused: modelPicker.isOpen && activePicker === "model" }}
          autocompleteState={autocomplete.state}
          width={PANEL_WIDTH}
        />
      )}

      <TagsSection
        hasResult={lastResult !== null}
        selectedCount={badges.selectedCount}
        tags={badges.tags}
        isSelected={badges.isSelected}
        onToggle={badges.toggleTag}
        width={PANEL_WIDTH}
      />

      <OnboardingNudge
        visible={onboarding.showAtHint}
        width={PANEL_WIDTH}
        title="File autocomplete"
        message="Type @ to search .txt, .md, .rst, and .pdf files quickly."
        onDismissSession={() => onboarding.dismissHintSession(onboardingHint.at)}
        onDismissForever={() => onboarding.dismissHintForever(onboardingHint.at)}
      />

      <OnboardingNudge
        visible={!onboarding.showAtHint && onboarding.showCtrlCHint}
        width={PANEL_WIDTH}
        title="Interrupt behavior"
        message="Ctrl+C cancels in-flight work, then clears input, then exits."
        onDismissSession={() => onboarding.dismissHintSession(onboardingHint.ctrlC)}
        onDismissForever={() => onboarding.dismissHintForever(onboardingHint.ctrlC)}
      />

      <box
        width={PANEL_WIDTH}
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

      <box flexDirection="row" justifyContent="space-between" width={PANEL_WIDTH} style={{ marginTop: 0 }}>
        <box flexDirection="row" alignItems="center">
          {submitting && (
            <>
              <spinner name="dots" color="cyan" />
              <text fg="#56b6c2" style={{ marginLeft: 1 }}>{stageLabel(stage)}</text>
            </>
          )}
          {error && !submitting && (
            <box flexDirection="row" gap={1} alignItems="center">
              <text fg="#e06c75">{error}</text>
              <text fg="#808080" onMouseDown={() => copyToClipboard(error, setCopied)}>{copied ? "copied!" : "copy"}</text>
            </box>
          )}
        </box>

        {!submitting && (
          <text fg="#808080">
            {chapters
              ? "Type to filter, Up/Down navigate, Enter select, Esc cancel"
              : autocomplete.query !== null ? "\u2191/\u2193 browse, Tab/Enter choose" : "input ready"}
          </text>
        )}
      </box>

      <OutputModal visible={showOutputModal} result={lastResult} onClose={closeOutputModal} />
    </box>
  );
}
