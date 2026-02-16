import { useState, useCallback } from "react";
import { useKeyboard } from "@opentui/react";
import type { SetupPrefill } from "../providers/backend-provider.tsx";
import type { ConfigParams } from "../requests/update-config/index.ts";

type Props = {
  prefill: SetupPrefill;
  saving: boolean;
  error: string | null;
  onSubmit: (params: ConfigParams) => void;
};

const FIELDS = ["databaseUrl", "obsidianVaultPath", "openaiAccessToken", "openaiModel"] as const;

type FieldName = (typeof FIELDS)[number];

const LABELS: Record<FieldName, string> = {
  databaseUrl: "Database URL",
  obsidianVaultPath: "Obsidian vault path",
  openaiAccessToken: "OpenAI access token",
  openaiModel: "OpenAI model",
};

export function Setup({ prefill, saving, error, onSubmit }: Props) {
  const [values, setValues] = useState<Record<FieldName, string>>({
    databaseUrl: prefill.databaseUrl ?? "",
    obsidianVaultPath: prefill.obsidianVaultPath ?? "",
    openaiAccessToken: prefill.openaiAccessToken ?? "",
    openaiModel: prefill.openaiModel ?? "gpt-4o-mini",
  });
  const [focusIndex, setFocusIndex] = useState(0);

  const handleFieldChange = useCallback((field: FieldName, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit({
      databaseUrl: values.databaseUrl,
      obsidianVaultPath: values.obsidianVaultPath,
      openaiAccessToken: values.openaiAccessToken,
      openaiModel: values.openaiModel,
    });
  }, [values, onSubmit]);

  useKeyboard((key) => {
    if (key.name === "tab") {
      setFocusIndex((prev) => (prev + 1) % FIELDS.length);
    }
  });

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
      <text style={{ marginBottom: 1 }}>Autodidact Setup</text>

      {FIELDS.map((field, index) => (
        <box key={field} border title={LABELS[field]} style={{ width: 60, height: 3, marginBottom: 1 }}>
          <input
            placeholder={LABELS[field]}
            value={values[field]}
            onInput={(v) => handleFieldChange(field, v)}
            onSubmit={index === FIELDS.length - 1 ? handleSubmit : () => setFocusIndex(index + 1)}
            focused={focusIndex === index}
          />
        </box>
      ))}

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
        Tab to move between fields, Enter to submit
      </text>
    </box>
  );
}
