import type { ServiceResult } from "../../types/rpc.ts";
import type { SourceInfo } from "./types.ts";
import { resultSchema } from "./types.ts";

export const method = "detect_source";

function readPayload(result: ServiceResult): Record<string, unknown> {
  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.payload;
}

export function decode(result: ServiceResult) {
  return resultSchema.parse(readPayload(result));
}

export function toSourceInfo(wire: ReturnType<typeof decode>): SourceInfo {
  return {
    path: wire.path,
    sourceType: wire.source_type,
    metadata: wire.metadata,
  };
}
