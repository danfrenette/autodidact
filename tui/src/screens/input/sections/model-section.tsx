import { SectionCard } from "@/components/section-card";
import { SectionHeader } from "@/components/section-header";
import { uiStyles } from "@/components/ui-styles";

import { SelectField } from "./select-field";

type Props = {
  model: string;
  provider: string;
  width: number;
};

export function ModelSection({ model, provider, width }: Props) {
  return (
    <SectionCard width={width} marginTop={1} marginBottom={1}>
      <SectionHeader icon="◌" title="MODEL" right={<text fg={uiStyles.muted}>{`${model} / ${provider} ⌄`}</text>} alignItems="flex-start" />

      <box flexDirection="row" gap={2}>
        <SelectField label="MODEL" value={model} />
        <SelectField label="PROVIDER" value={provider} />
      </box>
    </SectionCard>
  );
}
