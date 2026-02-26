import { SetupTextInputField } from "@/screens/setup/fields";

type Props = {
  value: string;
  provider: string;
  modelId: string;
  vaultPath: string;
  focused: boolean;
  onInput: (value: string) => void;
  onSubmit: () => void;
};

export function AccessTokenStep({ value, provider, modelId, vaultPath, focused, onInput, onSubmit }: Props) {
  return (
    <box flexDirection="column" style={{ width: 80 }}>
      <box border title="Review" style={{ width: 80, height: 5, marginBottom: 1 }}>
        <text fg="#a5a5a5">{`Vault: ${vaultPath || "(not set)"}`}</text>
        <text fg="#a5a5a5">{`Provider: ${provider}  Model: ${modelId}`}</text>
      </box>

      <SetupTextInputField
        title="Access token"
        placeholder="sk-..."
        value={value}
        onInput={onInput}
        onSubmit={onSubmit}
        focused={focused}
      />
    </box>
  );
}
