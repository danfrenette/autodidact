import { useMemo } from "react";

export type InputKind = "multiline" | "single_line";

export function detectInputKind(value: string): InputKind {
  return value.includes("\n") ? "multiline" : "single_line";
}

export function useInputKind(value: string) {
  return useMemo(() => detectInputKind(value), [value]);
}

