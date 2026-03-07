import { useCallback, useEffect, useRef, useState } from "react";

import { useBackend } from "@/hooks/use-backend.ts";
import type { InputType } from "@/requests/detect-input-type/index.ts";

const DEBOUNCE_MS = 150;

const SUPPORTED_FILE_EXTENSIONS = new Set([".txt", ".md", ".pdf", ".rst"]);

export type BadgeView = {
  label: string;
  supported: boolean;
};

function badgeFromInputType(inputType: InputType, input: string): BadgeView {
  if (inputType === "url") return { label: "url", supported: true };
  if (inputType === "raw_text") return { label: "raw-text", supported: true };

  const extension = input.trim().toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? "path";
  return {
    label: extension,
    supported: SUPPORTED_FILE_EXTENSIONS.has(extension),
  };
}

export function useInputBadge(value: string) {
  const { detectInputType } = useBackend();
  const [badge, setBadge] = useState<BadgeView | null>(null);
  const latestValue = useRef(value);
  latestValue.current = value;

  const detect = useCallback(
    async (input: string) => {
      try {
        const inputType = await detectInputType(input);
        if (latestValue.current === input) {
          setBadge(badgeFromInputType(inputType, input));
        }
      } catch {
        // backend unavailable — leave badge as-is
      }
    },
    [detectInputType],
  );

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      setBadge(null);
      return;
    }

    const timer = setTimeout(() => detect(trimmed), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, detect]);

  return badge;
}
