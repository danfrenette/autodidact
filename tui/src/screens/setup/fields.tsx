import { OptionsMenu } from "@/components/options-menu";

type SetupTextInputFieldProps = {
  title: string;
  placeholder: string;
  value: string;
  focused: boolean;
  onInput: (value: string) => void;
  onSubmit: () => void;
};

export function SetupTextInputField({
  title,
  placeholder,
  value,
  focused,
  onInput,
  onSubmit,
}: SetupTextInputFieldProps) {
  return (
    <box flexDirection="column" style={{ marginBottom: 1 }}>
      <text fg="#6f7887">{title.toUpperCase()}</text>
      <box border borderColor="#27303c" paddingLeft={1} paddingRight={1} backgroundColor="#0d1117" style={{ width: 80 }}>
        <input
          placeholder={placeholder}
          value={value}
          onInput={onInput}
          onSubmit={onSubmit}
          focused={focused}
          textColor="#eeeeee"
          cursorColor="#eeeeee"
          focusedBackgroundColor="#0d1117"
          backgroundColor="#0d1117"
        />
      </box>
    </box>
  );
}

type SetupComboboxFieldProps = {
  title: string;
  query: string;
  selectedValue: string;
  options: string[];
  highlightedIndex: number;
  isOpen: boolean;
  focused: boolean;
  onInput: (value: string) => void;
  onSubmit: () => void;
};

export function SetupComboboxField({
  title,
  query,
  selectedValue,
  options,
  highlightedIndex,
  isOpen,
  focused,
  onInput,
  onSubmit,
}: SetupComboboxFieldProps) {
  return (
    <box flexDirection="column" style={{ marginBottom: 1 }}>
      <text fg="#6f7887">{title.toUpperCase()}</text>
      <box
        border
        borderColor={focused ? "#2c3744" : "#27303c"}
        paddingLeft={1}
        paddingRight={1}
        backgroundColor="#0d1117"
        style={{ width: 80 }}
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
              focusedBackgroundColor="#0d1117"
              backgroundColor="#0d1117"
            />
          )
          : <text fg="#d9deea">{selectedValue}</text>}
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
