import { z } from "zod";

export const paramsSchema = z.object({
  database_url: z.string().optional(),
  provider: z.string(),
  obsidian_vault_path: z.string(),
  access_token: z.string().optional(),
  model: z.string().optional(),
});

export const resultSchema = z.object({
  status: z.union([z.literal("ready"), z.literal("needs_setup")]),
  missing_fields: z.array(z.string()),
});

export type Params = z.infer<typeof paramsSchema>;

export type ResultWire = z.infer<typeof resultSchema>;

export type ConfigParams = {
  provider: string;
  obsidianVaultPath: string;
  accessToken?: string;
  modelId?: string;
};

export type UpdateConfigResult = {
  status: "ready" | "needs_setup";
  missingFields: string[];
};
