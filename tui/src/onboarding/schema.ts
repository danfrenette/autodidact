import { z } from "zod";
import { onboardingHint, ONBOARDING_VERSION } from "./types";

export const onboardingMilestonesSchema = z.object({
  sawFirstRunHome: z.boolean(),
  usedSlashActions: z.boolean(),
  usedHelpOverlay: z.boolean(),
  usedFileAutocomplete: z.boolean(),
  usedCtrlCCancel: z.boolean(),
  submittedFirstPrompt: z.boolean(),
});

export const onboardingDismissedSchema = z.object({
  [onboardingHint.slash]: z.union([z.literal("active"), z.literal("forever")]),
  [onboardingHint.at]: z.union([z.literal("active"), z.literal("forever")]),
  [onboardingHint.ctrlC]: z.union([z.literal("active"), z.literal("forever")]),
});

export const onboardingPersistedStateSchema = z.object({
  version: z.literal(ONBOARDING_VERSION),
  milestones: onboardingMilestonesSchema,
  dismissed: onboardingDismissedSchema,
});
