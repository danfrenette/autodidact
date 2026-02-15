import type { ServiceResult } from "../../types/rpc.ts";
import { resultSchema } from "./types.ts";

export const method = "ping";

function readPayload(result: ServiceResult): Record<string, unknown> {
  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.payload;
}

export function decode(result: ServiceResult) {
  return resultSchema.parse(readPayload(result));
}
