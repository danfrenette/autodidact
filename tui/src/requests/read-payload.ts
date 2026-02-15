import type { ServiceResult } from "../types/rpc.ts";

export function readPayload(result: ServiceResult): Record<string, unknown> {
  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.payload;
}
