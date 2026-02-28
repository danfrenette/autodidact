import type { ReactNode } from "react";

import { uiStyles } from "./ui-styles";

type Props = {
  width: number;
  marginTop?: number;
  marginBottom?: number;
  gap?: number;
  children: ReactNode;
};

export function SectionCard({ width, marginTop, marginBottom, gap = 1, children }: Props) {
  return (
    <box border borderColor={uiStyles.panelBorder} width={width} style={{ marginTop, marginBottom }}>
      <box flexDirection="column" paddingLeft={2} paddingRight={2} paddingTop={1} paddingBottom={1} backgroundColor={uiStyles.panelBackground} gap={gap}>
        {children}
      </box>
    </box>
  );
}
