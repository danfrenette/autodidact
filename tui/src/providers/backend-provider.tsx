import { createContext, useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type { ReactNode } from "react";
import { Backend } from "../backend.ts";
import type { AnalysisResult } from "../requests/analyze-source/index.ts";
import type { SetupStatus } from "../requests/setup-status/index.ts";
import type { ConfigParams } from "../requests/update-config/index.ts";

export type SetupPrefill = SetupStatus["prefill"];

type SetupState =
  | { name: "setup-form"; prefill: SetupPrefill; missingFields: string[]; modelOptions: string[]; error: null }
  | { name: "setup-saving"; prefill: SetupPrefill; missingFields: string[]; modelOptions: string[]; error: null }
  | { name: "setup-error"; prefill: SetupPrefill; missingFields: string[]; modelOptions: string[]; error: string };

type FileInputState =
  | { name: "file-input"; status: "idle"; error: null }
  | { name: "file-input"; status: "submitting"; requestId: number; error: null }
  | { name: "file-input"; status: "error"; error: string };

export type AppFlowState =
  | SetupState
  | FileInputState
  | { name: "analyzed"; result: AnalysisResult };

type Action =
  | { type: "setup-ready" }
  | { type: "setup-save" }
  | { type: "setup-save-failed"; message: string }
  | { type: "submit"; requestId: number }
  | { type: "success"; requestId: number; result: AnalysisResult }
  | { type: "failure"; requestId: number; message: string }
  | { type: "reset" };

function isActiveRequest(state: AppFlowState, requestId: number): boolean {
  return (
    state.name === "file-input" &&
    state.status === "submitting" &&
    state.requestId === requestId
  );
}

function reducer(state: AppFlowState, action: Action): AppFlowState {
  switch (action.type) {
    case "setup-ready":
      return { name: "file-input", status: "idle", error: null };
    case "setup-save":
      if (state.name !== "setup-form" && state.name !== "setup-error") {
        return state;
      }

      return {
        name: "setup-saving",
        prefill: state.prefill,
        missingFields: state.missingFields,
        modelOptions: state.modelOptions,
        error: null,
      };
    case "setup-save-failed":
      if (state.name !== "setup-saving") {
        return state;
      }

      return {
        name: "setup-error",
        prefill: state.prefill,
        missingFields: state.missingFields,
        modelOptions: state.modelOptions,
        error: action.message,
      };
    case "submit":
      return { name: "file-input", status: "submitting", requestId: action.requestId, error: null };
    case "success":
      if (!isActiveRequest(state, action.requestId)) {
        return state;
      }

      return { name: "analyzed", result: action.result };
    case "failure":
      if (!isActiveRequest(state, action.requestId)) {
        return state;
      }

      return { name: "file-input", status: "error", error: action.message };
    case "reset":
      return { name: "file-input", status: "idle", error: null };
  }
}

export type BackendContextValue = {
  state: AppFlowState;
  analyzeSource: (path: string) => Promise<void>;
  updateConfig: (params: ConfigParams) => Promise<void>;
  resetToFileInput: () => void;
  shutdown: () => Promise<void>;
};

export const BackendContext = createContext<BackendContextValue | null>(null);

type Props = {
  backend: Backend;
  initialState: AppFlowState;
  children: ReactNode;
};

export function BackendProvider({ backend, initialState, children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const activeRequestId = useRef(0);

  const updateConfig = useCallback(
    async (params: ConfigParams) => {
      dispatch({ type: "setup-save" });

      try {
        const result = await backend.updateConfig(params);

        if (result.status === "ready") {
          dispatch({ type: "setup-ready" });
        } else {
          dispatch({ type: "setup-save-failed", message: "Configuration is still incomplete" });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save configuration";
        dispatch({ type: "setup-save-failed", message });
      }
    },
    [backend],
  );

  const analyzeSource = useCallback(
    async (path: string) => {
      const requestId = activeRequestId.current + 1;
      activeRequestId.current = requestId;
      dispatch({ type: "submit", requestId });

      try {
        const result = await backend.analyzeSource(path);
        if (activeRequestId.current !== requestId) {
          return;
        }

        dispatch({ type: "success", requestId, result });
      } catch (error) {
        if (activeRequestId.current !== requestId) {
          return;
        }

        const message = error instanceof Error ? error.message : "Unknown error";
        dispatch({ type: "failure", requestId, message });
      }
    },
    [backend],
  );

  const resetToFileInput = useCallback(() => {
    activeRequestId.current += 1;
    dispatch({ type: "reset" });
  }, []);

  const shutdown = useCallback(async () => {
    activeRequestId.current += 1;
    await backend.shutdown();
  }, [backend]);

  useEffect(() => {
    return () => {
      activeRequestId.current += 1;
      void backend.shutdown();
    };
  }, [backend]);

  const value = useMemo(
    () => ({ state, analyzeSource, updateConfig, resetToFileInput, shutdown }),
    [state, analyzeSource, updateConfig, resetToFileInput, shutdown],
  );

  return <BackendContext.Provider value={value}>{children}</BackendContext.Provider>;
}
