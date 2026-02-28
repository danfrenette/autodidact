import { OptionsMenu } from "@/components/options-menu";
import type { FilePathAutocompleteState } from "@/hooks/use-file-path-autocomplete";

type Props = {
  visible: boolean;
  state: FilePathAutocompleteState;
  width?: number;
};

export function FilePathAutocomplete({ visible, state, width = 70 }: Props) {
  if (!visible) {
    return null;
  }

  if (state.status === "loading") {
    return (
      <box width={width}>
        <OptionsMenu
          items={[]}
          highlightedIndex={-1}
          showSelectionMarker={false}
          emptyMessage="Searching files..."
          maxItems={6}
        />
      </box>
    );
  }

  if (state.status === "empty") {
    return (
      <box width={width}>
        <OptionsMenu
          items={[]}
          highlightedIndex={-1}
          showSelectionMarker={false}
          emptyMessage="No matching files"
          maxItems={6}
        />
      </box>
    );
  }

  if (state.status !== "open") {
    return null;
  }

  return (
    <box width={width}>
      <OptionsMenu
        items={state.items}
        highlightedIndex={state.selectedIndex}
        showSelectionMarker={false}
        maxItems={6}
      />
    </box>
  );
}
