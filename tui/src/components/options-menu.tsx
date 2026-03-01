import { getWindowSlice } from "@/hooks/use-windowed-list";

import { uiStyles } from "./ui-styles";

type Props = {
  items: string[];
  highlightedIndex: number;
  selectedValue?: string;
  showSelectionMarker?: boolean;
  emptyMessage?: string;
  maxItems?: number;
};

export function OptionsMenu({
  items,
  highlightedIndex,
  selectedValue,
  showSelectionMarker = true,
  emptyMessage = "No matches",
  maxItems = 5,
}: Props) {
  const { start, end } = getWindowSlice(items.length, highlightedIndex, maxItems);
  const visibleItems = items.slice(start, end);

  return (
    <box
      border
      borderColor={uiStyles.comboboxMenuBorder}
      backgroundColor={uiStyles.comboboxMenuBackground}
      flexDirection="column"
    >
      {visibleItems.length === 0 && (
        <box paddingLeft={1} paddingRight={1}>
          <text fg={uiStyles.muted}>{emptyMessage}</text>
        </box>
      )}

      {visibleItems.map((item, visibleIndex) => {
        const absoluteIndex = start + visibleIndex;
        const highlighted = absoluteIndex === highlightedIndex;
        const selected = selectedValue === item;

        return (
          <box
            key={item}
            flexDirection="row"
            justifyContent="space-between"
            paddingLeft={1}
            paddingRight={1}
            backgroundColor={highlighted ? uiStyles.comboboxRowHighlightBackground : undefined}
          >
            <text fg={highlighted ? uiStyles.comboboxRowHighlightText : uiStyles.comboboxRowText}>{item}</text>
            {showSelectionMarker && (
              <text fg={selected ? uiStyles.comboboxRowHighlightMarker : uiStyles.muted}>{selected ? "●" : " "}</text>
            )}
          </box>
        );
      })}
    </box>
  );
}
