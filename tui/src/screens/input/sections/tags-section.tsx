import { Badge } from "@opentui-ui/react/badge";

import { SectionCard } from "@/components/section-card";
import { SectionHeader } from "@/components/section-header";
import { uiStyles } from "@/components/ui-styles";
import { tagBadgeStyles } from "@/screens/input/styles";
import type { TagOption } from "@/screens/input/use-badges";

type Props = {
  hasResult: boolean;
  selectedCount: number;
  tags: TagOption[];
  isSelected: (id: string) => boolean;
  onToggle: (id: string) => void;
  width: number;
};

function TagBadge({ option, selected, onToggle }: { option: TagOption; selected: boolean; onToggle: (id: string) => void }) {
  return (
    <box key={option.id} onMouseDown={() => onToggle(option.id)}>
      <Badge label={selected ? `✓ ${option.label}` : option.label} styles={tagBadgeStyles(selected)} />
    </box>
  );
}

export function TagsSection({ hasResult, selectedCount, tags, isSelected, onToggle, width }: Props) {
  return (
    <SectionCard width={width} marginBottom={1}>
      <SectionHeader icon="⌂" title="TAGS" right={<text fg={uiStyles.muted}>{`${selectedCount} selected`}</text>} alignItems="flex-start" />

      {hasResult ? (
        <>
          <box flexDirection="row" gap={1}>
            {tags.slice(0, 4).map((tag) => (
              <TagBadge key={tag.id} option={tag} selected={isSelected(tag.id)} onToggle={onToggle} />
            ))}
          </box>
          <box flexDirection="row" gap={1}>
            {tags.slice(4).map((tag) => (
              <TagBadge key={tag.id} option={tag} selected={isSelected(tag.id)} onToggle={onToggle} />
            ))}
          </box>
        </>
      ) : (
        <text fg={uiStyles.label}>Tags appear after analysis</text>
      )}
    </SectionCard>
  );
}
