import type { ReactNode } from "react";

import { inputStyles } from "@/screens/input/styles";

type Props = {
  width: number;
  marginTop?: number;
  marginBottom?: number;
  children: ReactNode;
  gap?: number;
};

export function SectionCard({ width, marginTop, marginBottom, children, gap = 1 }: Props) {
  return (
    <box border borderColor={inputStyles.panelBorder} width={width} style={{ marginTop, marginBottom }}>
      <box flexDirection="column" paddingLeft={2} paddingRight={2} paddingTop={1} paddingBottom={1} backgroundColor={inputStyles.panelBackground} gap={gap}>
        {children}
      </box>
    </box>
  );
}
