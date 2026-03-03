export const PROVIDER_OPENAI = "openai";
export const PROVIDER_ANTHROPIC = "anthropic";
export const PROVIDER_GOOGLE = "google";

export function resolveAvailableProviders(providerOptions: string[]): string[] {
  if (providerOptions.length > 0) {
    return providerOptions;
  }

  return [PROVIDER_OPENAI, PROVIDER_ANTHROPIC, PROVIDER_GOOGLE];
}

export function resolveInitialProvider(prefillProvider: string, providers: string[]): string {
  if (providers.includes(prefillProvider)) {
    return prefillProvider;
  }

  return providers[0] ?? PROVIDER_OPENAI;
}

export function toProviderSelectOptions(providers: string[]) {
  return providers.map((provider) => ({
    name: provider,
    description: provider,
  }));
}
