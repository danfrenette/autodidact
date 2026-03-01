import { SectionCard } from "@/components/section-card";
import { SectionHeader } from "@/components/section-header";
import { uiStyles } from "@/components/ui-styles";
import type { Chapter } from "@/requests/analyze-source";

type Props = {
  query: string;
  onInput: (value: string) => void;
  filteredChapters: Chapter[];
  totalCount: number;
  highlightedIndex: number;
  visibleChapters: Chapter[];
  windowStart: number;
  width: number;
};

export function ChapterSelectionSection({
  query,
  onInput,
  filteredChapters,
  totalCount,
  highlightedIndex,
  visibleChapters,
  windowStart,
  width,
}: Props) {
  const matchLabel = query.trim().length > 0
    ? `${filteredChapters.length}/${totalCount}`
    : `${totalCount}`;

  return (
    <SectionCard width={width} marginBottom={1} gap={0}>
      <SectionHeader
        icon="$"
        title="SELECT CHAPTER"
        right={<text fg={uiStyles.muted}>{matchLabel} chapters</text>}
      />

      <box
        border
        borderColor={uiStyles.fieldBorder}
        paddingLeft={1}
        paddingRight={1}
        backgroundColor={uiStyles.fieldBackground}
      >
        <input
          value={query}
          placeholder="Type to filter chapters..."
          onInput={onInput}
          focused
          textColor="#eeeeee"
          cursorColor="#eeeeee"
          focusedBackgroundColor={uiStyles.fieldBackground}
          backgroundColor={uiStyles.fieldBackground}
        />
      </box>

      <box flexDirection="column">
        {visibleChapters.map((chapter, visibleIndex) => {
          const absoluteIndex = windowStart + visibleIndex;
          const highlighted = absoluteIndex === highlightedIndex;

          return (
            <box
              key={chapter.id}
              flexDirection="row"
              justifyContent="space-between"
              paddingLeft={1}
              paddingRight={1}
              backgroundColor={highlighted ? uiStyles.comboboxRowHighlightBackground : undefined}
            >
              <text fg={highlighted ? uiStyles.comboboxRowHighlightText : uiStyles.comboboxRowText}>
                {highlighted ? "> " : "  "}{chapter.title}
              </text>
              <text fg={uiStyles.muted}>p.{chapter.page}</text>
            </box>
          );
        })}

        {filteredChapters.length === 0 && (
          <box paddingLeft={1} paddingRight={1}>
            <text fg={uiStyles.muted}>No matching chapters</text>
          </box>
        )}
      </box>

      <box flexDirection="row" justifyContent="center" style={{ marginTop: 1 }}>
        <text fg={uiStyles.muted}>Type to filter  |  Up/Down navigate  |  Enter select  |  Esc cancel</text>
      </box>
    </SectionCard>
  );
}
