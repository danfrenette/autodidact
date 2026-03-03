import type { ConfigParams } from "@/requests/update-config/index.ts";

export const setupFields = [
  "obsidianVaultPath",
  "provider",
  "modelId",
  "chatToken",
  "embeddingProvider",
  "embeddingModel",
  "embeddingToken",
] as const;
export type SetupField = (typeof setupFields)[number];

export const setupSteps = ["vault", "chat", "embedding"] as const;
export type SetupStep = (typeof setupSteps)[number];

export const setupStepTitles: Record<SetupStep, string> = {
  vault: "Vault",
  chat: "Chat",
  embedding: "Embedding",
};

const missingFieldToStep: Record<string, SetupStep> = {
  obsidian_vault_path: "vault",
  provider: "chat",
  model: "chat",
  access_token: "chat",
  embedding_provider: "embedding",
  embedding_model: "embedding",
};

export type SetupDraft = {
  obsidianVaultPath: string;
  provider: string;
  modelId: string;
  chatToken: string;
  embeddingProvider: string;
  embeddingModel: string;
  embeddingToken: string;
};

export function fieldsForStep(step: SetupStep): SetupField[] {
  switch (step) {
    case "vault":
      return ["obsidianVaultPath"];
    case "chat":
      return ["provider", "modelId", "chatToken"];
    case "embedding":
      return ["embeddingProvider", "embeddingModel", "embeddingToken"];
  }
}

export function firstFieldForStep(step: SetupStep): SetupField {
  switch (step) {
    case "vault":
      return "obsidianVaultPath";
    case "chat":
      return "provider";
    case "embedding":
      return "embeddingProvider";
  }
}

export function stepForField(field: SetupField): SetupStep {
  switch (field) {
    case "obsidianVaultPath":
      return "vault";
    case "provider":
    case "modelId":
    case "chatToken":
      return "chat";
    case "embeddingProvider":
    case "embeddingModel":
    case "embeddingToken":
      return "embedding";
  }
}

export function initialStepIndex(missingFields: string[]): number {
  for (const step of setupSteps) {
    const hasMissing = missingFields.some((field) => missingFieldToStep[field] === step);
    if (hasMissing) {
      return setupSteps.indexOf(step);
    }
  }

  return 0;
}

export function validateSetupDraft(draft: SetupDraft):
  | { ok: true; payload: ConfigParams }
  | { ok: false; message: string } {
  if (draft.obsidianVaultPath.trim().length === 0) {
    return { ok: false, message: "Please enter your Obsidian vault path" };
  }

  if (draft.provider.trim().length === 0) {
    return { ok: false, message: "Please choose a chat provider" };
  }

  if (draft.modelId.trim().length === 0) {
    return { ok: false, message: "Please choose a chat model" };
  }

  if (draft.provider !== "dev" && draft.chatToken.trim().length === 0) {
    return { ok: false, message: "Please enter your chat API token" };
  }

  if (draft.embeddingProvider.trim().length === 0) {
    return { ok: false, message: "Please choose an embedding provider" };
  }

  if (draft.embeddingModel.trim().length === 0) {
    return { ok: false, message: "Please choose an embedding model" };
  }

  if (draft.embeddingToken.trim().length === 0) {
    return { ok: false, message: "Please enter your embedding API token" };
  }

  const tokens: Record<string, string> = {};
  if (draft.provider !== "dev" && draft.chatToken.trim().length > 0) {
    tokens[draft.provider] = draft.chatToken.trim();
  }
  if (draft.embeddingToken.trim().length > 0) {
    tokens[draft.embeddingProvider] = draft.embeddingToken.trim();
  }

  return {
    ok: true,
    payload: {
      provider: draft.provider,
      obsidianVaultPath: draft.obsidianVaultPath.trim(),
      modelId: draft.modelId,
      embeddingProvider: draft.embeddingProvider,
      embeddingModelId: draft.embeddingModel,
      tokens,
    },
  };
}
