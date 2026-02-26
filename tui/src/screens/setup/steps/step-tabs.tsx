import { setupSteps, setupStepTitles } from "@/screens/setup/wizard/types";

type Props = {
  activeIndex: number;
};

export function StepTabs({ activeIndex }: Props) {
  return (
    <box flexDirection="row" justifyContent="center" style={{ marginBottom: 1, gap: 1 }}>
      {setupSteps.map((step, index) => {
        const active = index === activeIndex;
        const completed = index < activeIndex;

        return (
          <box
            key={step}
            border
            borderColor={active ? "#fab283" : "#666666"}
            style={{ paddingLeft: 1, paddingRight: 1 }}
          >
            <text fg={active ? "#fab283" : completed ? "#88c0a8" : "#999999"}>
              {completed ? "✓" : active ? "●" : "○"} {setupStepTitles[step]}
            </text>
          </box>
        );
      })}
    </box>
  );
}
