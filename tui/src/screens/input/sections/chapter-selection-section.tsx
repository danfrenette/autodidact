import { SectionCard } from "@/components/section-card";
import { SectionHeader } from "@/components/section-header";
import { uiStyles } from "@/components/ui-styles";
import type { Chapter } from "@/requests/analyze-source";

type Props = {
  chapters: Chapter[];
  selectedIndex: number;
  width: number;
  maxVisible?: number;
};

export function ChapterSelectionSection({
  chapters,
  selectedIndex,
  width,
  maxVisible = 12,
}: Props) {
  const total = chapters.length;

  const halfWindow = Math.floor(maxVisible / 2);
  let start: number;

  if (total <= maxVisible) {
    start = 0;
  } else if (selectedIndex <= halfWindow) {
    start = 0;
  } else if (selectedIndex >= total - halfWindow) {
    start = total - maxVisible;
  } else {
    start = selectedIndex - halfWindow;
  }

  const visibleChapters = chapters.slice(start, start + maxVisible);

  return (
    <SectionCard width={width} marginBottom={1} gap={0}>
      <SectionHeader
        icon="$"
        title="SELECT CHAPTER"
        right={<text fg={uiStyles.muted}>{selectedIndex + 1}/{total}</text>}
      />

      <box flexDirection="column">
        {visibleChapters.map((chapter, visibleIndex) => {
          const absoluteIndex = start + visibleIndex;
          const highlighted = absoluteIndex === selectedIndex;

          return (
            <box
              key={`${chapter.id}-${chapter.title}-${chapter.page}`}
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
      </box>

      <box flexDirection="row" justifyContent="center" style={{ marginTop: 1 }}>
        <text fg={uiStyles.muted}>Up/Down navigate  |  Enter select  |  Esc cancel</text>
      </box>
    </SectionCard>
  );
}
