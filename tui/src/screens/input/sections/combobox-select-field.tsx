import { inputStyles } from "@/screens/input/styles";

import { OptionsMenu } from "./options-menu";

type Props = {
  label: string;
  selectedValue: string;
  query: string;
  options: string[];
  highlightedIndex: number;
  isOpen: boolean;
  focused: boolean;
  onInput: (value: string) => void;
  onSubmit: () => void;
  onPress: () => void;
};

export function ComboboxSelectField({
  label,
  selectedValue,
  query,
  options,
  highlightedIndex,
  isOpen,
  focused,
  onInput,
  onSubmit,
  onPress,
}: Props) {
  return (
    <box flexDirection="column" flexGrow={1}>
      <text fg={inputStyles.label}>{label}</text>
      <box
        border
        borderColor={focused ? inputStyles.comboboxMenuBorder : inputStyles.fieldBorder}
        paddingLeft={1}
        paddingRight={1}
        backgroundColor={inputStyles.fieldBackground}
        onMouseDown={onPress}
      >
        {focused
          ? (
            <input
              value={query}
              placeholder={selectedValue}
              onInput={onInput}
              onSubmit={onSubmit}
              focused={focused}
              textColor="#eeeeee"
              cursorColor="#eeeeee"
              focusedBackgroundColor={inputStyles.fieldBackground}
              backgroundColor={inputStyles.fieldBackground}
            />
          )
          : (
            <box flexDirection="row" justifyContent="space-between" width="100%">
              <text fg={inputStyles.value}>{selectedValue}</text>
              <text fg={inputStyles.muted}>⌄</text>
            </box>
          )}
      </box>

      {isOpen && (
        <OptionsMenu
          items={options}
          highlightedIndex={highlightedIndex}
          selectedValue={selectedValue}
        />
      )}
    </box>
  );
}
