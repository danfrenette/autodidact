import { z } from "zod";

export const paramsSchema = z.object({
  path: z.string(),
});

export const resultSchema = z.object({
  note_path: z.string(),
  source_blob_id: z.number(),
});

export type Params = z.infer<typeof paramsSchema>;

export type ResultWire = z.infer<typeof resultSchema>;

export type AnalysisResult = {
  notePath: string;
  sourceBlobId: number;
};
