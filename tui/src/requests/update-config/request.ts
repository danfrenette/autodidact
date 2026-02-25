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
    access_token: params.accessToken,
    model: params.modelId,
  };
}

export function toUpdateConfigResult(
  wire: ReturnType<typeof decode>,
): UpdateConfigResult {
  return {
    status: wire.status,
    missingFields: wire.missing_fields,
  };
}
