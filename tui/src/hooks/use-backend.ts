import { useContext } from "react";

import { BackendContext } from "@/providers/backend-provider.tsx";

export function useBackend() {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error("useBackend must be used within a BackendProvider");
  }

  return context;
}
