import type { ServiceResult } from "../../types/rpc.ts";
import { readPayload } from "../read-payload.ts";
import type { SourceInfo } from "./types.ts";
import { resultSchema } from "./types.ts";

export const method = "detect_source";

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
