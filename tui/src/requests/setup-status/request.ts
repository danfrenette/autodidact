import { readPayload } from "@/requests/read-payload.ts";
import type { ServiceResult } from "@/types/rpc.ts";

import type { SetupStatus } from "./types.ts";
import { resultSchema } from "./types.ts";

export const method = "setup_status";

export function decode(result: ServiceResult) {
  return resultSchema.parse(readPayload(result));
}

export function toSetupStatus(wire: ReturnType<typeof decode>): SetupStatus {
  return {
    status: wire.status,
    missingFields: wire.missing_fields,
    prefill: {
      databaseUrl: wire.prefill.database_url,
      obsidianVaultPath: wire.prefill.obsidian_vault_path,
      openaiAccessToken: wire.prefill.openai_access_token,
      openaiModel: wire.prefill.openai_model,
    },
    modelOptions: wire.model_options,
  };
}
