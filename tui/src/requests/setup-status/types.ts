import { z } from "zod";

export const paramsSchema = z.object({});

export const prefillSchema = z.object({
  database_url: z.string().nullable(),
  obsidian_vault_path: z.string().nullable(),
  openai_access_token: z.string().nullable(),
  openai_model: z.string().nullable(),
});

export const resultSchema = z.object({
  status: z.union([z.literal("ready"), z.literal("needs_setup")]),
  missing_fields: z.array(z.string()),
  prefill: prefillSchema,
});

export type Params = z.infer<typeof paramsSchema>;

export type ResultWire = z.infer<typeof resultSchema>;

export type SetupStatus = {
  status: "ready" | "needs_setup";
  missingFields: string[];
  prefill: {
    databaseUrl: string | null;
    obsidianVaultPath: string | null;
    openaiAccessToken: string | null;
    openaiModel: string | null;
  };
};
