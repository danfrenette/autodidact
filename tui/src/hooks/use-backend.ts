import { useContext } from "react";
import { BackendContext } from "../providers/backend-provider.tsx";

export function useBackend() {
  const backend = useContext(BackendContext);
  if (!backend) {
    throw new Error("useBackend must be used within a BackendProvider");
  }

  return backend;
}
