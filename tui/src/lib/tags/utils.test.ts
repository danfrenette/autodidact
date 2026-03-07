import { describe, expect, it } from "vitest";

import {
  appendCreateOption,
  createSentinel,
  extractCreateName,
  formatTagPreview,
  isCreateOption,
  normalizeTag,
} from "./utils";

describe("normalizeTag", () => {
  it("trims whitespace and lowercases", () => {
    expect(normalizeTag("  Study-Guide  ")).toBe("study-guide");
  });

  it("returns null for empty string", () => {
    expect(normalizeTag("")).toBeNull();
  });

  it("returns null for whitespace-only string", () => {
    expect(normalizeTag("   ")).toBeNull();
  });

  it("lowercases mixed-case input", () => {
    expect(normalizeTag("KEY-TERMS")).toBe("key-terms");
  });

  it("passes through already-normalized input", () => {
    expect(normalizeTag("summary")).toBe("summary");
  });
});

describe("createSentinel / isCreateOption / extractCreateName", () => {
  it("round-trips through create sentinel", () => {
    const sentinel = createSentinel("my-tag");
    expect(isCreateOption(sentinel)).toBe(true);
    expect(extractCreateName(sentinel)).toBe("my-tag");
  });

  it("isCreateOption returns false for regular strings", () => {
    expect(isCreateOption("study-guide")).toBe(false);
    expect(isCreateOption("")).toBe(false);
    expect(isCreateOption("Create study-guide")).toBe(false);
  });

  it("extractCreateName returns empty string for prefix-only sentinel", () => {
    expect(extractCreateName(createSentinel(""))).toBe("");
  });

  it("preserves whitespace and casing in sentinel payload", () => {
    const sentinel = createSentinel("  Mixed Case  ");
    expect(extractCreateName(sentinel)).toBe("  Mixed Case  ");
  });
});

describe("appendCreateOption", () => {
  it("appends create sentinel when query has no exact match", () => {
    const result = appendCreateOption(["study-guide", "summary"], "new-tag");
    expect(result).toHaveLength(3);
    expect(isCreateOption(result[2]!)).toBe(true);
    expect(extractCreateName(result[2]!)).toBe("new-tag");
  });

  it("does not append when exact match exists (case-insensitive)", () => {
    const result = appendCreateOption(["study-guide", "summary"], "Study-Guide");
    expect(result).toHaveLength(2);
    expect(result).toEqual(["study-guide", "summary"]);
  });

  it("does not append for empty query", () => {
    const result = appendCreateOption(["study-guide"], "");
    expect(result).toHaveLength(1);
  });

  it("does not append for whitespace-only query", () => {
    const result = appendCreateOption(["study-guide"], "   ");
    expect(result).toHaveLength(1);
  });

  it("returns same array reference when no sentinel added", () => {
    const original = ["study-guide", "summary"];
    const result = appendCreateOption(original, "study-guide");
    expect(result).toBe(original);
  });

  it("appends to empty filtered list", () => {
    const result = appendCreateOption([], "new-tag");
    expect(result).toHaveLength(1);
    expect(isCreateOption(result[0]!)).toBe(true);
    expect(extractCreateName(result[0]!)).toBe("new-tag");
  });
});

describe("formatTagPreview", () => {
  it("returns '+ Add tags' for empty array", () => {
    expect(formatTagPreview([])).toBe("+ Add tags");
  });

  it("returns single tag name for one tag", () => {
    expect(formatTagPreview(["study-guide"])).toBe("study-guide");
  });

  it("comma-joins two tags", () => {
    expect(formatTagPreview(["study-guide", "summary"])).toBe("study-guide, summary");
  });

  it("comma-joins three tags (at default maxVisible)", () => {
    expect(formatTagPreview(["a", "b", "c"])).toBe("a, b, c");
  });

  it("truncates at 4+ tags with count", () => {
    expect(formatTagPreview(["a", "b", "c", "d"])).toBe("a, b, c (+1 more)");
  });

  it("truncates at 6 tags with correct count", () => {
    expect(formatTagPreview(["a", "b", "c", "d", "e", "f"])).toBe("a, b, c (+3 more)");
  });

  it("respects custom maxVisible", () => {
    expect(formatTagPreview(["a", "b", "c", "d"], 2)).toBe("a, b (+2 more)");
  });

  it("handles maxVisible of 1", () => {
    expect(formatTagPreview(["a", "b", "c"], 1)).toBe("a (+2 more)");
  });
});


