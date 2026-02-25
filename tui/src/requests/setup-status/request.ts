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
      accessToken: wire.prefill.access_token,
      modelId: wire.prefill.model,
      provider: wire.prefill.provider,
    },
    providerOptions: wire.provider_options,
    providerModelOptions: wire.provider_model_options,
  };
}
