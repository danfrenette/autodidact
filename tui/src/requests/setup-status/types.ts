import { z } from "zod";

export const paramsSchema = z.object({});

export const prefillSchema = z.object({
  database_url: z.string().nullable(),
  obsidian_vault_path: z.string().nullable(),
  access_token: z.string().nullable(),
  model: z.string(),
  provider: z.string(),
});

export const resultSchema = z.object({
  status: z.union([z.literal("ready"), z.literal("needs_setup")]),
  missing_fields: z.array(z.string()),
  prefill: prefillSchema,
  provider_options: z.array(z.string()),
  provider_model_options: z.record(z.array(z.string())),
});

export type Params = z.infer<typeof paramsSchema>;

export type ResultWire = z.infer<typeof resultSchema>;

export type SetupStatus = {
  status: "ready" | "needs_setup";
  missingFields: string[];
  prefill: {
    databaseUrl: string | null;
    obsidianVaultPath: string | null;
    accessToken: string | null;
    modelId: string;
    provider: string;
  };
  providerOptions: string[];
  providerModelOptions: Record<string, string[]>;
};
