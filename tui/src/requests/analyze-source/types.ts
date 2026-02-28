import { z } from "zod";

const chapterSchema = z.object({
  title: z.string(),
  page: z.number(),
});

export const paramsSchema = z.object({
  input: z.string(),
  chapter: chapterSchema.optional(),
});

const completedSchema = z.object({
  status: z.literal("completed"),
  note_path: z.string(),
  source_blob_id: z.string(),
});

const pendingSelectionSchema = z.object({
  status: z.literal("pending_selection"),
  chapters: z.array(chapterSchema),
});

export const resultSchema = z.union([completedSchema, pendingSelectionSchema]);

export type Params = z.infer<typeof paramsSchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type ResultWire = z.infer<typeof resultSchema>;

export type CompletedResult = {
  status: "completed";
  notePath: string;
  sourceBlobId: string;
};

export type PendingSelectionResult = {
  status: "pending_selection";
  chapters: Chapter[];
};

export type AnalysisResult = CompletedResult | PendingSelectionResult;
