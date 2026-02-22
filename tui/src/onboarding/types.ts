export const ONBOARDING_VERSION = 1;

export const onboardingMilestones = [
  "sawFirstRunHome",
  "usedSlashActions",
  "usedHelpOverlay",
  "usedFileAutocomplete",
  "usedCtrlCCancel",
  "submittedFirstPrompt",
] as const;

export type OnboardingMilestone = (typeof onboardingMilestones)[number];

export const onboardingHint = {
  slash: "slashHint",
  at: "atHint",
  ctrlC: "ctrlCHint",
} as const;

export type OnboardingHint = (typeof onboardingHint)[keyof typeof onboardingHint];

export type HintDismissal = "active" | "forever";

export type OnboardingPersistedState = {
  version: typeof ONBOARDING_VERSION;
  milestones: Record<OnboardingMilestone, boolean>;
  dismissed: Record<OnboardingHint, HintDismissal>;
};

export type SessionDismissedState = Record<OnboardingHint, boolean>;

export type OnboardingState = {
  persisted: OnboardingPersistedState;
  sessionDismissed: SessionDismissedState;
};
