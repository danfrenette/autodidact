import type { KeyEvent } from "@opentui/core";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useTagCombobox } from "./use-tag-combobox";
import { TAG_OPTIONS } from "./utils";

function makeKey(name: string): KeyEvent {
  return {
    name,
    ctrl: false,
    meta: false,
    shift: false,
    option: false,
    sequence: name,
    number: false,
    raw: name,
    eventType: "press",
    source: "raw",
    defaultPrevented: false,
    propagationStopped: false,
    preventDefault: () => {},
    stopPropagation: () => {},
  } as unknown as KeyEvent;
}

describe("useTagCombobox", () => {
  describe("initial state", () => {
    it("starts closed with no tags", () => {
      const { result } = renderHook(() => useTagCombobox());
      expect(result.current.tagsExpanded).toBe(false);
      expect(result.current.selectedTags).toEqual([]);
    });

    it("starts with empty query and no dropdown", () => {
      const { result } = renderHook(() => useTagCombobox());
      expect(result.current.query).toBe("");
      expect(result.current.isDropdownOpen).toBe(false);
    });
  });

  describe("openTags / closeTags", () => {
    it("openTags expands the section", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      expect(result.current.tagsExpanded).toBe(true);
    });

    it("closeTags collapses the section", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      act(() => result.current.closeTags());
      expect(result.current.tagsExpanded).toBe(false);
    });

    it("closeTags resets query and closes dropdown", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      act(() => result.current.handleInput("sum"));
      expect(result.current.isDropdownOpen).toBe(true);

      act(() => result.current.closeTags());
      expect(result.current.query).toBe("");
      expect(result.current.isDropdownOpen).toBe(false);
    });
  });

  describe("handleInput", () => {
    it("updates the query", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      act(() => result.current.handleInput("sum"));
      expect(result.current.query).toBe("sum");
    });

    it("opens the dropdown when query is non-empty", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      act(() => result.current.handleInput("sum"));
      expect(result.current.isDropdownOpen).toBe(true);
    });

    it("closes the dropdown when query is cleared", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      act(() => result.current.handleInput("sum"));
      act(() => result.current.handleInput(""));
      expect(result.current.isDropdownOpen).toBe(false);
    });

    it("closes the dropdown when query is whitespace-only", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      act(() => result.current.handleInput("  "));
      expect(result.current.isDropdownOpen).toBe(false);
    });
  });

  describe("filteredOptions", () => {
    it("shows all available options when no query", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      expect(result.current.filteredOptions.length).toBeGreaterThan(0);
    });

    it("excludes already-selected tags from options", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.addTag("summary"));
      act(() => result.current.openTags());
      expect(result.current.filteredOptions).not.toContain("summary");
    });

    it("includes a create-sentinel when query has no exact match", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      act(() => result.current.handleInput("brand-new-tag"));
      const hasSentinel = result.current.filteredOptions.some((o) =>
        o.startsWith("create:"),
      );
      expect(hasSentinel).toBe(true);
    });

    it("does not include a create-sentinel when query exactly matches an existing option", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      act(() => result.current.handleInput("summary"));
      const hasSentinel = result.current.filteredOptions.some((o) =>
        o.startsWith("create:"),
      );
      expect(hasSentinel).toBe(false);
    });
  });

  describe("submitTag", () => {
    it("returns false when filteredOptions is empty and query is empty", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      // Select all tags so filteredOptions is empty
      for (const tag of TAG_OPTIONS) {
        act(() => result.current.addTag(tag));
      }
      let submitted = false;
      act(() => {
        submitted = result.current.submitTag();
      });
      expect(submitted).toBe(false);
    });

    it("submits the highlighted option when no query typed", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      let submitted = false;
      act(() => {
        submitted = result.current.submitTag();
      });
      expect(submitted).toBe(true);
      expect(result.current.selectedTags).toHaveLength(1);
    });

    it("adds a tag from typed query and resets", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      act(() => result.current.handleInput("custom-tag"));
      let submitted = false;
      act(() => {
        submitted = result.current.submitTag();
      });
      expect(submitted).toBe(true);
      expect(result.current.selectedTags).toContain("custom-tag");
      expect(result.current.query).toBe("");
      expect(result.current.isDropdownOpen).toBe(false);
    });

    it("adds a tag from a highlighted create-sentinel option", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      act(() => result.current.handleInput("my-new-tag"));

      const sentinelIndex = result.current.filteredOptions.findIndex((o) =>
        o.startsWith("create:"),
      );
      expect(sentinelIndex).toBeGreaterThanOrEqual(0);

      // Move highlight to the sentinel
      const moves = sentinelIndex - result.current.highlightedIndex;
      for (let i = 0; i < moves; i++) {
        act(() => result.current.handleKey(makeKey("down")));
      }

      let submitted = false;
      act(() => {
        submitted = result.current.submitTag();
      });
      expect(submitted).toBe(true);
      expect(result.current.selectedTags).toContain("my-new-tag");
    });
  });

  describe("addTag / removeTag / clearTags (delegated to useTagSelection)", () => {
    it("addTag adds a tag", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.addTag("summary"));
      expect(result.current.selectedTags).toContain("summary");
    });

    it("removeTag removes a tag", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.addTag("summary"));
      act(() => result.current.removeTag("summary"));
      expect(result.current.selectedTags).not.toContain("summary");
    });

    it("clearTags empties the selection", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.addTag("summary"));
      act(() => result.current.addTag("key-terms"));
      act(() => result.current.clearTags());
      expect(result.current.selectedTags).toEqual([]);
    });
  });

  describe("handleKey", () => {
    it("returns false when section is closed", () => {
      const { result } = renderHook(() => useTagCombobox());
      let handled = false;
      act(() => {
        handled = result.current.handleKey(makeKey("down"));
      });
      expect(handled).toBe(false);
    });

    it("down arrow is handled when open", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      let handled = false;
      act(() => {
        handled = result.current.handleKey(makeKey("down"));
      });
      expect(handled).toBe(true);
    });

    it("up arrow is handled when open", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      let handled = false;
      act(() => {
        handled = result.current.handleKey(makeKey("up"));
      });
      expect(handled).toBe(true);
    });

    it("escape closes the dropdown when dropdown is open", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      act(() => result.current.handleInput("sum"));
      expect(result.current.isDropdownOpen).toBe(true);

      act(() => result.current.handleKey(makeKey("escape")));
      expect(result.current.isDropdownOpen).toBe(false);
      expect(result.current.tagsExpanded).toBe(true);
    });

    it("escape closes the section when dropdown is already closed", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      expect(result.current.isDropdownOpen).toBe(false);

      act(() => result.current.handleKey(makeKey("escape")));
      expect(result.current.tagsExpanded).toBe(false);
    });

    it("other keys return false", () => {
      const { result } = renderHook(() => useTagCombobox());
      act(() => result.current.openTags());
      let handled = false;
      act(() => {
        handled = result.current.handleKey(makeKey("return"));
      });
      expect(handled).toBe(false);
    });
  });

  describe("referential stability", () => {
    it("openTags is stable across renders", () => {
      const { result, rerender } = renderHook(() => useTagCombobox());
      const first = result.current.openTags;
      rerender();
      expect(result.current.openTags).toBe(first);
    });

    it("closeTags is stable across renders", () => {
      const { result, rerender } = renderHook(() => useTagCombobox());
      const first = result.current.closeTags;
      rerender();
      expect(result.current.closeTags).toBe(first);
    });

    it("handleInput is stable across renders", () => {
      const { result, rerender } = renderHook(() => useTagCombobox());
      const first = result.current.handleInput;
      rerender();
      expect(result.current.handleInput).toBe(first);
    });
  });
});
