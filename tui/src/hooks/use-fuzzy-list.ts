import fuzzysort from "fuzzysort";
import { useCallback, useMemo, useRef, useState } from "react";

type Params = {
  items: string[];
  active: boolean;
};

export function useFuzzyList({ items, active }: Params) {
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length === 0) {
      return items;
    }

    const results = fuzzysort.go(normalizedQuery, items, { limit: items.length });
    return results.map((result) => result.target);
  }, [items, query]);

  const safeIndex = useMemo(() => {
    if (filtered.length === 0) return 0;
    return highlightedIndex >= filtered.length ? 0 : highlightedIndex;
  }, [filtered.length, highlightedIndex]);

  const moveUp = useCallback(() => {
    setHighlightedIndex((current) => {
      if (filtered.length === 0) return 0;
      return current === 0 ? filtered.length - 1 : current - 1;
    });
  }, [filtered]);

  const moveDown = useCallback(() => {
    setHighlightedIndex((current) => {
      if (filtered.length === 0) return 0;
      return (current + 1) % filtered.length;
    });
  }, [filtered]);

  const handleInput = useCallback((value: string) => {
    setQuery(value);
    setHighlightedIndex(0);
  }, []);

  const reset = useCallback(() => {
    setQuery("");
    setHighlightedIndex(0);
  }, []);

  const wasActive = useRef(active);
  if (wasActive.current && !active) {
    setQuery("");
    setHighlightedIndex(0);
  }
  wasActive.current = active;

  return {
    query,
    filtered,
    highlightedIndex: safeIndex,
    moveUp,
    moveDown,
    handleInput,
    reset,
  };
}
