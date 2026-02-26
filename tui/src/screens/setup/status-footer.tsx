type Props = {
  error: string | null;
  saving: boolean;
};

export function SetupStatusFooter({ error, saving }: Props) {
  return (
    <>
      {error && (
        <text fg="red" style={{ marginTop: 1 }}>
          {error}
        </text>
      )}

      {saving && (
        <text fg="yellow" style={{ marginTop: 1 }}>
          Saving...
        </text>
      )}

      <text fg="#666666" style={{ marginTop: 1 }}>
        Tab to move focus, Enter to continue, Left/Backspace to go back, Esc to exit
      </text>
    </>
  );
}
