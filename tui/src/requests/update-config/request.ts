import { readPayload } from "@/requests/read-payload.ts";
import type { ServiceResult } from "@/types/rpc.ts";

import type { ConfigParams, UpdateConfigResult } from "./types.ts";
import { resultSchema } from "./types.ts";

export const method = "update_config";

export function decode(result: ServiceResult) {
  return resultSchema.parse(readPayload(result));
}

export function toWireParams(params: ConfigParams): Record<string, unknown> {
  return {
    provider: params.provider,
    obsidian_vault_path: params.obsidianVaultPath,
    model: params.modelId,
    embedding_provider: params.embeddingProvider,
    embedding_model: params.embeddingModelId,
    tokens: params.tokens,
  };
}

export function toUpdateConfigResult(
  wire: ReturnType<typeof decode>,
): UpdateConfigResult {
  return {
    status: wire.status,
    missingFields: wire.missing_fields,
    provider: wire.provider,
    model: wire.model,
  };
}
