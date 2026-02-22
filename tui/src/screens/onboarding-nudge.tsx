type Props = {
  visible: boolean;
  width?: number;
  title: string;
  message: string;
  onDismissSession: () => void;
  onDismissForever: () => void;
};

export function OnboardingNudge({
  visible,
  width = 70,
  title,
  message,
  onDismissSession,
  onDismissForever,
}: Props) {
  if (!visible) {
    return null;
  }

  return (
    <box
      border
      borderColor="#313131"
      width={width}
      paddingLeft={1}
      paddingRight={1}
      style={{ marginTop: 1 }}
    >
      <box flexDirection="row" justifyContent="space-between" width="100%">
        <box flexDirection="column" flexGrow={1}>
          <text fg="#eeeeee">{title}</text>
          <text fg="#9a9a9a">{message}</text>
        </box>
        <box flexDirection="row" gap={2}>
          <text fg="#7f7f7f" onMouseDown={onDismissSession}>later</text>
          <text fg="#7f7f7f" onMouseDown={onDismissForever}>hide</text>
        </box>
      </box>
    </box>
  );
}
