import type {
  OnboardingHint,
  OnboardingMilestone,
  OnboardingPersistedState,
  OnboardingState,
  SessionDismissedState,
} from "./types";
import { onboardingHint, ONBOARDING_VERSION } from "./types";

export type OnboardingAction =
  | { type: "mark-milestone"; milestone: OnboardingMilestone }
  | { type: "dismiss-session"; hint: OnboardingHint }
  | { type: "dismiss-forever"; hint: OnboardingHint };

const DEFAULT_SESSION_DISMISSED: SessionDismissedState = {
  [onboardingHint.slash]: false,
  [onboardingHint.at]: false,
  [onboardingHint.ctrlC]: false,
};

export function createDefaultOnboardingState(): OnboardingPersistedState {
  return {
    version: ONBOARDING_VERSION,
    milestones: {
      sawFirstRunHome: false,
      usedSlashActions: false,
      usedHelpOverlay: false,
      usedFileAutocomplete: false,
      usedCtrlCCancel: false,
      submittedFirstPrompt: false,
    },
    dismissed: {
      [onboardingHint.slash]: "active",
      [onboardingHint.at]: "active",
      [onboardingHint.ctrlC]: "active",
    },
  };
}

export function createOnboardingStore(initialState: OnboardingPersistedState | null): OnboardingState {
  return {
    persisted: initialState ?? createDefaultOnboardingState(),
    sessionDismissed: DEFAULT_SESSION_DISMISSED,
  };
}

export function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case "mark-milestone": {
      if (state.persisted.milestones[action.milestone]) {
        return state;
      }

      return {
        ...state,
        persisted: {
          ...state.persisted,
          milestones: {
            ...state.persisted.milestones,
            [action.milestone]: true,
          },
        },
      };
    }
    case "dismiss-session": {
      if (state.sessionDismissed[action.hint]) {
        return state;
      }

      return {
        ...state,
        sessionDismissed: {
          ...state.sessionDismissed,
          [action.hint]: true,
        },
      };
    }
    case "dismiss-forever": {
      if (state.persisted.dismissed[action.hint] === "forever" && state.sessionDismissed[action.hint]) {
        return state;
      }

      return {
        persisted: {
          ...state.persisted,
          dismissed: {
            ...state.persisted.dismissed,
            [action.hint]: "forever",
          },
        },
        sessionDismissed: {
          ...state.sessionDismissed,
          [action.hint]: true,
        },
      };
    }
  }
}

export function isOnboardingComplete(state: OnboardingPersistedState): boolean {
  if (!state.milestones.submittedFirstPrompt) {
    return false;
  }

  return state.milestones.usedSlashActions || state.milestones.usedFileAutocomplete;
}
