import type { KeyEvent } from "@opentui/core";
import { useCallback, useMemo, useState } from "react";

import { useOnboardingContext } from "@/onboarding/context";
import { onboardingHint } from "@/onboarding/types";

import { buildHintUiContext } from "./hint-visibility";
import { shouldShowAtHint } from "./should-show-at-hint";
import { shouldShowCtrlCHint } from "./should-show-ctrlc-hint";

type Params = {
  inputValue: string;
  submitting: boolean;
};

export function useFileInputOnboarding({ inputValue, submitting }: Params) {
  const onboarding = useOnboardingContext();
  const [showHelp, setShowHelp] = useState(false);

  const ui = useMemo(
    () =>
      buildHintUiContext({
        submitting,
        inputValue,
        showHelp,
      }),
    [inputValue, showHelp, submitting],
  );

  const showAtHint = useMemo(
    () =>
      shouldShowAtHint({
        ui,
        usedAutocomplete: onboarding.milestones.usedFileAutocomplete,
        atHintEnabled: onboarding.shouldShowHint(onboardingHint.at),
      }),
    [onboarding, ui],
  );

  const showCtrlCHint = useMemo(
    () =>
      shouldShowCtrlCHint({
        ui,
        usedCtrlCCancel: onboarding.milestones.usedCtrlCCancel,
        ctrlCHintEnabled: onboarding.shouldShowHint(onboardingHint.ctrlC),
      }),
    [onboarding, ui],
  );

  const closePanels = useCallback(() => {
    setShowHelp(false);
  }, []);

  const handleKeyboard = useCallback(
    (key: KeyEvent) => {
      if (key.name === "escape") {
        if (showHelp) {
          closePanels();
          key.preventDefault();
          return true;
        }

        if (showAtHint) onboarding.dismissHintSession(onboardingHint.at);
        else if (showCtrlCHint) onboarding.dismissHintSession(onboardingHint.ctrlC);
        return false;
      }

      if (submitting) {
        return false;
      }

      if (key.sequence === "?" && ui.inputIsEmpty) {
        setShowHelp((current) => !current);
        onboarding.onHelpOpened();
        key.preventDefault();
        return true;
      }

      return false;
    },
    [closePanels, onboarding, showAtHint, showCtrlCHint, showHelp, submitting, ui.inputIsEmpty],
  );

  const handleInput = useCallback(
    (nextValue: string) => {
      if (showHelp) {
        closePanels();
      }

      if (nextValue.trim().length > 0) {
        onboarding.onFirstInput();
      }

      if (nextValue.trim().startsWith("@")) {
        onboarding.onAutocompleteUsed();
      }
    },
    [closePanels, onboarding, showHelp],
  );

  return {
    showHelp,
    showFirstRunPanel: onboarding.showFirstRunPanel,
    showAtHint,
    showCtrlCHint,
    handleKeyboard,
    handleInput,
    onAutocompleteSelected: onboarding.onAutocompleteUsed,
    onSubmitSucceeded: onboarding.onSubmitSucceeded,
    dismissHintSession: onboarding.dismissHintSession,
    dismissHintForever: onboarding.dismissHintForever,
  };
}
