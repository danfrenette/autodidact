import { z } from "zod";

export const paramsSchema = z.object({
  database_url: z.string().optional(),
  provider: z.string(),
  obsidian_vault_path: z.string(),
  model: z.string().optional(),
  embedding_provider: z.string().optional(),
  embedding_model: z.string().optional(),
  tokens: z.record(z.string()).optional(),
});

export const resultSchema = z.object({
  status: z.union([z.literal("ready"), z.literal("needs_setup")]),
  missing_fields: z.array(z.string()),
  provider: z.string(),
  model: z.string(),
});

export type Params = z.infer<typeof paramsSchema>;

export type ResultWire = z.infer<typeof resultSchema>;

export type ConfigParams = {
  provider: string;
  obsidianVaultPath: string;
  modelId?: string;
  embeddingProvider?: string;
  embeddingModelId?: string;
  tokens?: Record<string, string>;
};

export type UpdateConfigResult = {
  status: "ready" | "needs_setup";
  missingFields: string[];
  provider: string;
  model: string;
};
