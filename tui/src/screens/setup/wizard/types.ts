import type { ConfigParams } from "@/requests/update-config/index.ts";

export const setupFields = ["obsidianVaultPath", "provider", "modelId", "accessToken"] as const;
export type SetupField = (typeof setupFields)[number];

export const setupSteps = ["vault", "providerModel", "accessToken"] as const;
export type SetupStep = (typeof setupSteps)[number];

export const setupStepTitles: Record<SetupStep, string> = {
  vault: "Vault",
  providerModel: "Provider + Model",
  accessToken: "Access Token",
};

const missingFieldToStep: Record<string, SetupStep> = {
  obsidian_vault_path: "vault",
  provider: "providerModel",
  model: "providerModel",
  access_token: "accessToken",
};

export type SetupDraft = {
  obsidianVaultPath: string;
  provider: string;
  accessToken: string;
  modelId: string;
};

export function fieldsForStep(step: SetupStep): SetupField[] {
  switch (step) {
    case "vault":
      return ["obsidianVaultPath"];
    case "providerModel":
      return ["provider", "modelId"];
    case "accessToken":
      return ["accessToken"];
  }
}

export function firstFieldForStep(step: SetupStep): SetupField {
  switch (step) {
    case "vault":
      return "obsidianVaultPath";
    case "providerModel":
      return "provider";
    case "accessToken":
      return "accessToken";
  }
}

export function stepForField(field: SetupField): SetupStep {
  switch (field) {
    case "obsidianVaultPath":
      return "vault";
    case "provider":
    case "modelId":
      return "providerModel";
    case "accessToken":
      return "accessToken";
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
