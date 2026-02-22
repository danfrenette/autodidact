import type { OnboardingPersistedState } from "@/onboarding/types";
import { readPayload } from "@/requests/read-payload.ts";
import type { ServiceResult } from "@/types/rpc.ts";

import { resultSchema } from "./types.ts";

export const method = "set_onboarding_state";

export function decode(result: ServiceResult) {
  return resultSchema.parse(readPayload(result));
}

export function toWireParams(state: OnboardingPersistedState): Record<string, OnboardingPersistedState> {
  return { state };
}
