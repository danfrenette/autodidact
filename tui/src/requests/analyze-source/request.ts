import { readPayload } from "@/requests/read-payload.ts";
import type { ServiceResult } from "@/types/rpc.ts";

import type { AnalysisResult, ResultWire } from "./types.ts";
import { resultSchema } from "./types.ts";

export const method = "analyze_source";

export function decode(result: ServiceResult): ResultWire {
  return resultSchema.parse(readPayload(result));
}

export function toAnalysisResult(wire: ResultWire): AnalysisResult {
  if (wire.status === "completed") {
    return {
      status: "completed",
      notePath: wire.note_path,
      sourceBlobId: wire.source_blob_id,
    };
  }

  return {
    status: "pending_selection",
    chapters: wire.chapters,
  };
}
