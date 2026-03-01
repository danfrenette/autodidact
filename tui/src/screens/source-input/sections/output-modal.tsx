import type { AnalysisResult } from "@/requests/analyze-source";
import { modalStyles } from "@/screens/source-input/styles";

type Props = {
  visible: boolean;
  result: AnalysisResult | null;
  onClose: () => void;
};

function obsidianUri(notePath: string): string {
  return `obsidian://open?path=${encodeURIComponent(notePath)}`;
}

export function OutputModal({ visible, result, onClose }: Props) {
  if (!visible || !result || result.status !== "completed") {
    return null;
  }

  return (
    <box position="absolute" left={0} top={0} width="100%" height="100%" alignItems="center" justifyContent="center">
      <box border borderColor={modalStyles.border} width={84}>
        <box flexDirection="column" gap={1} paddingLeft={2} paddingRight={2} paddingTop={1} paddingBottom={1} backgroundColor={modalStyles.background}>
          <box flexDirection="row" justifyContent="space-between">
            <box flexDirection="row" gap={1}>
              <text fg={modalStyles.title}>●</text>
              <text fg={modalStyles.title}>OUTPUT</text>
            </box>
            <text fg={modalStyles.close} onMouseDown={onClose}>close</text>
          </box>
          <text fg={modalStyles.body}>Note created:</text>
          <text fg={modalStyles.path}><a href={obsidianUri(result.notePath)}>{result.notePath}</a></text>
          <text fg={modalStyles.hint}>Press Enter or Esc to close</text>
        </box>
      </box>
    </box>
  );
}
