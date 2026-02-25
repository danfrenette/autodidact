import { useKeyboard } from "@opentui/react";

import { useSetupCombobox } from "@/hooks/use-setup-combobox";
import { useSetupDraft } from "@/hooks/use-setup-draft";
import { useSetupSubmit } from "@/hooks/use-setup-submit";
import type { SetupPrefill } from "@/providers/backend-provider.tsx";
import type { ConfigParams } from "@/requests/update-config/index.ts";
import { setupFields } from "@/screens/setup-domain";
import { SetupComboboxField, SetupTextInputField } from "@/screens/setup-fields";
import { SetupStatusFooter } from "@/screens/setup-status-footer";

type Props = {
  prefill: SetupPrefill;
  providerOptions: string[];
  providerModelOptions: Record<string, string[]>;
  saving: boolean;
  error: string | null;
  onSubmit: (params: ConfigParams) => void;
  onExit: () => void;
};

export function Setup({ prefill, providerOptions, providerModelOptions, saving, error: backendError, onSubmit, onExit }: Props) {
  const draft = useSetupDraft({ prefill, providerOptions, providerModelOptions });
  const submission = useSetupSubmit({
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

  const providerCombobox = useSetupCombobox({
    options: draft.providerValues,
    selectedValue: draft.provider,
    focused: providerFocused,
    onCommit: (value) => {
      submission.clearValidationError();
      draft.setProvider(value);
      draft.focusByField("accessToken");
    },
  });

  const modelCombobox = useSetupCombobox({
    options: draft.modelValues,
    selectedValue: draft.modelId,
    focused: modelFocused,
    onCommit: (value, reason) => {
      submission.clearValidationError();
      draft.setModelId(value);

      if (reason === "enter") {
        submission.submit();
      }
    },
  });

  useKeyboard((key) => {
    if (providerFocused && providerCombobox.handleKey(key)) {
      return;
    }

    if (modelFocused && modelCombobox.handleKey(key)) {
      return;
    }

    if (key.name === "escape" || (key.name === "c" && key.ctrl)) {
      onExit();
      return;
    }

    if (key.name === "tab") {
      draft.focusNext();
    }
  });

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
      <text style={{ marginBottom: 1 }}>Autodidact Setup</text>

      <SetupTextInputField
        title="Obsidian vault path"
        placeholder="/path/to/vault"
        value={draft.obsidianVaultPath}
        onInput={(value) => {
          submission.clearValidationError();
          draft.setObsidianVaultPath(value);
        }}
        onSubmit={() => draft.focusByField("provider")}
        focused={focusedField === "obsidianVaultPath"}
      />

      <SetupComboboxField
        title="Provider"
        value={providerCombobox.inputValue}
        placeholder={draft.provider}
        options={providerCombobox.filteredOptions}
        highlightedIndex={providerCombobox.highlightedIndex}
        isOpen={providerCombobox.isOpen}
        focused={providerFocused}
        onInput={(value) => {
          submission.clearValidationError();
          providerCombobox.handleInput(value);
        }}
        onSubmit={() => {
          providerCombobox.submitFromInput();
        }}
      />

      <SetupTextInputField
        title="Access token"
        placeholder="sk-..."
        value={draft.accessToken}
        onInput={(value) => {
          submission.clearValidationError();
          draft.setAccessToken(value);
        }}
        onSubmit={submission.submit}
        focused={focusedField === "accessToken"}
      />

      <SetupComboboxField
        title="Model"
        value={modelCombobox.inputValue}
        placeholder={draft.modelId}
        options={modelCombobox.filteredOptions}
        highlightedIndex={modelCombobox.highlightedIndex}
        isOpen={modelCombobox.isOpen}
        focused={modelFocused}
        onInput={(value) => {
          submission.clearValidationError();
          modelCombobox.handleInput(value);
        }}
        onSubmit={() => {
          modelCombobox.submitFromInput();
        }}
      />

      <SetupStatusFooter error={submission.error} saving={saving} />
    </box>
  );
}
