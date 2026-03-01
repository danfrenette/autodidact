import { OptionsMenu } from "@/components/options-menu";
import { uiStyles } from "@/components/ui-styles";

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
      <text fg={uiStyles.label}>{label}</text>
      <box
        border
        borderColor={focused ? uiStyles.comboboxMenuBorder : uiStyles.fieldBorder}
        paddingLeft={1}
        paddingRight={1}
        backgroundColor={uiStyles.fieldBackground}
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
              focusedBackgroundColor={uiStyles.fieldBackground}
              backgroundColor={uiStyles.fieldBackground}
            />
          )
          : (
            <box flexDirection="row" justifyContent="space-between" width="100%">
              <text fg={uiStyles.value}>{selectedValue}</text>
              <text fg={uiStyles.muted}>⌄</text>
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
