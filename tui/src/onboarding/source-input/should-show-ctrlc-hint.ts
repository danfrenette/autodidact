import { onboardingHint } from "@/onboarding/types";

import type { HintUiContext } from "./hint-visibility";
import { shouldShowHint } from "./hint-visibility";

const CTRLC_HINT_RULE = {
  hint: onboardingHint.ctrlC,
  requiresEmptyInput: false,
} as const;

type Params = {
  ui: HintUiContext;
  usedCtrlCCancel: boolean;
  ctrlCHintEnabled: boolean;
};

export function shouldShowCtrlCHint(params: Params) {
  return shouldShowHint(params.ui, CTRLC_HINT_RULE, {
    isMilestoneComplete: params.usedCtrlCCancel,
    isHintEnabled: params.ctrlCHintEnabled,
  });
}
