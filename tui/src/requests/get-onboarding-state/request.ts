import type { ServiceResult } from "../../types/rpc.ts";
import type { OnboardingPersistedState } from "../../onboarding/types";
import { readPayload } from "../read-payload.ts";
import { resultSchema } from "./types.ts";

export const method = "get_onboarding_state";

export function decode(result: ServiceResult) {
  return resultSchema.parse(readPayload(result));
}

export function toOnboardingState(wire: ReturnType<typeof decode>): OnboardingPersistedState | null {
  return wire.state;
}
