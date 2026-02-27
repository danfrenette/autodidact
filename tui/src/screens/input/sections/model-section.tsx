import { inputStyles } from "@/screens/input/styles";

import { SectionCard } from "./section-card";
import { SectionHeader } from "./section-header";
import { SelectField } from "./select-field";

type Props = {
  model: string;
  provider: string;
  width: number;
};

export function ModelSection({ model, provider, width }: Props) {
  return (
    <SectionCard width={width} marginTop={1} marginBottom={1}>
      <SectionHeader icon="◌" title="MODEL" right={<text fg={inputStyles.muted}>{`${model} / ${provider} ⌄`}</text>} alignItems="flex-start" />

      <box flexDirection="row" gap={2}>
        <SelectField label="MODEL" value={model} />
        <SelectField label="PROVIDER" value={provider} />
      </box>
    </SectionCard>
  );
}
