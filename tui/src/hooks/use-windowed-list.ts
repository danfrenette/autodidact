import { useMemo } from "react";

type WindowSlice = {
  start: number;
  end: number;
};

/**
 * Center-scroll windowing: keeps the highlighted item near the middle
 * of the visible window. When the list is short enough, shows everything.
 */
export function getWindowSlice(
  totalCount: number,
  highlightedIndex: number,
  maxVisible: number,
): WindowSlice {
  if (totalCount <= maxVisible) {
    return { start: 0, end: totalCount };
  }

  const halfWindow = Math.floor(maxVisible / 2);

  let start: number;
  if (highlightedIndex <= halfWindow) {
    start = 0;
  } else if (highlightedIndex >= totalCount - halfWindow) {
    start = totalCount - maxVisible;
  } else {
    start = highlightedIndex - halfWindow;
  }

  return { start, end: start + maxVisible };
}

export function useWindowedList<T>(
  items: T[],
  highlightedIndex: number,
  maxVisible: number,
) {
  return useMemo(() => {
    const { start, end } = getWindowSlice(items.length, highlightedIndex, maxVisible);
    return {
      visibleItems: items.slice(start, end),
      start,
      end,
    };
  }, [items, highlightedIndex, maxVisible]);
}
