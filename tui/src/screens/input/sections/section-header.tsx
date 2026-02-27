import type { ReactNode } from "react";

import { inputStyles } from "@/screens/input/styles";

type Props = {
  icon: string;
  title: string;
  right?: ReactNode;
  alignItems?: "center" | "flex-start" | "flex-end" | "stretch";
};

export function SectionHeader({ icon, title, right, alignItems = "center" }: Props) {
  return (
    <box flexDirection="row" justifyContent="space-between" alignItems={alignItems}>
      <box flexDirection="row" gap={1}>
        <text fg={inputStyles.icon}>{icon}</text>
        <text fg={inputStyles.title}>{title}</text>
      </box>
      {right ?? null}
    </box>
  );
}
