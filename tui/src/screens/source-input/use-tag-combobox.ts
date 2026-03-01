import type { KeyEvent } from "@opentui/core";
import { useCallback, useMemo, useState } from "react";

import { useFuzzyList } from "@/hooks/use-fuzzy-list";

export const TAG_OPTIONS: string[] = [
  "chapter-review",
  "study-guide",
  "key-terms",
  "practice-quiz",
  "summary",
];

const createSentinel = (query: string) => `create:${query}`;
export const isCreateOption = (option: string) => option.startsWith("create:");
export const extractCreateName = (option: string) => option.slice("create:".length);

function normalizeTag(name: string): string {
  return name.trim().toLowerCase();
}

export function useTagCombobox() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const availableOptions = useMemo(
    () => TAG_OPTIONS.filter((t) => !selectedTags.includes(t)),
    [selectedTags],
  );

  const fuzzy = useFuzzyList({ items: availableOptions, active: tagsExpanded });

  const filteredOptions = useMemo(() => {
    const base = fuzzy.filtered;
    const trimmedQuery = fuzzy.query.trim();

    if (
      trimmedQuery.length > 0 &&
      !base.some((o) => o.toLowerCase() === trimmedQuery.toLowerCase())
    ) {
      return [...base, createSentinel(trimmedQuery)];
    }

    return base;
  }, [fuzzy.filtered, fuzzy.query]);

  const addTag = useCallback((name: string) => {
    const normalized = normalizeTag(name);
    if (!normalized) return;
    setSelectedTags((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
  }, []);

  const removeTag = useCallback((name: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== name));
  }, []);

  const openTags = useCallback(() => setTagsExpanded(true), []);

  const closeTags = useCallback(() => {
    setTagsExpanded(false);
    setIsDropdownOpen(false);
    fuzzy.reset();
  }, [fuzzy]);

  const handleInput = useCallback(
    (value: string) => {
      fuzzy.handleInput(value);
      setIsDropdownOpen(value.trim().length > 0);
    },
    [fuzzy],
  );

  const submitTag = useCallback((): boolean => {
    const highlighted = filteredOptions[fuzzy.highlightedIndex];

    if (highlighted) {
      const name = isCreateOption(highlighted) ? extractCreateName(highlighted) : highlighted;
      addTag(name);
      fuzzy.reset();
      setIsDropdownOpen(false);
      return true;
    }

    const rawQuery = normalizeTag(fuzzy.query);
    if (rawQuery) {
      addTag(rawQuery);
      fuzzy.reset();
      setIsDropdownOpen(false);
      return true;
    }

    return false;
  }, [filteredOptions, fuzzy, addTag]);

  const handleKey = useCallback(
    (key: KeyEvent): boolean => {
      if (!tagsExpanded) return false;

      if (key.name === "up") {
        fuzzy.moveUp();
        key.preventDefault();
        return true;
      }

      if (key.name === "down") {
        fuzzy.moveDown();
        key.preventDefault();
        return true;
      }

      if (key.name === "escape") {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
          fuzzy.reset();
          key.preventDefault();
          return true;
        }
        closeTags();
        key.preventDefault();
        return true;
      }

      return false;
    },
    [tagsExpanded, isDropdownOpen, fuzzy, closeTags],
  );

  return {
    selectedTags,
    addTag,
    removeTag,
    tagsExpanded,
    openTags,
    closeTags,
    query: fuzzy.query,
    filteredOptions,
    highlightedIndex: fuzzy.highlightedIndex,
    isDropdownOpen,
    handleInput,
    handleKey,
    submitTag,
  };
}
