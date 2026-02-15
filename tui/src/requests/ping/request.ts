import type { ServiceResult } from "../../types/rpc.ts";
import { readPayload } from "../read-payload.ts";
import { resultSchema } from "./types.ts";

export const method = "ping";

export function decode(result: ServiceResult) {
  return resultSchema.parse(readPayload(result));
}
