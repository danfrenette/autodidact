import { SetupTextInputField } from "@/screens/setup/fields";

type Props = {
  value: string;
  focused: boolean;
  onInput: (value: string) => void;
  onSubmit: () => void;
};

export function AccessTokenStep({ value, focused, onInput, onSubmit }: Props) {
  return (
    <SetupTextInputField
      title="Access token"
      placeholder="sk-..."
      value={value}
      onInput={onInput}
      onSubmit={onSubmit}
      focused={focused}
    />
  );
}
