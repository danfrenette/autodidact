import { z } from "zod";

import { onboardingPersistedStateSchema } from "@/onboarding/schema";

export const paramsSchema = z.object({});

export const resultSchema = z.object({
  state: onboardingPersistedStateSchema.nullable(),
});

export type Params = z.infer<typeof paramsSchema>;
export type ResultWire = z.infer<typeof resultSchema>;
