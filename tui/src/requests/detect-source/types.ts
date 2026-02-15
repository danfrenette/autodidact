import { z } from "zod";

export const sourceTypeSchema = z.union([z.literal("text"), z.literal("pdf")]);

export const paramsSchema = z.object({
  path: z.string(),
});

export const resultSchema = z.object({
  path: z.string(),
  source_type: sourceTypeSchema,
  metadata: z.record(z.string(), z.unknown()),
});

export type SourceType = z.infer<typeof sourceTypeSchema>;

export type Params = z.infer<typeof paramsSchema>;

export type ResultWire = z.infer<typeof resultSchema>;

export type SourceInfo = {
  path: string;
  sourceType: SourceType;
  metadata: Record<string, unknown>;
};
