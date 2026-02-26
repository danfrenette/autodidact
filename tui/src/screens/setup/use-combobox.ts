import type { KeyEvent } from "@opentui/core";
import fuzzysort from "fuzzysort";
import { useCallback, useEffect, useMemo, useState } from "react";

type CommitReason = "enter" | "tab";

type Params = {
  options: string[];
  selectedValue: string;
  focused: boolean;
  onCommit: (value: string, reason: CommitReason) => void;
};

export function useCombobox({ options, selectedValue, focused, onCommit }: Params) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length === 0) {
      return options;
    }

const results = fuzzysort.go(normalizedQuery, options, { limit: options.length });
return results.map((result) => result.target);
  }, [options, query]);

  useEffect(() => {
    if (!focused) {
      setIsOpen(false);
      setQuery("");
      setHighlightedIndex(0);
    }
  }, [focused]);

  const moveUp = useCallback(() => {
    setHighlightedIndex((current) => {
      if (filteredOptions.length === 0) {
        return 0;
      }

      return current === 0 ? filteredOptions.length - 1 : current - 1;
    });
  }, [filteredOptions]);

  const moveDown = useCallback(() => {
    setHighlightedIndex((current) => {
      if (filteredOptions.length === 0) {
        return 0;
      }

      return (current + 1) % filteredOptions.length;
    });
  }, [filteredOptions]);

  const commit = useCallback((reason: CommitReason) => {
    if (filteredOptions.length === 0) {
      return false;
    }

    const safeIndex = highlightedIndex >= filteredOptions.length ? 0 : highlightedIndex;
    const nextValue = filteredOptions[safeIndex] ?? selectedValue;
    if (!nextValue) {
      return false;
    }

    onCommit(nextValue, reason);
    setQuery("");
    setIsOpen(false);
    setHighlightedIndex(0);
    return true;
  }, [filteredOptions, highlightedIndex, onCommit, selectedValue]);

  const handleInput = useCallback((value: string) => {
    setQuery(value);
    setIsOpen(value.length > 0);
    setHighlightedIndex(0);
  }, []);

  const handleKey = useCallback((key: KeyEvent) => {
    if (!focused) {
      return false;
    }

    if (key.name === "up") {
      moveUp();
      key.preventDefault();
      return true;
    }

    if (key.name === "down") {
      moveDown();
      key.preventDefault();
      return true;
    }

    if (key.name === "tab") {
      if (!isOpen) {
        return false;
      }

      const handled = commit("tab");
      if (handled) {
        key.preventDefault();
      }
      return handled;
    }

    if (key.name === "escape") {
      if (!isOpen) {
        return false;
      }

      setIsOpen(false);
      setQuery("");
      setHighlightedIndex(0);
      key.preventDefault();
      return true;
    }

    return false;
  }, [commit, focused, isOpen, moveDown, moveUp]);

  const submitFromInput = useCallback(() => {
    return commit("enter");
  }, [commit]);

  return {
    isOpen,
    query,
    selectedValue,
    filteredOptions,
    highlightedIndex,
    handleInput,
    handleKey,
    submitFromInput,
  };
}
