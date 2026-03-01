import type { BorderCharacters, TextareaRenderable } from "@opentui/core";
import type { KeyEvent } from "@opentui/core";
import { useCallback, useMemo, useRef, useState } from "react";

import { useFilePathAutocomplete } from "@/hooks/use-file-path-autocomplete";
import { useKeyboardDispatch } from "@/hooks/use-keyboard-dispatch";
import { useOnboardingContext } from "@/onboarding/context";
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
import { StatusMessage } from "./sections/status-message";
import { TagsSection } from "./sections/tags-section";
import { PANEL_WIDTH } from "./styles";
import { useInputBadges } from "./use-badges";
import { useChapterSelection } from "./use-chapter-selection";
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
  chapters: Chapter[] | null;
  onConfirmChapter: (chapter: Chapter) => void;
  onCancelChapter: () => void;
  onCancelRequest: () => void;
  onExit: () => void;
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

function accentColor(submitting: boolean, lastResult: AnalysisResult | null, error: string | null): string {
  if (error) return "#e06c75";
  if (submitting) return "#56b6c2";
  if (lastResult) return "#98c379";
  return "#fab283";
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
  chapters,
  onConfirmChapter,
  onCancelChapter,
  onCancelRequest,
  onExit,
}: Props) {
  const [value, onInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<"provider" | "model">("model");
  const textareaRef = useRef<TextareaRenderable>(null);

  const syncedOnInput = useCallback((nextValue: string) => {
    if (textareaRef.current && textareaRef.current.plainText !== nextValue) {
      textareaRef.current.setText(nextValue);
    }
    onInput(nextValue);
  }, [onInput]);
  const modelPicker = useModelPickerDisclosure({ disabled: submitting });
  const autocomplete = useFilePathAutocomplete({ value, onInput: syncedOnInput, submitting });
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

  const { onCancelUsed } = useOnboardingContext();
  const [showOutputModal, setShowOutputModal] = useState(false);
  const openOutputModal = useCallback(() => setShowOutputModal(true), []);
  const closeOutputModal = useCallback(() => setShowOutputModal(false), []);

  const chapterActive = chapters !== null;

  const handleCtrlCEscape = useCallback(
    (key: KeyEvent): boolean => {
      if (key.name === "escape" && !chapterActive) {
        onExit();
        return true;
      }
      if (key.name === "c" && key.ctrl) {
        onCancelUsed();
        if (chapterActive) {
          onCancelChapter();
          return true;
        }
        if (submitting) {
          onCancelRequest();
          return true;
        }
        if (value.length > 0) {
          onInput("");
          if (textareaRef.current) textareaRef.current.setText("");
          return true;
        }
        onExit();
        return true;
      }
      return false;
    },
    [chapterActive, onCancelChapter, onCancelRequest, onCancelUsed, onExit, onInput, submitting, value.length],
  );

  const handleOutputModal = useCallback(
    (key: KeyEvent): boolean => {
      if (showOutputModal && (key.name === "escape" || key.name === "return")) {
        key.preventDefault();
        setShowOutputModal(false);
        return true;
      }
      return false;
    },
    [showOutputModal],
  );

  const handleModelPickerTab = useCallback(
    (key: KeyEvent): boolean => {
      if (!modelPicker.isOpen) return false;
      if (activePicker === "provider" && providerCombobox.handleKey(key)) return true;
      if (activePicker === "model" && modelCombobox.handleKey(key)) return true;
      if (key.name === "tab" || key.name === "backtab" || (key.name === "tab" && key.shift)) {
        key.preventDefault();
        setActivePicker(activePicker === "provider" ? "model" : "provider");
        return true;
      }
      return false;
    },
    [activePicker, modelCombobox, modelPicker.isOpen, providerCombobox],
  );

  const keyboardHandlers = useMemo(
    () => [
      handleCtrlCEscape,
      handleOutputModal,
      chapterSelection.handleKey,
      autocomplete.handleKey,
      handleModelPickerTab,
      modelPicker.handleKeyboard,
      onboarding.handleKeyboard,
    ],
    [handleCtrlCEscape, handleOutputModal, chapterSelection.handleKey, autocomplete.handleKey, handleModelPickerTab, modelPicker.handleKeyboard, onboarding.handleKeyboard],
  );

  useKeyboardDispatch(keyboardHandlers);

  const handleSubmit = useCallback(() => {
    if (submitting) return;
    // Read directly from textarea ref to ensure we have the latest content
    const currentText = textareaRef.current?.plainText ?? value;
    if (currentText !== value) {
      onInput(currentText);
    }
    const result = autocomplete.resolveSubmit();
    if (result.type === "validation-error") {
      // If autocomplete sees empty, try the textarea text directly
      if (currentText.trim().length > 0) {
        setValidationError(null);
        openOutputModal();
        onboarding.onSubmitSucceeded();
        onSubmit(currentText.trim());
        return;
      }
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
  }, [autocomplete, onInput, onboarding, onSubmit, openOutputModal, submitting, value]);

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

  const handleContentChange = useCallback(() => {
    const text = textareaRef.current?.plainText ?? "";
    handleInput(text);
  }, [handleInput]);

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
          onContentChange={handleContentChange}
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
          inputKind={badges.inputKind}
          textareaRef={textareaRef}
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
        <StatusMessage submitting={submitting} stage={stage} error={error} />

        {!submitting && (
          <text fg="#808080">
            {chapters
              ? "Type to filter, Up/Down navigate, Enter select, Esc cancel"
              : autocomplete.query !== null ? "↑/↓ browse, Tab/Enter choose" : badges.inputKind === "raw_text" ? "Ctrl+Enter to submit" : "input ready"}
          </text>
        )}
      </box>

      <OutputModal visible={showOutputModal} result={lastResult} onClose={closeOutputModal} />
    </box>
  );
}
