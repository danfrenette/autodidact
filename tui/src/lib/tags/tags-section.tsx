import { Badge } from "@opentui-ui/react/badge";

import { OptionsMenu } from "@/components/options-menu";
import { SectionCard } from "@/components/section-card";
import { SectionHeader } from "@/components/section-header";
import { uiStyles } from "@/components/ui-styles";

import { tagBadgeStyles } from "./styles";
import { extractCreateName, isCreateOption } from "./utils";

type Props = {
  selectedTags: string[];
  onRemove: (name: string) => void;
  query: string;
  filteredOptions: string[];
  highlightedIndex: number;
  isDropdownOpen: boolean;
  onInput: (value: string) => void;
  onSubmit: () => void;
  focused: boolean;
  width: number;
};

export function TagsSection({
  selectedTags,
  onRemove,
  query,
  filteredOptions,
  highlightedIndex,
  isDropdownOpen,
  onInput,
  onSubmit,
  focused,
  width,
}: Props) {
  const displayOptions = filteredOptions.map((o) =>
    isCreateOption(o) ? `Create "${extractCreateName(o)}"` : o,
  );

  return (
    <SectionCard width={width} marginBottom={1}>
      <SectionHeader
        icon="⌂"
        title="TAGS"
        right={<text fg={uiStyles.muted}>{`${selectedTags.length} selected`}</text>}
        alignItems="flex-start"
      />

      {selectedTags.length > 0 && (
        <box flexDirection="row" gap={1}>
          {selectedTags.map((tag) => (
            <box key={tag} onMouseDown={() => onRemove(tag)}>
              <Badge label={`x ${tag}`} styles={tagBadgeStyles(true)} />
            </box>
          ))}
        </box>
      )}

      <box
        border
        borderColor={focused ? uiStyles.comboboxMenuBorder : uiStyles.fieldBorder}
        paddingLeft={1}
        paddingRight={1}
      >
        <input
          value={query}
          placeholder="Search or create tags..."
          onInput={onInput}
          onSubmit={onSubmit}
          focused={focused}
        />
      </box>

      {isDropdownOpen && (
        <OptionsMenu
          items={displayOptions}
          highlightedIndex={highlightedIndex}
          showSelectionMarker={false}
        />
      )}
    </SectionCard>
  );
}
