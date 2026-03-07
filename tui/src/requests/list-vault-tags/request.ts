import { readPayload } from "@/requests/read-payload.ts";
import type { ServiceResult } from "@/types/rpc.ts";

import type { ResultWire } from "./types.ts";
import { resultSchema } from "./types.ts";

export const method = "list_vault_tags";

export function decode(result: ServiceResult): ResultWire {
  return resultSchema.parse(readPayload(result));
}

export function toTagList(wire: ResultWire): string[] {
  return wire.tags;
}
