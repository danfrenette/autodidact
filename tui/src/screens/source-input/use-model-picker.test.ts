import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useModelPicker } from "./use-model-picker";

const DEFAULT_PARAMS = {
  provider: "openai",
  model: "gpt-4.1",
  providerOptions: ["openai", "anthropic"],
  providerModelOptions: {
    openai: ["gpt-4.1", "gpt-4.1-mini"],
    anthropic: ["claude-sonnet-4-5", "claude-haiku-3-5"],
  },
  onProviderChange: vi.fn(),
  onModelChange: vi.fn(),
  submitting: false,
};

describe("useModelPicker", () => {
  describe("initial state", () => {
    it("starts closed", () => {
      const { result } = renderHook(() => useModelPicker(DEFAULT_PARAMS));
      expect(result.current.isOpen).toBe(false);
    });

    it("defaults activePicker to model", () => {
      const { result } = renderHook(() => useModelPicker(DEFAULT_PARAMS));
      expect(result.current.modelCombobox.focused).toBe(false);
      expect(result.current.providerCombobox.focused).toBe(false);
    });

    it("providerCombobox reflects current provider", () => {
      const { result } = renderHook(() => useModelPicker(DEFAULT_PARAMS));
      expect(result.current.providerCombobox.selectedValue).toBe("openai");
    });

    it("modelCombobox reflects current model", () => {
      const { result } = renderHook(() => useModelPicker(DEFAULT_PARAMS));
      expect(result.current.modelCombobox.selectedValue).toBe("gpt-4.1");
    });
  });

  describe("onModelPress", () => {
    it("opens the picker", () => {
      const { result } = renderHook(() => useModelPicker(DEFAULT_PARAMS));

      act(() => result.current.onModelPress());

      expect(result.current.isOpen).toBe(true);
    });

    it("focuses the model combobox", () => {
      const { result } = renderHook(() => useModelPicker(DEFAULT_PARAMS));

      act(() => result.current.onModelPress());

      expect(result.current.modelCombobox.focused).toBe(true);
      expect(result.current.providerCombobox.focused).toBe(false);
    });
  });

  describe("onProviderPress", () => {
    it("opens the picker", () => {
      const { result } = renderHook(() => useModelPicker(DEFAULT_PARAMS));

      act(() => result.current.onProviderPress());

      expect(result.current.isOpen).toBe(true);
    });

    it("focuses the provider combobox", () => {
      const { result } = renderHook(() => useModelPicker(DEFAULT_PARAMS));

      act(() => result.current.onProviderPress());

      expect(result.current.providerCombobox.focused).toBe(true);
      expect(result.current.modelCombobox.focused).toBe(false);
    });
  });

  describe("onChevronPress", () => {
    it("opens when closed", () => {
      const { result } = renderHook(() => useModelPicker(DEFAULT_PARAMS));

      act(() => result.current.onChevronPress());

      expect(result.current.isOpen).toBe(true);
    });

    it("closes when open", () => {
      const { result } = renderHook(() => useModelPicker(DEFAULT_PARAMS));

      act(() => result.current.onModelPress());
      expect(result.current.isOpen).toBe(true);

      act(() => result.current.onChevronPress());
      expect(result.current.isOpen).toBe(false);
    });

    it("focuses model combobox when opening via chevron", () => {
      const { result } = renderHook(() => useModelPicker(DEFAULT_PARAMS));

      act(() => result.current.onChevronPress());

      expect(result.current.modelCombobox.focused).toBe(true);
      expect(result.current.providerCombobox.focused).toBe(false);
    });
  });

  describe("provider switching via onProviderPress then commit", () => {
    it("calls onProviderChange when provider committed", () => {
      const onProviderChange = vi.fn();
      const { result } = renderHook(() =>
        useModelPicker({ ...DEFAULT_PARAMS, onProviderChange }),
      );

      act(() => result.current.onProviderPress());

      act(() => {
        result.current.providerCombobox.handleInput("anthropic");
      });

      act(() => {
        result.current.providerCombobox.submitFromInput();
      });

      expect(onProviderChange).toHaveBeenCalledWith("anthropic");
    });

    it("resets activePicker to model after provider commit", () => {
      const onProviderChange = vi.fn();
      const { result } = renderHook(() =>
        useModelPicker({ ...DEFAULT_PARAMS, onProviderChange }),
      );

      act(() => result.current.onProviderPress());
      expect(result.current.providerCombobox.focused).toBe(true);

      act(() => result.current.providerCombobox.handleInput("anthropic"));
      act(() => result.current.providerCombobox.submitFromInput());

      expect(result.current.modelCombobox.focused).toBe(true);
      expect(result.current.providerCombobox.focused).toBe(false);
    });
  });

  describe("model selection", () => {
    it("calls onModelChange when model committed", () => {
      const onModelChange = vi.fn();
      const { result } = renderHook(() =>
        useModelPicker({ ...DEFAULT_PARAMS, onModelChange }),
      );

      act(() => result.current.onModelPress());
      act(() => result.current.modelCombobox.handleInput("gpt-4.1-mini"));
      act(() => result.current.modelCombobox.submitFromInput());

      expect(onModelChange).toHaveBeenCalledWith("gpt-4.1-mini");
    });
  });

  describe("submitting: true", () => {
    it("picker cannot be opened when submitting", () => {
      const { result } = renderHook(() =>
        useModelPicker({ ...DEFAULT_PARAMS, submitting: true }),
      );

      act(() => result.current.onModelPress());

      expect(result.current.isOpen).toBe(false);
    });
  });
});
