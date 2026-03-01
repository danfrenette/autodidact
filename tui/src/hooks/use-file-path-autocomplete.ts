import type { KeyEvent } from "@opentui/core";
import { useCallback, useEffect, useMemo, useReducer } from "react";

import { searchSupportedFiles } from "@/lib/file-search";

const MAX_SUGGESTIONS = 6;

export type FilePathAutocompleteState =
  | { status: "closed" }
  | { status: "loading"; query: string }
  | { status: "empty"; query: string }
  | { status: "open"; query: string; items: string[]; selectedIndex: number };

type AutocompleteAction =
  | { type: "close" }
  | { type: "start-search"; query: string }
  | { type: "search-resolved"; query: string; items: string[] }
  | { type: "move-up" }
  | { type: "move-down" };

type SubmitResult =
  | { type: "submit-path"; path: string }
  | { type: "selected-suggestion" }
  | { type: "validation-error"; message: string };

type Params = {
  value: string;
  onInput: (value: string) => void;
  submitting: boolean;
};

const initialState: FilePathAutocompleteState = { status: "closed" };

export function useFilePathAutocomplete({ value, onInput, submitting }: Params) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const query = useMemo(() => parseAutocompleteQuery(value), [value]);
  const visible = state.status === "loading" || state.status === "empty" || state.status === "open";

  const applySelected = useCallback(() => {
    if (state.status !== "open") {
      return false;
    }

    const selected = state.items[state.selectedIndex];
    if (!selected) {
      return false;
    }

    onInput(selected);
    dispatch({ type: "close" });
    return true;
  }, [onInput, state]);

  const handleKey = useCallback((key: KeyEvent) => {
    if (!visible) {
      return false;
    }

    if (key.name === "up") {
      dispatch({ type: "move-up" });
      key.preventDefault();
      return true;
    }

    if (key.name === "down") {
      dispatch({ type: "move-down" });
      key.preventDefault();
      return true;
    }

    if (key.name === "tab" || key.name === "return") {
      const handled = applySelected();
      if (handled) {
        key.preventDefault();
      }
      return handled;
    }

    if (key.name === "escape") {
      dispatch({ type: "close" });
      key.preventDefault();
      return true;
    }

    return false;
  }, [applySelected, visible]);

  const resolveSubmit = useCallback((): SubmitResult => {
    if (query !== null) {
      if (state.status === "loading") {
        return { type: "validation-error", message: "Still searching for matching files..." };
      }

      if (state.status === "empty") {
        return { type: "validation-error", message: "No supported files matched that @ query" };
      }

      if (applySelected()) {
        return { type: "selected-suggestion" };
      }
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return { type: "validation-error", message: "Please enter a file path or text" };
    }

    return { type: "submit-path", path: trimmed };
  }, [applySelected, query, state.status, value]);

  useEffect(() => {
    if (submitting || query === null) {
      dispatch({ type: "close" });
      return;
    }

    let cancelled = false;
    dispatch({ type: "start-search", query });

    void searchSupportedFiles(query, process.cwd(), MAX_SUGGESTIONS).then((items) => {
      if (cancelled) {
        return;
      }

      dispatch({ type: "search-resolved", query, items });
    });

    return () => {
      cancelled = true;
    };
  }, [query, submitting]);

  return {
    state,
    visible,
    query,
    handleKey,
    resolveSubmit,
  };
}

function reducer(state: FilePathAutocompleteState, action: AutocompleteAction): FilePathAutocompleteState {
  switch (action.type) {
    case "close":
      return { status: "closed" };
    case "start-search":
      return { status: "loading", query: action.query };
    case "search-resolved":
      if (state.status !== "loading") {
        return state;
      }

      if (state.query !== action.query) {
        return state;
      }

      if (action.items.length === 0) {
        return { status: "empty", query: action.query };
      }

      return {
        status: "open",
        query: action.query,
        items: action.items,
        selectedIndex: 0,
      };
    case "move-up":
      if (state.status !== "open") {
        return state;
      }

      return {
        ...state,
        selectedIndex: state.selectedIndex === 0
          ? state.items.length - 1
          : state.selectedIndex - 1,
      };
    case "move-down":
      if (state.status !== "open") {
        return state;
      }

      return {
        ...state,
        selectedIndex: (state.selectedIndex + 1) % state.items.length,
      };
  }
}

function parseAutocompleteQuery(value: string) {
  const trimmed = value.trim();
  if (!trimmed.startsWith("@")) {
    return null;
  }

  const query = trimmed.slice(1);
  if (/\s/.test(query)) {
    return null;
  }

  return query;
}
