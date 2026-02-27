import { Badge } from "@opentui-ui/react/badge";

import { inputBadgeStyles, inputStyles } from "@/screens/input/styles";

import { SectionCard } from "./section-card";
import { SectionHeader } from "./section-header";
import { SelectField } from "./select-field";

type Props = {
  value: string;
  submitting: boolean;
  onInput: (value: string) => void;
  onSubmit: () => void;
  badgeLabel: string;
  badgeSupported: boolean;
  model: string;
  provider: string;
  modelPickerExpanded: boolean;
  onModelPickerPress: () => void;
  width: number;
};

export function InputSection({
  value,
  submitting,
  onInput,
  onSubmit,
  badgeLabel,
  badgeSupported,
  model,
  provider,
  modelPickerExpanded,
  onModelPickerPress,
  width,
}: Props) {

  return (
    <SectionCard width={width} marginBottom={1}>
      <SectionHeader icon="↥" title="INPUT" right={<Badge label={badgeLabel} styles={inputBadgeStyles(badgeSupported)} />} />

      <box border borderColor={inputStyles.fieldBorder} paddingLeft={1} paddingRight={1} backgroundColor={inputStyles.fieldBackground}>
        <input
          value={value}
          placeholder={'Enter a file path or input text... "./notes/chapter.txt"'}
          onInput={onInput}
          onSubmit={onSubmit}
          focused={!submitting}
          textColor="#eeeeee"
          cursorColor="#eeeeee"
          focusedBackgroundColor={inputStyles.fieldBackground}
          backgroundColor={inputStyles.fieldBackground}
        />
      </box>

      <box flexDirection="row" alignItems="center" gap={1}>
        <text fg={inputStyles.muted} onMouseDown={onModelPickerPress}>{model}</text>
        <text fg={inputStyles.label}>/</text>
        <text fg={inputStyles.muted} onMouseDown={onModelPickerPress}>{provider}</text>
        <text fg={inputStyles.muted} onMouseDown={onModelPickerPress}>{modelPickerExpanded ? "⌃" : "⌄"}</text>
      </box>

      {modelPickerExpanded && (
        <box flexDirection="row" gap={2}>
          <SelectField label="MODEL" value={model} />
          <SelectField label="PROVIDER" value={provider} />
        </box>
      )}
    </SectionCard>
  );
}
