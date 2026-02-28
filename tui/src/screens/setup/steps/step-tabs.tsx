import { setupSteps, setupStepTitles } from "@/screens/setup/wizard/types";

type Props = {
  activeIndex: number;
};

export function StepTabs({ activeIndex }: Props) {
  return (
    <box flexDirection="column" style={{ marginBottom: 1 }}>
      <box flexDirection="row">
        {setupSteps.map((step, index) => {
          const active = index === activeIndex;
          const completed = index < activeIndex;
          const borderColor = active ? "#63d389" : completed ? "#2f6b45" : "#2a323f";
          const titleColor = active ? "#e6e9f0" : completed ? "#77d18a" : "#6f7887";
          const markerColor = active ? "#63d389" : completed ? "#77d18a" : "#6f7887";

          return (
            <box key={step} flexDirection="row" alignItems="center">
              <box border borderColor={borderColor} paddingLeft={1} paddingRight={1} backgroundColor={active ? "#0f1a12" : "#0d1117"} flexDirection="row" gap={1}>
                <text fg={markerColor}>{completed ? "✓" : active ? "●" : " "}</text>
                <text fg={titleColor}>{setupStepTitles[step]}</text>
              </box>
              {index < setupSteps.length - 1 && (
                <text fg="#2a323f"> → </text>
              )}
            </box>
          );
        })}
      </box>
    </box>
  );
}
