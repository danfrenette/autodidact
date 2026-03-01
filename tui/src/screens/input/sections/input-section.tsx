import { Badge } from "@opentui-ui/react/badge";

import { OptionsMenu } from "@/components/options-menu";
import { SectionCard } from "@/components/section-card";
import { SectionHeader } from "@/components/section-header";
import { uiStyles } from "@/components/ui-styles";
import type { FilePathAutocompleteState } from "@/hooks/use-file-path-autocomplete";
import { inputBadgeStyles } from "@/screens/input/styles";

import { ComboboxSelectField } from "./combobox-select-field";

type ComboboxView = {
  query: string;
  selectedValue: string;
  filteredOptions: string[];
  highlightedIndex: number;
  isOpen: boolean;
  focused: boolean;
  handleInput: (value: string) => void;
  submitFromInput: () => boolean;
};

type Props = {
  value: string;
  submitting: boolean;
  onInput: (value: string) => void;
  onSubmit: () => void;
  badgeLabel: string | null;
  badgeSupported: boolean;
  provider: string;
  model: string;
  modelPickerExpanded: boolean;
  onProviderPress: () => void;
  onModelPress: () => void;
  onChevronPress: () => void;
  providerCombobox: ComboboxView;
  modelCombobox: ComboboxView;
  autocompleteState: FilePathAutocompleteState;
  width: number;
};

export function InputSection({
  value,
  submitting,
  onInput,
  onSubmit,
  badgeLabel,
  badgeSupported,
  provider,
  model,
  modelPickerExpanded,
  onProviderPress,
  onModelPress,
  onChevronPress,
  providerCombobox,
  modelCombobox,
  autocompleteState,
  width,
}: Props) {
  return (
    <SectionCard width={width} marginBottom={1} gap={0}>
      <SectionHeader icon="↥" title="INPUT" right={badgeLabel ? <Badge label={badgeLabel} styles={inputBadgeStyles(badgeSupported)} /> : undefined} />

      <box border borderColor={uiStyles.fieldBorder} paddingLeft={1} paddingRight={1} backgroundColor={uiStyles.fieldBackground}>
        <input
          value={value}
          placeholder={'Enter a file path or input text... "./notes/chapter.txt"'}
          onInput={onInput}
          onSubmit={onSubmit}
          focused={!submitting}
          textColor="#eeeeee"
          cursorColor="#eeeeee"
          focusedBackgroundColor={uiStyles.fieldBackground}
          backgroundColor={uiStyles.fieldBackground}
        />
      </box>

      {autocompleteState.status === "loading" && (
        <OptionsMenu items={[]} highlightedIndex={-1} showSelectionMarker={false} emptyMessage="Searching files..." maxItems={6} />
      )}

      {autocompleteState.status === "empty" && (
        <OptionsMenu items={[]} highlightedIndex={-1} showSelectionMarker={false} emptyMessage="No matching files" maxItems={6} />
      )}

      {autocompleteState.status === "open" && (
        <OptionsMenu items={autocompleteState.items} highlightedIndex={autocompleteState.selectedIndex} showSelectionMarker={false} maxItems={6} />
      )}

      <box flexDirection="row" alignItems="center" gap={1}>
        <text fg={uiStyles.muted} onMouseDown={onModelPress}>{model}</text>
        <text fg={uiStyles.label}>/</text>
        <text fg={uiStyles.muted} onMouseDown={onProviderPress}>{provider}</text>
        <text fg={uiStyles.muted} onMouseDown={onChevronPress}>{modelPickerExpanded ? "⌃" : "⌄"}</text>
      </box>

      {modelPickerExpanded && (
        <box flexDirection="row" gap={2}>
          <ComboboxSelectField
            label="PROVIDER"
            selectedValue={providerCombobox.selectedValue}
            query={providerCombobox.query}
            options={providerCombobox.filteredOptions}
            highlightedIndex={providerCombobox.highlightedIndex}
            isOpen={providerCombobox.isOpen}
            focused={providerCombobox.focused}
            onInput={providerCombobox.handleInput}
            onSubmit={providerCombobox.submitFromInput}
            onPress={onProviderPress}
          />
          <ComboboxSelectField
            label="MODEL"
            selectedValue={modelCombobox.selectedValue}
            query={modelCombobox.query}
            options={modelCombobox.filteredOptions}
            highlightedIndex={modelCombobox.highlightedIndex}
            isOpen={modelCombobox.isOpen}
            focused={modelCombobox.focused}
            onInput={modelCombobox.handleInput}
            onSubmit={modelCombobox.submitFromInput}
            onPress={onModelPress}
          />
        </box>
      )}
    </SectionCard>
  );
}
