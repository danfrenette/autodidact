import { setupSteps, setupStepTitles } from "@/screens/setup/wizard/types";

type Props = {
  activeIndex: number;
};

export function StepTabs({ activeIndex }: Props) {
  return (
    <box flexDirection="column" style={{ marginBottom: 1 }}>
      <text fg="#8d8d8d" style={{ marginBottom: 1 }}>Step {activeIndex + 1} of {setupSteps.length}</text>
      <box flexDirection="row" justifyContent="center">
        {setupSteps.map((step, index) => {
          const active = index === activeIndex;
          const completed = index < activeIndex;
          const color = active ? "#fab283" : completed ? "#88c0a8" : "#7a7a7a";

          return (
            <box key={step} flexDirection="row" alignItems="center">
              <text fg={color}>{completed ? "[✓]" : active ? "[●]" : "[ ]"}</text>
              <text fg={color} style={{ marginLeft: 1 }}>{setupStepTitles[step]}</text>
              {index < setupSteps.length - 1 && <text fg="#5a5a5a" style={{ marginLeft: 1, marginRight: 1 }}>→</text>}
            </box>
          );
        })}
      </box>
    </box>
  );
}
