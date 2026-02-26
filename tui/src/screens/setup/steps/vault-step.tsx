import { SetupTextInputField } from "@/screens/setup/fields";

type Props = {
  value: string;
  focused: boolean;
  onInput: (value: string) => void;
  onSubmit: () => void;
};

export function VaultStep({ value, focused, onInput, onSubmit }: Props) {
  return (
    <box flexDirection="column">
      <text fg="#a5a5a5" style={{ marginBottom: 1 }}>Point Autodidact to your Obsidian vault to continue.</text>
      <SetupTextInputField
        title="Obsidian vault path"
        placeholder="/path/to/vault"
        value={value}
        onInput={onInput}
        onSubmit={onSubmit}
        focused={focused}
      />
    </box>
  );
}
