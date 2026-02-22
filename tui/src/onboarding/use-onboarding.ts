import { useCallback, useMemo, useReducer, useRef } from "react";

import type { OnboardingAction } from "./state";
import { createOnboardingStore, isOnboardingComplete, onboardingReducer } from "./state";
import type { OnboardingHint, OnboardingPersistedState } from "./types";

type Params = {
  initialState: OnboardingPersistedState | null;
  saveState: (state: OnboardingPersistedState) => Promise<void>;
};

export function useOnboarding({ initialState, saveState }: Params) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState, createOnboardingStore);
  const stateRef = useRef(state);
  stateRef.current = state;

  const dispatchAndPersist = useCallback((action: OnboardingAction) => {
    const current = stateRef.current;
    const next = onboardingReducer(current, action);
    dispatch(action);
    if (next.persisted !== current.persisted) {
      void saveState(next.persisted);
    }
  }, [saveState]);

  const onFirstInput = useCallback(() => {
    dispatchAndPersist({ type: "mark-milestone", milestone: "sawFirstRunHome" });
  }, [dispatchAndPersist]);

  const onHelpOpened = useCallback(() => {
    dispatchAndPersist({ type: "mark-milestone", milestone: "usedHelpOverlay" });
  }, [dispatchAndPersist]);

  const onAutocompleteUsed = useCallback(() => {
    dispatchAndPersist({ type: "mark-milestone", milestone: "usedFileAutocomplete" });
  }, [dispatchAndPersist]);

  const onCancelUsed = useCallback(() => {
    dispatchAndPersist({ type: "mark-milestone", milestone: "usedCtrlCCancel" });
  }, [dispatchAndPersist]);

  const onSubmitSucceeded = useCallback(() => {
    dispatchAndPersist({ type: "mark-milestone", milestone: "submittedFirstPrompt" });
  }, [dispatchAndPersist]);

  const dismissHintSession = useCallback((hint: OnboardingHint) => {
    dispatchAndPersist({ type: "dismiss-session", hint });
  }, [dispatchAndPersist]);

  const dismissHintForever = useCallback((hint: OnboardingHint) => {
    dispatchAndPersist({ type: "dismiss-forever", hint });
  }, [dispatchAndPersist]);

  const isComplete = useMemo(() => isOnboardingComplete(state.persisted), [state.persisted]);

  const showFirstRunPanel = useMemo(() => {
    if (isComplete) {
      return false;
    }

    return !state.persisted.milestones.sawFirstRunHome;
  }, [isComplete, state.persisted.milestones.sawFirstRunHome]);

  const shouldShowHint = useCallback((hint: OnboardingHint) => {
    if (isOnboardingComplete(state.persisted)) {
      return false;
    }

    if (state.persisted.dismissed[hint] === "forever") {
      return false;
    }

    return !state.sessionDismissed[hint];
  }, [state.persisted, state.sessionDismissed]);

  return {
    milestones: state.persisted.milestones,
    isComplete,
    showFirstRunPanel,
    shouldShowHint,
    onFirstInput,
    onHelpOpened,
    onAutocompleteUsed,
    onCancelUsed,
    onSubmitSucceeded,
    dismissHintSession,
    dismissHintForever,
  };
}
