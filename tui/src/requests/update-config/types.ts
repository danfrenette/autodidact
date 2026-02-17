import { z } from "zod";

export const paramsSchema = z.object({
  database_url: z.string().optional(),
  obsidian_vault_path: z.string(),
  openai_access_token: z.string(),
  openai_model: z.string().optional(),
});

export const resultSchema = z.object({
  status: z.union([z.literal("ready"), z.literal("needs_setup")]),
  missing_fields: z.array(z.string()),
});

export type Params = z.infer<typeof paramsSchema>;

export type ResultWire = z.infer<typeof resultSchema>;

export type ConfigParams = {
  obsidianVaultPath: string;
  openaiAccessToken: string;
  openaiModel?: string;
};

export type UpdateConfigResult = {
  status: "ready" | "needs_setup";
  missingFields: string[];
};
