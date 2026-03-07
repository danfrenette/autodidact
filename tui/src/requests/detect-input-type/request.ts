import { readPayload } from "@/requests/read-payload.ts";
import type { ServiceResult } from "@/types/rpc.ts";

import type { InputType } from "./types.ts";
import { resultSchema } from "./types.ts";

export const method = "detect_input_type";

export function decode(result: ServiceResult): InputType {
  const wire = resultSchema.parse(readPayload(result));
  return wire.input_type;
}
