type Props = {
  visible: boolean;
  width?: number;
};

export function OnboardingFirstRun({ visible, width = 70 }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <box
      border
      borderColor="#3a3a3a"
      width={width}
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      paddingBottom={1}
      style={{ marginBottom: 1 }}
    >
      <box flexDirection="column" gap={1}>
        <text fg="#eeeeee">Welcome to autodidact</text>
        <text fg="#b5b5b5">Type a file path and press Enter to generate a note.</text>
        <text fg="#9a9a9a">Use @ to autocomplete files. Press ? for help. Use Ctrl+C to cancel or clear.</text>
      </box>
    </box>
  );
}
