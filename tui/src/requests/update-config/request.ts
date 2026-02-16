import type { ServiceResult } from "../../types/rpc.ts";
import { readPayload } from "../read-payload.ts";
import type { ConfigParams, UpdateConfigResult } from "./types.ts";
import { resultSchema } from "./types.ts";

export const method = "update_config";

export function decode(result: ServiceResult) {
  return resultSchema.parse(readPayload(result));
}

export function toWireParams(params: ConfigParams): Record<string, unknown> {
  return {
    database_url: params.databaseUrl,
    obsidian_vault_path: params.obsidianVaultPath,
    openai_access_token: params.openaiAccessToken,
    openai_model: params.openaiModel,
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
