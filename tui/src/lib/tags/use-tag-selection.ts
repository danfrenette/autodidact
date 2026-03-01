import { useCallback, useState } from "react";

import { normalizeTag } from "./utils";

export function useTagSelection() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const addTag = useCallback((name: string) => {
    const normalized = normalizeTag(name);
    if (!normalized) return;
    setSelectedTags((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
  }, []);

  const removeTag = useCallback((name: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== name));
  }, []);

  const clearTags = useCallback(() => setSelectedTags([]), []);

  return { selectedTags, addTag, removeTag, clearTags };
}
