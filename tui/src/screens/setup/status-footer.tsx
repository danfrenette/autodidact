type Props = {
  error: string | null;
  saving: boolean;
};

export function SetupStatusFooter({ error, saving }: Props) {
  return (
    <>
      {error && (
        <text fg="#ff7f7f" style={{ marginTop: 1 }}>
          {error}
        </text>
      )}

      {saving && (
        <text fg="#f4d35e" style={{ marginTop: 1 }}>
          Saving setup...
        </text>
      )}
    </>
  );
}
