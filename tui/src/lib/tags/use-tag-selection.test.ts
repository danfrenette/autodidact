import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useTagSelection } from "./use-tag-selection";

describe("useTagSelection", () => {
  describe("initial state", () => {
    it("starts with no selected tags", () => {
      const { result } = renderHook(() => useTagSelection());
      expect(result.current.selectedTags).toEqual([]);
    });
  });

  describe("addTag", () => {
    it("adds a tag", () => {
      const { result } = renderHook(() => useTagSelection());
      act(() => result.current.addTag("summary"));
      expect(result.current.selectedTags).toEqual(["summary"]);
    });

    it("normalizes the tag (trims and lowercases)", () => {
      const { result } = renderHook(() => useTagSelection());
      act(() => result.current.addTag("  Study-Guide  "));
      expect(result.current.selectedTags).toEqual(["study-guide"]);
    });

    it("deduplicates — does not add the same tag twice", () => {
      const { result } = renderHook(() => useTagSelection());
      act(() => result.current.addTag("summary"));
      act(() => result.current.addTag("summary"));
      expect(result.current.selectedTags).toEqual(["summary"]);
    });

    it("deduplicates after normalization", () => {
      const { result } = renderHook(() => useTagSelection());
      act(() => result.current.addTag("Summary"));
      act(() => result.current.addTag("summary"));
      expect(result.current.selectedTags).toEqual(["summary"]);
    });

    it("ignores empty string", () => {
      const { result } = renderHook(() => useTagSelection());
      act(() => result.current.addTag(""));
      expect(result.current.selectedTags).toEqual([]);
    });

    it("ignores whitespace-only string", () => {
      const { result } = renderHook(() => useTagSelection());
      act(() => result.current.addTag("   "));
      expect(result.current.selectedTags).toEqual([]);
    });

    it("preserves insertion order", () => {
      const { result } = renderHook(() => useTagSelection());
      act(() => result.current.addTag("summary"));
      act(() => result.current.addTag("key-terms"));
      act(() => result.current.addTag("study-guide"));
      expect(result.current.selectedTags).toEqual(["summary", "key-terms", "study-guide"]);
    });
  });

  describe("removeTag", () => {
    it("removes an existing tag", () => {
      const { result } = renderHook(() => useTagSelection());
      act(() => result.current.addTag("summary"));
      act(() => result.current.addTag("key-terms"));
      act(() => result.current.removeTag("summary"));
      expect(result.current.selectedTags).toEqual(["key-terms"]);
    });

    it("is a no-op when tag is not selected", () => {
      const { result } = renderHook(() => useTagSelection());
      act(() => result.current.addTag("summary"));
      act(() => result.current.removeTag("key-terms"));
      expect(result.current.selectedTags).toEqual(["summary"]);
    });

    it("is a no-op on empty selection", () => {
      const { result } = renderHook(() => useTagSelection());
      act(() => result.current.removeTag("summary"));
      expect(result.current.selectedTags).toEqual([]);
    });
  });

  describe("clearTags", () => {
    it("resets selection to empty", () => {
      const { result } = renderHook(() => useTagSelection());
      act(() => result.current.addTag("summary"));
      act(() => result.current.addTag("key-terms"));
      act(() => result.current.clearTags());
      expect(result.current.selectedTags).toEqual([]);
    });

    it("is a no-op when already empty", () => {
      const { result } = renderHook(() => useTagSelection());
      act(() => result.current.clearTags());
      expect(result.current.selectedTags).toEqual([]);
    });
  });

  describe("referential stability", () => {
    it("addTag is stable across renders", () => {
      const { result, rerender } = renderHook(() => useTagSelection());
      const first = result.current.addTag;
      rerender();
      expect(result.current.addTag).toBe(first);
    });

    it("removeTag is stable across renders", () => {
      const { result, rerender } = renderHook(() => useTagSelection());
      const first = result.current.removeTag;
      rerender();
      expect(result.current.removeTag).toBe(first);
    });

    it("clearTags is stable across renders", () => {
      const { result, rerender } = renderHook(() => useTagSelection());
      const first = result.current.clearTags;
      rerender();
      expect(result.current.clearTags).toBe(first);
    });
  });
});
