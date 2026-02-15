import { z } from "zod";

export const paramsSchema = z.object({});

export const resultSchema = z.object({
  status: z.string(),
  version: z.string(),
});

export type Params = z.infer<typeof paramsSchema>;

export type ResultWire = z.infer<typeof resultSchema>;
