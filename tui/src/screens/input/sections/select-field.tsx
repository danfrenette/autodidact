import { inputStyles } from "@/screens/input/styles";

type Props = {
  label: string;
  value: string;
};

export function SelectField({ label, value }: Props) {
  return (
    <box flexDirection="column" flexGrow={1}>
      <text fg={inputStyles.label}>{label}</text>
      <box border borderColor={inputStyles.fieldBorder} paddingLeft={1} paddingRight={1} backgroundColor={inputStyles.fieldBackground}>
        <box flexDirection="row" justifyContent="space-between" width="100%">
          <text fg={inputStyles.value}>{value}</text>
          <text fg={inputStyles.muted}>⌄</text>
        </box>
      </box>
    </box>
  );
}
