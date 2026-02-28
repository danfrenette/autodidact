import { SectionCard } from "@/components/section-card";
import { SectionHeader } from "@/components/section-header";
import type { SetupPrefill } from "@/providers/backend-provider.tsx";
import type { ConfigParams } from "@/requests/update-config/index.ts";

import { SetupStatusFooter } from "./status-footer";
import { AccessTokenStep } from "./steps/access-token-step";
import { ActionRow } from "./steps/action-row";
import { ProviderModelStep } from "./steps/provider-model-step";
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
  saving,
  error: backendError,
  onSubmit,
  onExit,
}: Props) {
  const draft = useDraft({ prefill, missingFields, providerOptions, providerModelOptions });
  const submission = useSubmit({
    obsidianVaultPath: draft.obsidianVaultPath,
    provider: draft.provider,
    accessToken: draft.accessToken,
    modelId: draft.modelId,
    backendError,
    onSubmit,
  });

  const focusedField = setupFields[draft.focusIndex] ?? setupFields[0];
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
        draft.goNextStep();
      }
    },
  });

  useNavigation({
    providerFocused,
    modelFocused,
    providerHandleKey: providerCombobox.handleKey,
    modelHandleKey: modelCombobox.handleKey,
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

        {draft.currentStep === "providerModel" && (
          <ProviderModelStep
            provider={providerCombobox}
            model={modelCombobox}
            providerFocused={providerFocused}
            modelFocused={modelFocused}
            onProviderInput={(value) => {
              submission.clearValidationError();
              providerCombobox.handleInput(value);
            }}
            onModelInput={(value) => {
              submission.clearValidationError();
              modelCombobox.handleInput(value);
            }}
          />
        )}

        {draft.currentStep === "accessToken" && (
          <AccessTokenStep
            value={draft.accessToken}
            provider={draft.provider}
            modelId={draft.modelId}
            vaultPath={draft.obsidianVaultPath}
            focused={focusedField === "accessToken"}
            onInput={(value) => {
              submission.clearValidationError();
              draft.setAccessToken(value);
            }}
            onSubmit={() => {
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
