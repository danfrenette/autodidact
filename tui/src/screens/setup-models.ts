export const FALLBACK_MODELS = ["gpt-4.1", "gpt-4.1-mini", "gpt-4o-mini", "o4-mini"] as const;

export function resolveAvailableModels(modelOptions: string[]): string[] {
  return modelOptions.length > 0 ? modelOptions : [...FALLBACK_MODELS];
}

export function resolveInitialModel(prefillModel: string, models: string[]): string {
  const fallback = FALLBACK_MODELS[2];
  return models.includes(prefillModel) ? prefillModel : (models[0] ?? fallback);
}

export function toModelSelectOptions(models: string[]) {
  return models.map((model) => ({
    name: model,
    description: model,
  }));
}

export function selectedModelIndex(models: string[], selectedModel: string): number {
  return models.findIndex((value) => value === selectedModel);
}
