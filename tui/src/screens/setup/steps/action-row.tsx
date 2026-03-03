import type { SetupStep } from "@/screens/setup/wizard/types";

type Props = {
  step: SetupStep;
};

export function ActionRow({ step }: Props) {
  const primary = step === "embedding" ? "Enter save" : "Enter continue";
  const secondary = step === "chat" ? "Type filter" : "Tab focus";

  return (
    <box flexDirection="row" justifyContent="center" style={{ marginTop: 1 }}>
      <text fg="#8d8d8d">[{primary}]</text>
      <text fg="#5f5f5f" style={{ marginLeft: 1, marginRight: 1 }}>•</text>
      <text fg="#8d8d8d">[{secondary}]</text>
      <text fg="#5f5f5f" style={{ marginLeft: 1, marginRight: 1 }}>•</text>
      <text fg="#8d8d8d">[← back]</text>
      <text fg="#5f5f5f" style={{ marginLeft: 1, marginRight: 1 }}>•</text>
      <text fg="#8d8d8d">[esc exit]</text>
    </box>
  );
}
