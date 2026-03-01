import { useCallback, useMemo, useState } from "react";

export type InputKind = "file_path" | "url" | "raw_text" | "unknown";

export type BadgeView = {
  label: string;
  supported: boolean;
};

export type TagOption = {
  id: string;
  label: string;
};

export const TAG_OPTIONS: TagOption[] = [
  { id: "chapter-review", label: "chapter-review" },
  { id: "study-guide", label: "study-guide" },
  { id: "key-terms", label: "key-terms" },
  { id: "practice-quiz", label: "practice-quiz" },
  { id: "summary", label: "summary" },
];

const SUPPORTED_FILE_EXTENSIONS = new Set([".txt", ".md", ".pdf", ".rst"]);

const URL_PATTERN = /^https?:\/\//i;
const PATH_PATTERN = /[/\\]|\.[a-z0-9]{1,5}$/i;
export function detectInputKind(value: string): InputKind {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "unknown";
  if (URL_PATTERN.test(trimmed)) return "url";
  if (PATH_PATTERN.test(trimmed)) return "file_path";

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
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(() => new Set(["study-guide"]));

  const inputBadge = useMemo(() => detectedInputBadge(value), [value]);

  const selectedCount = selectedTagIds.size;

  const toggleTag = useCallback((tagId: string) => {
    setSelectedTagIds((previous) => {
      const next = new Set(previous);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  }, []);

  const isSelected = useCallback((tagId: string) => selectedTagIds.has(tagId), [selectedTagIds]);

  return {
    inputBadge,
    selectedCount,
    toggleTag,
    isSelected,
    tags: TAG_OPTIONS,
  };
}
