import { SetupTextInputField } from "@/screens/setup/fields";

type Props = {
  value: string;
  focused: boolean;
  onInput: (value: string) => void;
  onSubmit: () => void;
};

export function VaultStep({ value, focused, onInput, onSubmit }: Props) {
  return (
    <SetupTextInputField
      title="Obsidian vault path"
      placeholder="/path/to/vault"
      value={value}
      onInput={onInput}
      onSubmit={onSubmit}
      focused={focused}
    />
  );
}
