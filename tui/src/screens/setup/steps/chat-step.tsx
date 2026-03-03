import { SetupComboboxField, SetupTextInputField } from "@/screens/setup/fields";

type ComboboxView = {
  query: string;
  selectedValue: string;
  filteredOptions: string[];
  highlightedIndex: number;
  isOpen: boolean;
  handleInput: (value: string) => void;
  submitFromInput: () => boolean;
};

type Props = {
  provider: ComboboxView;
  model: ComboboxView;
  providerFocused: boolean;
  modelFocused: boolean;
  tokenFocused: boolean;
  tokenValue: string;
  onProviderInput: (value: string) => void;
  onModelInput: (value: string) => void;
  onTokenInput: (value: string) => void;
  onTokenSubmit: () => void;
};

export function ChatStep({
  provider,
  model,
  providerFocused,
  modelFocused,
  tokenFocused,
  tokenValue,
  onProviderInput,
  onModelInput,
  onTokenInput,
  onTokenSubmit,
}: Props) {
  const tokenLabel = provider.selectedValue ? `${provider.selectedValue} API key` : "API key";

  return (
    <box flexDirection="column">
      <text fg="#a5a5a5" style={{ marginBottom: 1 }}>Choose your chat provider and model. Type to fuzzy search.</text>

      <SetupComboboxField
        title="Provider"
        query={provider.query}
        selectedValue={provider.selectedValue}
        options={provider.filteredOptions}
        highlightedIndex={provider.highlightedIndex}
        isOpen={provider.isOpen}
        focused={providerFocused}
        onInput={onProviderInput}
        onSubmit={() => {
          provider.submitFromInput();
        }}
      />

      <SetupComboboxField
        title="Model"
        query={model.query}
        selectedValue={model.selectedValue}
        options={model.filteredOptions}
        highlightedIndex={model.highlightedIndex}
        isOpen={model.isOpen}
        focused={modelFocused}
        onInput={onModelInput}
        onSubmit={() => {
          model.submitFromInput();
        }}
      />

      <SetupTextInputField
        title={tokenLabel}
        placeholder="sk-..."
        value={tokenValue}
        focused={tokenFocused}
        onInput={onTokenInput}
        onSubmit={onTokenSubmit}
      />
    </box>
  );
}
