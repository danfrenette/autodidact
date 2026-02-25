import type { ConfigParams } from "@/requests/update-config/index.ts";

export const setupFields = ["obsidianVaultPath", "provider", "accessToken", "modelId"] as const;
export type SetupField = (typeof setupFields)[number];

export type SetupDraft = {
  obsidianVaultPath: string;
  provider: string;
  accessToken: string;
  modelId: string;
};

export function validateSetupDraft(draft: SetupDraft):
  | { ok: true; payload: ConfigParams }
  | { ok: false; message: string } {
  if (draft.obsidianVaultPath.trim().length === 0) {
    return { ok: false, message: "Please enter your Obsidian vault path" };
  }

  if (draft.accessToken.trim().length === 0) {
    return { ok: false, message: "Please enter your API access token" };
  }

  if (draft.modelId.trim().length === 0) {
    return { ok: false, message: "Please choose a model" };
  }

  return {
    ok: true,
    payload: {
      provider: draft.provider,
      obsidianVaultPath: draft.obsidianVaultPath.trim(),
      accessToken: draft.accessToken.trim(),
      modelId: draft.modelId,
    },
  };
}
