import type { OnboardingHint } from "@/onboarding/types";

export type SourceInputHint = OnboardingHint;

export type HintUiContext = {
  submitting: boolean;
  inputIsEmpty: boolean;
  panelOpen: boolean;
};

export type HintRule = {
  hint: SourceInputHint;
  requiresEmptyInput: boolean;
};

export type HintStatus = {
  isMilestoneComplete: boolean;
  isHintEnabled: boolean;
};

type BuildHintUiContextParams = {
  submitting: boolean;
  inputValue: string;
  showHelp: boolean;
};

export function buildHintUiContext(params: BuildHintUiContextParams): HintUiContext {
  return {
    submitting: params.submitting,
    inputIsEmpty: params.inputValue.trim().length === 0,
    panelOpen: params.showHelp,
  };
}

export function shouldShowHint(ui: HintUiContext, rule: HintRule, status: HintStatus) {
  if (ui.submitting) return false;
  if (ui.panelOpen) return false;
  if (rule.requiresEmptyInput && !ui.inputIsEmpty) return false;
  if (status.isMilestoneComplete) return false;
  return status.isHintEnabled;
}
