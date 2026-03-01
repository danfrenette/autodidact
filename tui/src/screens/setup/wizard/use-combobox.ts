import type { KeyEvent } from "@opentui/core";
import { useCallback, useRef, useState } from "react";

import { useFuzzyList } from "@/hooks/use-fuzzy-list";

type CommitReason = "enter" | "tab";

type Params = {
  options: string[];
  selectedValue: string;
  focused: boolean;
  onCommit: (value: string, reason: CommitReason) => void;
};

export function useCombobox({ options, selectedValue, focused, onCommit }: Params) {
  const [isOpen, setIsOpen] = useState(false);
  const fuzzy = useFuzzyList({ items: options, active: focused });

  // Close dropdown when unfocused (sync with fuzzy reset)
  const wasFocused = useRef(focused);
  if (wasFocused.current && !focused) {
    setIsOpen(false);
  }
  wasFocused.current = focused;

  const commit = useCallback((reason: CommitReason) => {
    if (fuzzy.filtered.length === 0) {
      return false;
    }

    const nextValue = fuzzy.filtered[fuzzy.highlightedIndex] ?? selectedValue;
    if (!nextValue) {
      return false;
    }

    onCommit(nextValue, reason);
    fuzzy.reset();
    setIsOpen(false);
    return true;
  }, [fuzzy, onCommit, selectedValue]);

  const handleInput = useCallback((value: string) => {
    fuzzy.handleInput(value);
    setIsOpen(value.length > 0);
  }, [fuzzy]);

  const handleKey = useCallback((key: KeyEvent) => {
    if (!focused) {
      return false;
    }

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

    if (key.name === "tab") {
      if (key.shift) {
        return false;
      }

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
      fuzzy.reset();
      key.preventDefault();
      return true;
    }

    return false;
  }, [commit, focused, fuzzy, isOpen]);

  const submitFromInput = useCallback(() => {
    return commit("enter");
  }, [commit]);

  return {
    isOpen,
    query: fuzzy.query,
    selectedValue,
    filteredOptions: fuzzy.filtered,
    highlightedIndex: fuzzy.highlightedIndex,
    handleInput,
    handleKey,
    submitFromInput,
  };
}
