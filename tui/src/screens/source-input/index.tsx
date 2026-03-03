import type { BorderCharacters, TextareaRenderable } from "@opentui/core";
import type { KeyEvent } from "@opentui/core";
import { useCallback, useMemo, useRef, useState } from "react";

import { useFilePathAutocomplete } from "@/hooks/use-file-path-autocomplete";
import { useKeyboardDispatch } from "@/hooks/use-keyboard-dispatch";
import { TagsSection } from "@/lib/tags/tags-section";
import { useTagCombobox } from "@/lib/tags/use-tag-combobox";
import { useOnboardingContext } from "@/onboarding/context";
import { useSourceInputOnboarding } from "@/onboarding/source-input/use-source-input-onboarding";
import { onboardingHint } from "@/onboarding/types";
import type { AnalyzeSourceParams } from "@/backend.ts";
import type { AnalysisResult, Chapter } from "@/requests/analyze-source";

import { OnboardingFirstRun } from "./onboarding-first-run";
import { OnboardingNudge } from "./onboarding-nudge";
import { ChapterSelectionSection } from "./sections/chapter-selection-section";
import { InputSection } from "./sections/input-section";
import { OutputModal } from "./sections/output-modal";
import { StatusMessage } from "./sections/status-message";
import { PANEL_WIDTH } from "./styles";
import { useInputBadges } from "./use-badges";
import { useChapterSelection } from "./use-chapter-selection";
import { useModelPicker } from "./use-model-picker";
import { useSourceInputSubmit } from "./use-source-input-submit";

type Props = {
  onSubmit: (params: AnalyzeSourceParams) => Promise<AnalysisResult | null>;
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
  onConfirmChapter: (chapter: Chapter) => Promise<AnalysisResult | null>;
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

export function SourceInput({
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
  const textareaRef = useRef<TextareaRenderable>(null);

  const syncedOnInput = useCallback((nextValue: string) => {
    if (textareaRef.current && textareaRef.current.plainText !== nextValue) {
      textareaRef.current.setText(nextValue);
    }
    onInput(nextValue);
  }, [onInput]);
  const autocomplete = useFilePathAutocomplete({ value, onInput: syncedOnInput, submitting });
  const onboarding = useSourceInputOnboarding({ inputValue: value, submitting });
  const badges = useInputBadges(value);
  const tagCombobox = useTagCombobox();
  const modelPickerCombobox = useModelPicker({
    provider,
    model,
    providerOptions,
    providerModelOptions,
    onProviderChange,
    onModelChange,
    submitting,
  });

  const { onCancelUsed } = useOnboardingContext();
  const [showOutputModal, setShowOutputModal] = useState(false);
  const openOutputModal = useCallback(() => setShowOutputModal(true), []);
  const closeOutputModal = useCallback(() => setShowOutputModal(false), []);

  const submit = useSourceInputSubmit({
    resolveSubmit: autocomplete.resolveSubmit,
    selectedTags: tagCombobox.selectedTags,
    textareaRef,
    value,
    onInput,
    onSubmit,
    onSubmitSucceeded: onboarding.onSubmitSucceeded,
    onAutocompleteSelected: onboarding.onAutocompleteSelected,
    openOutputModal,
    submitting,
  });

  const error = submit.validationError ?? backendError;
  const highlight = accentColor(submitting, lastResult, error);
  const detectedBadgeLabel = badges.inputBadge ? `${badges.inputBadge.supported ? "✓" : "✕"} ${badges.inputBadge.label}` : null;

  const handleConfirmChapter = useCallback(async (chapter: Chapter) => {
    const result = await onConfirmChapter(chapter);
    if (result?.status === "completed") openOutputModal();
  }, [onConfirmChapter, openOutputModal]);

  const chapterSelection = useChapterSelection({
    chapters: chapters ?? [],
    onConfirm: handleConfirmChapter,
    onCancel: onCancelChapter,
    active: chapters !== null,
  });

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

  const keyboardHandlers = useMemo(
    () => [
      handleCtrlCEscape,
      handleOutputModal,
      chapterSelection.handleKey,
      autocomplete.handleKey,
      tagCombobox.handleKey,
      modelPickerCombobox.handleKey,
      modelPickerCombobox.handleKeyboard,
      onboarding.handleKeyboard,
    ],
    [handleCtrlCEscape, handleOutputModal, chapterSelection.handleKey, autocomplete.handleKey, tagCombobox.handleKey, modelPickerCombobox.handleKey, modelPickerCombobox.handleKeyboard, onboarding.handleKeyboard],
  );

  useKeyboardDispatch(keyboardHandlers);

  const handleInput = useCallback((nextValue: string) => {
    submit.clearValidationError();

    if (showOutputModal) {
      closeOutputModal();
    }

    onboarding.handleInput(nextValue);
    onInput(nextValue);
  }, [closeOutputModal, onInput, onboarding, showOutputModal, submit.clearValidationError]);

  const handleContentChange = useCallback(() => {
    const text = textareaRef.current?.plainText ?? "";
    handleInput(text);
  }, [handleInput]);



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
          onSubmit={submit.handleSubmit}
          badgeLabel={detectedBadgeLabel}
          badgeSupported={badges.inputBadge?.supported ?? false}
          model={model}
          provider={provider}
          modelPickerExpanded={modelPickerCombobox.isOpen}
          onProviderPress={modelPickerCombobox.onProviderPress}
          onModelPress={modelPickerCombobox.onModelPress}
          onChevronPress={modelPickerCombobox.onChevronPress}
          providerCombobox={modelPickerCombobox.providerCombobox}
          modelCombobox={modelPickerCombobox.modelCombobox}
          autocompleteState={autocomplete.state}
          width={PANEL_WIDTH}
          inputKind={badges.inputKind}
          textareaRef={textareaRef}
          selectedTags={tagCombobox.selectedTags}
          onTagsPress={tagCombobox.openTags}
        />
      )}

      {tagCombobox.tagsExpanded && (
        <TagsSection
          selectedTags={tagCombobox.selectedTags}
          onRemove={tagCombobox.removeTag}
          query={tagCombobox.query}
          filteredOptions={tagCombobox.filteredOptions}
          highlightedIndex={tagCombobox.highlightedIndex}
          isDropdownOpen={tagCombobox.isDropdownOpen}
          onInput={tagCombobox.handleInput}
          onSubmit={tagCombobox.submitTag}
          focused={tagCombobox.tagsExpanded}
          width={PANEL_WIDTH}
        />
      )}

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
              : autocomplete.query !== null ? "↑/↓ browse, Tab/Enter choose" : tagCombobox.tagsExpanded ? "Esc close tags" : badges.inputKind === "raw_text" ? "Ctrl+Enter to submit" : "input ready"}
          </text>
        )}
      </box>

      <OutputModal visible={showOutputModal} result={lastResult} onClose={closeOutputModal} />
    </box>
  );
}
