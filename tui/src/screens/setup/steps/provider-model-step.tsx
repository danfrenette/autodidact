import { SetupComboboxField } from "@/screens/setup/fields";

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
  onProviderInput: (value: string) => void;
  onModelInput: (value: string) => void;
};

export function ProviderModelStep({
  provider,
  model,
  providerFocused,
  modelFocused,
  onProviderInput,
  onModelInput,
}: Props) {
  return (
    <>
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
    </>
  );
}
