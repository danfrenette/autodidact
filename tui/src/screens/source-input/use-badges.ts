import { useMemo } from "react";

export type InputKind = "file_path" | "url" | "raw_text" | "unknown";

export type BadgeView = {
  label: string;
  supported: boolean;
};

const SUPPORTED_FILE_EXTENSIONS = new Set([".txt", ".md", ".pdf", ".rst"]);

const URL_PATTERN = /^https?:\/\//i;
const PATH_PATTERN = /[/\\]|\.[a-z0-9]{1,5}$/i;
const AT_QUERY_PATTERN = /^@/;

export function detectInputKind(value: string): InputKind {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "unknown";
  if (URL_PATTERN.test(trimmed)) return "url";
  if (PATH_PATTERN.test(trimmed)) return "file_path";
  if (AT_QUERY_PATTERN.test(trimmed)) return "file_path";

  return "raw_text";
}

export function detectedInputBadge(value: string): BadgeView | null {
  const kind = detectInputKind(value);
  const trimmed = value.trim().toLowerCase();

  if (kind === "url") {
    return { label: "url", supported: true };
  }

  if (kind === "raw_text") {
    return { label: "raw-text", supported: true };
  }

  if (kind === "file_path") {
    const extension = trimmed.match(/\.[a-z0-9]+$/)?.[0] ?? "path";
    return {
      label: extension,
      supported: SUPPORTED_FILE_EXTENSIONS.has(extension),
    };
  }

  return null;
}

export function useInputBadges(value: string) {
  const inputBadge = useMemo(() => detectedInputBadge(value), [value]);
  const inputKind = useMemo(() => detectInputKind(value), [value]);

  return { inputBadge, inputKind };
}

