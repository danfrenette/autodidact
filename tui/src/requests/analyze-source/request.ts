import { readPayload } from "@/requests/read-payload.ts";
import type { ServiceResult } from "@/types/rpc.ts";

import type { AnalysisResult } from "./types.ts";
import { resultSchema } from "./types.ts";

export const method = "analyze_source";

export function decode(result: ServiceResult) {
  return resultSchema.parse(readPayload(result));
}

export function toAnalysisResult(wire: ReturnType<typeof decode>): AnalysisResult {
  return {
    notePath: wire.note_path,
    sourceBlobId: wire.source_blob_id,
  };
}
