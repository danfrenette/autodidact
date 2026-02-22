import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useOnboarding } from "./use-onboarding";
import type { OnboardingPersistedState } from "./types";

type OnboardingContextValue = ReturnType<typeof useOnboarding>;

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

type Props = {
  initialState: OnboardingPersistedState | null;
  saveState: (state: OnboardingPersistedState) => Promise<void>;
  children: ReactNode;
};

export function OnboardingProvider({ initialState, saveState, children }: Props) {
  const onboarding = useOnboarding({ initialState, saveState });
  return <OnboardingContext.Provider value={onboarding}>{children}</OnboardingContext.Provider>;
}

export function useOnboardingContext() {
  const value = useContext(OnboardingContext);
  if (!value) {
    throw new Error("useOnboardingContext must be used within OnboardingProvider");
  }

  return value;
}
