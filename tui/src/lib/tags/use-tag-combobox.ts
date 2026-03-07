import type { KeyEvent } from "@opentui/core";
import { useCallback, useMemo, useState } from "react";

import { useFuzzyList } from "@/hooks/use-fuzzy-list";

import { useTagSelection } from "./use-tag-selection";
import {
  appendCreateOption,
  extractCreateName,
  isCreateOption,
} from "./utils";

export function useTagCombobox(availableTags: string[]) {
  const { selectedTags, addTag, removeTag, clearTags } = useTagSelection();
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const availableOptions = useMemo(
    () => availableTags.filter((t) => !selectedTags.includes(t)),
    [availableTags, selectedTags],
  );

  const fuzzy = useFuzzyList({ items: availableOptions, active: tagsExpanded });

  const filteredOptions = useMemo(
    () => appendCreateOption(fuzzy.filtered, fuzzy.query),
    [fuzzy.filtered, fuzzy.query],
  );

  const openTags = useCallback(() => setTagsExpanded(true), []);

  const closeTags = useCallback(() => {
    setTagsExpanded(false);
    setIsDropdownOpen(false);
    fuzzy.reset();
  }, [fuzzy.reset]);

  const handleInput = useCallback(
    (value: string) => {
      fuzzy.handleInput(value);
      setIsDropdownOpen(value.trim().length > 0);
    },
    [fuzzy.handleInput],
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

    const trimmedQuery = fuzzy.query.trim();
    if (trimmedQuery) {
      addTag(trimmedQuery);
      fuzzy.reset();
      setIsDropdownOpen(false);
      return true;
    }

    return false;
  }, [filteredOptions, fuzzy.highlightedIndex, fuzzy.query, fuzzy.reset, addTag]);

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
    [tagsExpanded, isDropdownOpen, fuzzy.moveUp, fuzzy.moveDown, fuzzy.reset, closeTags],
  );

  return {
    selectedTags,
    addTag,
    removeTag,
    clearTags,
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
