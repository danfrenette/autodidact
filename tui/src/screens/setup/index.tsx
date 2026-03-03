import { SectionCard } from "@/components/section-card";
import { SectionHeader } from "@/components/section-header";
import type { SetupPrefill } from "@/providers/backend-provider.tsx";
import type { ConfigParams } from "@/requests/update-config/index.ts";

import { SetupStatusFooter } from "./status-footer";
import { ActionRow } from "./steps/action-row";
import { ChatStep } from "./steps/chat-step";
import { EmbeddingStep } from "./steps/embedding-step";
import { StepTabs } from "./steps/step-tabs";
import { VaultStep } from "./steps/vault-step";
import { setupFields } from "./wizard/types";
import { useCombobox } from "./wizard/use-combobox";
import { useDraft } from "./wizard/use-draft";
import { useNavigation } from "./wizard/use-navigation";
import { useSubmit } from "./wizard/use-submit";

type Props = {
  prefill: SetupPrefill;
  missingFields: string[];
  providerOptions: string[];
  providerModelOptions: Record<string, string[]>;
  embeddingProviderOptions: string[];
  embeddingProviderModelOptions: Record<string, string[]>;
  storedTokens: Record<string, string>;
  saving: boolean;
  error: string | null;
  onSubmit: (params: ConfigParams) => void;
  onExit: () => void;
};

export function Setup({
  prefill,
  missingFields,
  providerOptions,
  providerModelOptions,
  embeddingProviderOptions,
  embeddingProviderModelOptions,
  storedTokens,
  saving,
  error: backendError,
  onSubmit,
  onExit,
}: Props) {
  const draft = useDraft({
    prefill,
    missingFields,
    providerOptions,
    providerModelOptions,
    embeddingProviderOptions,
    embeddingProviderModelOptions,
    storedTokens,
  });

  const submission = useSubmit({
    obsidianVaultPath: draft.obsidianVaultPath,
    provider: draft.provider,
    modelId: draft.modelId,
    chatToken: draft.chatToken,
    embeddingProvider: draft.embeddingProvider,
    embeddingModel: draft.embeddingModel,
    embeddingToken: draft.embeddingToken,
    backendError,
    onSubmit,
  });

  const focusedField = setupFields[draft.focusIndex] ?? setupFields[0];

  // chat comboboxes
  const providerFocused = focusedField === "provider";
  const modelFocused = focusedField === "modelId";

  const providerCombobox = useCombobox({
    options: draft.providerValues,
    selectedValue: draft.provider,
    focused: providerFocused,
    onCommit: (value) => {
      submission.clearValidationError();
      draft.setProvider(value);
      draft.focusByField("modelId");
    },
  });

  const modelCombobox = useCombobox({
    options: draft.modelValues,
    selectedValue: draft.modelId,
    focused: modelFocused,
    onCommit: (value, reason) => {
      submission.clearValidationError();
      draft.setModelId(value);

      if (reason === "enter" || reason === "tab") {
        draft.focusByField("chatToken");
      }
    },
  });

  // embedding comboboxes
  const embeddingProviderFocused = focusedField === "embeddingProvider";
  const embeddingModelFocused = focusedField === "embeddingModel";

  const embeddingProviderCombobox = useCombobox({
    options: draft.embeddingProviderValues,
    selectedValue: draft.embeddingProvider,
    focused: embeddingProviderFocused,
    onCommit: (value) => {
      submission.clearValidationError();
      draft.setEmbeddingProvider(value);
      draft.focusByField("embeddingModel");
    },
  });

  const embeddingModelCombobox = useCombobox({
    options: draft.embeddingModelValues,
    selectedValue: draft.embeddingModel,
    focused: embeddingModelFocused,
    onCommit: (value, reason) => {
      submission.clearValidationError();
      draft.setEmbeddingModel(value);

      if (reason === "enter" || reason === "tab") {
        draft.focusByField("embeddingToken");
      }
    },
  });

  useNavigation({
    providerFocused,
    modelFocused,
    embeddingProviderFocused,
    embeddingModelFocused,
    providerHandleKey: providerCombobox.handleKey,
    modelHandleKey: modelCombobox.handleKey,
    embeddingProviderHandleKey: embeddingProviderCombobox.handleKey,
    embeddingModelHandleKey: embeddingModelCombobox.handleKey,
    focusNext: draft.focusNext,
    focusPrevious: draft.focusPrevious,
    goPreviousStep: draft.goPreviousStep,
    onExit,
  });

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
      <SectionCard width={86}>
        <SectionHeader icon="◆" title="Autodidact Setup" />

        <StepTabs activeIndex={draft.stepIndex} />

        {draft.currentStep === "vault" && (
          <VaultStep
            value={draft.obsidianVaultPath}
            focused={focusedField === "obsidianVaultPath"}
            onInput={(value) => {
              submission.clearValidationError();
              draft.setObsidianVaultPath(value);
            }}
            onSubmit={() => {
              draft.goNextStep();
            }}
          />
        )}

        {draft.currentStep === "chat" && (
          <ChatStep
            provider={providerCombobox}
            model={modelCombobox}
            providerFocused={providerFocused}
            modelFocused={modelFocused}
            tokenFocused={focusedField === "chatToken"}
            tokenValue={draft.chatToken}
            onProviderInput={(value) => {
              submission.clearValidationError();
              providerCombobox.handleInput(value);
            }}
            onModelInput={(value) => {
              submission.clearValidationError();
              modelCombobox.handleInput(value);
            }}
            onTokenInput={(value) => {
              submission.clearValidationError();
              draft.setChatToken(value);
            }}
            onTokenSubmit={() => {
              draft.goNextStep();
            }}
          />
        )}

        {draft.currentStep === "embedding" && (
          <EmbeddingStep
            provider={embeddingProviderCombobox}
            model={embeddingModelCombobox}
            providerFocused={embeddingProviderFocused}
            modelFocused={embeddingModelFocused}
            tokenFocused={focusedField === "embeddingToken"}
            tokenValue={draft.embeddingToken}
            onProviderInput={(value) => {
              submission.clearValidationError();
              embeddingProviderCombobox.handleInput(value);
            }}
            onModelInput={(value) => {
              submission.clearValidationError();
              embeddingModelCombobox.handleInput(value);
            }}
            onTokenInput={(value) => {
              submission.clearValidationError();
              draft.setEmbeddingToken(value);
            }}
            onTokenSubmit={() => {
              submission.submit();
            }}
          />
        )}

        <SetupStatusFooter error={submission.error} saving={saving} />
        <ActionRow step={draft.currentStep} />
      </SectionCard>
    </box>
  );
}
