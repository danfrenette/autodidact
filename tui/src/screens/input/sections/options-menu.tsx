import { inputStyles } from "@/screens/input/styles";

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
  const visibleItems = items.slice(0, maxItems);

  return (
    <box
      border
      borderColor={inputStyles.comboboxMenuBorder}
      backgroundColor={inputStyles.comboboxMenuBackground}
      flexDirection="column"

    >
      {visibleItems.length === 0 && (
        <box paddingLeft={1} paddingRight={1}>
          <text fg={inputStyles.muted}>{emptyMessage}</text>
        </box>
      )}

      {visibleItems.map((item, index) => {
        const highlighted = index === highlightedIndex;
        const selected = selectedValue === item;

        return (
          <box
            key={item}
            flexDirection="row"
            justifyContent="space-between"
            paddingLeft={1}
            paddingRight={1}
            backgroundColor={highlighted ? inputStyles.comboboxRowHighlightBackground : undefined}
          >
            <text fg={highlighted ? inputStyles.comboboxRowHighlightText : inputStyles.comboboxRowText}>{item}</text>
            {showSelectionMarker && (
              <text fg={selected ? inputStyles.comboboxRowHighlightMarker : inputStyles.muted}>{selected ? "●" : " "}</text>
            )}
          </box>
        );
      })}
    </box>
  );
}
