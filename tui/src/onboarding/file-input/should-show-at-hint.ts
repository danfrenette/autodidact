import { onboardingHint } from "../types";
import type { HintUiContext } from "./hint-visibility";
import { shouldShowHint } from "./hint-visibility";

const AT_HINT_RULE = {
  hint: onboardingHint.at,
  requiresEmptyInput: true,
} as const;

type Params = {
  ui: HintUiContext;
  usedAutocomplete: boolean;
  atHintEnabled: boolean;
};

export function shouldShowAtHint(params: Params) {
  return shouldShowHint(params.ui, AT_HINT_RULE, {
    isMilestoneComplete: params.usedAutocomplete,
    isHintEnabled: params.atHintEnabled,
  });
}
