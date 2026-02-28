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
      <box border borderColor="#2a323f" backgroundColor="#0d1117" style={{ width: 80, marginBottom: 1 }}>
        <box flexDirection="column" paddingLeft={1} paddingRight={1} gap={0}>
          <text fg="#6f7887">REVIEW</text>
          <text fg="#8f97a5">{`Vault     ${vaultPath || "(not set)"}`}</text>
          <text fg="#8f97a5">{`Provider  ${provider}  ·  ${modelId}`}</text>
        </box>
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
