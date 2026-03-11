import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { resolveSubmitIntent, useSourceInputSubmit } from "./use-source-input-submit";

describe("resolveSubmitIntent", () => {
  it("submits a resolved path", () => {
    expect(resolveSubmitIntent("ignored", { type: "submit-path", path: "notes/chapter.md" })).toEqual({
      type: "submit-analysis",
      input: "notes/chapter.md",
    });
  });

  it("submits trimmed raw text when autocomplete validation fails but input exists", () => {
    expect(resolveSubmitIntent("  some raw text  ", { type: "validation-error", message: "no path" })).toEqual({
      type: "submit-analysis",
      input: "some raw text",
    });
  });

  it("returns a validation error when input is empty", () => {
    expect(resolveSubmitIntent("   ", { type: "validation-error", message: "Please enter a file path or text" })).toEqual({
      type: "validation-error",
      message: "Please enter a file path or text",
    });
  });

  it("returns autocomplete selection intent", () => {
    expect(resolveSubmitIntent("@notes", { type: "selected-suggestion" })).toEqual({
      type: "select-autocomplete",
    });
  });
});

describe("useSourceInputSubmit", () => {
  it("submits typed path and selected tags as object params", async () => {
    const onSubmit = vi.fn().mockResolvedValue(null);

    const { result } = renderHook(() =>
      useSourceInputSubmit({
        resolveSubmit: () => ({ type: "submit-path", path: "notes/chapter.md" }),
        selectedTags: ["study-guide", "chapter-review"],
        textareaRef: { current: null },
        value: "notes/chapter.md",
        onInput: vi.fn(),
        onSubmit,
        onSubmitSucceeded: vi.fn(),
        onAutocompleteSelected: vi.fn(),
        openOutputModal: vi.fn(),
        submitting: false,
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      input: "notes/chapter.md",
      tags: ["study-guide", "chapter-review"],
    });
  });

  it("submits raw text and selected tags when validator returns validation-error", async () => {
    const onSubmit = vi.fn().mockResolvedValue(null);

    const { result } = renderHook(() =>
      useSourceInputSubmit({
        resolveSubmit: () => ({ type: "validation-error", message: "no path" }),
        selectedTags: ["notes"],
        textareaRef: { current: null },
        value: "  some raw text  ",
        onInput: vi.fn(),
        onSubmit,
        onSubmitSucceeded: vi.fn(),
        onAutocompleteSelected: vi.fn(),
        openOutputModal: vi.fn(),
        submitting: false,
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      input: "some raw text",
      tags: ["notes"],
    });
  });

  it("uses latest selected tags even if an older submit callback is invoked", async () => {
    const onSubmit = vi.fn().mockResolvedValue(null);
    const baseParams = {
      resolveSubmit: () => ({ type: "submit-path" as const, path: "notes/chapter.md" }),
      textareaRef: { current: null },
      value: "notes/chapter.md",
      onInput: vi.fn(),
      onSubmit,
      onSubmitSucceeded: vi.fn(),
      onAutocompleteSelected: vi.fn(),
      openOutputModal: vi.fn(),
      submitting: false,
    };

    const { result, rerender } = renderHook(
      ({ selectedTags }) => useSourceInputSubmit({ ...baseParams, selectedTags }),
      { initialProps: { selectedTags: [] as string[] } },
    );

    const staleHandleSubmit = result.current.handleSubmit;

    rerender({ selectedTags: ["study-guide"] });

    await act(async () => {
      await staleHandleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      input: "notes/chapter.md",
      tags: ["study-guide"],
    });
  });

  it("uses latest submitting state even if an older submit callback is invoked", async () => {
    const onSubmit = vi.fn().mockResolvedValue(null);
    const baseParams = {
      resolveSubmit: () => ({ type: "submit-path" as const, path: "notes/chapter.md" }),
      selectedTags: [] as string[],
      textareaRef: { current: null },
      value: "notes/chapter.md",
      onInput: vi.fn(),
      onSubmit,
      onSubmitSucceeded: vi.fn(),
      onAutocompleteSelected: vi.fn(),
      openOutputModal: vi.fn(),
    };

    const { result, rerender } = renderHook(
      ({ submitting }) => useSourceInputSubmit({ ...baseParams, submitting }),
      { initialProps: { submitting: true } },
    );

    const staleHandleSubmit = result.current.handleSubmit;

    rerender({ submitting: false });

    await act(async () => {
      await staleHandleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      input: "notes/chapter.md",
      tags: [],
    });
  });
});
