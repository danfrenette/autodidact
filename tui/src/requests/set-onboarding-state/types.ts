import { z } from "zod";
import { onboardingPersistedStateSchema } from "../../onboarding/schema";

export const paramsSchema = z.object({
  state: onboardingPersistedStateSchema,
});

export const resultSchema = z.object({
  ok: z.boolean(),
});

export type Params = z.infer<typeof paramsSchema>;
export type ResultWire = z.infer<typeof resultSchema>;
