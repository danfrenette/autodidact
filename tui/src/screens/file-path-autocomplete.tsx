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

  return (
    <box border borderColor="#484848" width={width} style={{ marginTop: 1 }}>
      <box flexDirection="column" backgroundColor="#161616" paddingLeft={1} paddingRight={1}>
        {state.status === "loading" && (
          <text fg="#808080">Searching supported files...</text>
        )}

        {state.status === "empty" && (
          <text fg="#808080">No matching supported files</text>
        )}

        {state.status === "open" && state.items.map((item, index) => (
          <box
            key={item}
            backgroundColor={index === state.selectedIndex ? "#fab283" : undefined}
            paddingLeft={1}
            paddingRight={1}
          >
            <text fg={index === state.selectedIndex ? "#1a1a1a" : "#d6d6d6"}>{item}</text>
          </box>
        ))}
      </box>
    </box>
  );
}
