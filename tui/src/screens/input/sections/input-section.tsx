import { Badge } from "@opentui-ui/react/badge";

import { inputBadgeStyles, inputStyles } from "@/screens/input/styles";

import { SectionCard } from "./section-card";
import { SectionHeader } from "./section-header";

type Props = {
  value: string;
  submitting: boolean;
  onInput: (value: string) => void;
  onSubmit: () => void;
  badgeLabel: string;
  badgeSupported: boolean;
  width: number;
};

export function InputSection({ value, submitting, onInput, onSubmit, badgeLabel, badgeSupported, width }: Props) {
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
    </SectionCard>
  );
}
