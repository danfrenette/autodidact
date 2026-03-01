import { uiStyles } from "@/components/ui-styles";

type Props = {
  label: string;
  value: string;
};

export function SelectField({ label, value }: Props) {
  return (
    <box flexDirection="column" flexGrow={1}>
      <text fg={uiStyles.label}>{label}</text>
      <box border borderColor={uiStyles.fieldBorder} paddingLeft={1} paddingRight={1} backgroundColor={uiStyles.fieldBackground}>
        <box flexDirection="row" justifyContent="space-between" width="100%">
          <text fg={uiStyles.value}>{value}</text>
          <text fg={uiStyles.muted}>⌄</text>
        </box>
      </box>
    </box>
  );
}
