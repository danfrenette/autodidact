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
    <box border title={title} style={{ width: 80, height: 3, marginBottom: 1 }}>
      <input
        placeholder={placeholder}
        value={value}
        onInput={onInput}
        onSubmit={onSubmit}
        focused={focused}
      />
    </box>
  );
}

type SetupComboboxFieldProps = {
  title: string;
  value: string;
  placeholder: string;
  options: string[];
  highlightedIndex: number;
  isOpen: boolean;
  focused: boolean;
  onInput: (value: string) => void;
  onSubmit: () => void;
};

export function SetupComboboxField({
  title,
  value,
  placeholder,
  options,
  highlightedIndex,
  isOpen,
  focused,
  onInput,
  onSubmit,
}: SetupComboboxFieldProps) {
  const visibleOptions = options.slice(0, 5);

  return (
    <box border title={title} style={{ width: 80, height: 9, marginBottom: 1 }}>
      <box flexDirection="column" flexGrow={1}>
        <input
          value={value}
          placeholder={placeholder}
          onInput={onInput}
          onSubmit={onSubmit}
          focused={focused}
        />

        {isOpen && (
          <box flexDirection="column" style={{ marginTop: 1 }}>
            {visibleOptions.length === 0 && <text fg="#808080">No matches</text>}

            {visibleOptions.map((option, index) => (
              <box key={option} backgroundColor={index === highlightedIndex ? "#fab283" : undefined}>
                <text fg={index === highlightedIndex ? "#1a1a1a" : "#d6d6d6"}>{option}</text>
              </box>
            ))}
          </box>
        )}
      </box>
    </box>
  );
}
