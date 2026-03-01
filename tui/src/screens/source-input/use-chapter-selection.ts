import type { KeyEvent } from "@opentui/core";
import { useCallback, useMemo } from "react";

import { useFuzzyList } from "@/hooks/use-fuzzy-list";
import { useWindowedList } from "@/hooks/use-windowed-list";
import type { Chapter } from "@/requests/analyze-source";

type Params = {
  chapters: Chapter[];
  onConfirm: (chapter: Chapter) => void | Promise<unknown>;
  onCancel: () => void;
  active: boolean;
};

const MAX_VISIBLE = 12;

export function useChapterSelection({ chapters, onConfirm, onCancel, active }: Params) {
  const titles = useMemo(() => chapters.map((c) => c.title), [chapters]);

  const fuzzy = useFuzzyList({ items: titles, active });

  const filteredChapters = useMemo(() => {
    if (fuzzy.query.trim().length === 0) {
      return chapters;
    }

    const titleSet = new Set(fuzzy.filtered);
    return chapters.filter((c) => titleSet.has(c.title));
  }, [chapters, fuzzy.filtered, fuzzy.query]);

  const window = useWindowedList(filteredChapters, fuzzy.highlightedIndex, MAX_VISIBLE);

  const handleKey = useCallback((key: KeyEvent): boolean => {
    if (!active) return false;

    if (key.name === "up") {
      key.preventDefault();
      fuzzy.moveUp();
      return true;
    }

    if (key.name === "down") {
      key.preventDefault();
      fuzzy.moveDown();
      return true;
    }

    if (key.name === "return") {
      key.preventDefault();
      const chapter = filteredChapters[fuzzy.highlightedIndex];
      if (chapter) {
        onConfirm(chapter);
      }
      return true;
    }

    if (key.name === "escape") {
      key.preventDefault();
      onCancel();
      return true;
    }

    return false;
  }, [active, filteredChapters, fuzzy, onCancel, onConfirm]);

  return {
    query: fuzzy.query,
    handleInput: fuzzy.handleInput,
    filteredChapters,
    totalCount: chapters.length,
    highlightedIndex: fuzzy.highlightedIndex,
    visibleChapters: window.visibleItems,
    windowStart: window.start,
    handleKey,
  };
}
