import { createContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { Backend } from "../backend.ts";

export const BackendContext = createContext<Backend | null>(null);

type Props = {
  children: ReactNode;
};

export function BackendProvider({ children }: Props) {
  const backend = useMemo(() => new Backend(), []);

  useEffect(() => {
    return () => {
      void backend.shutdown();
    };
  }, [backend]);

  return <BackendContext.Provider value={backend}>{children}</BackendContext.Provider>;
}
