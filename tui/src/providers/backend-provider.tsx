import { createContext, useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type { ReactNode } from "react";
import { Backend } from "../backend.ts";
import type { AnalysisResult } from "../requests/analyze-source/index.ts";

type FileInputState =
  | { name: "file-input"; status: "idle"; error: null }
  | { name: "file-input"; status: "submitting"; requestId: number; error: null }
  | { name: "file-input"; status: "error"; error: string };

export type AppFlowState = FileInputState | { name: "analyzed"; result: AnalysisResult };

type Action =
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
  resetToFileInput: () => void;
  shutdown: () => Promise<void>;
};

export const BackendContext = createContext<BackendContextValue | null>(null);

type Props = {
  children: ReactNode;
};

export function BackendProvider({ children }: Props) {
  const backend = useMemo(() => new Backend(), []);
  const [state, dispatch] = useReducer(reducer, {
    name: "file-input",
    status: "idle",
    error: null,
  });
  const activeRequestId = useRef(0);

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
    () => ({ state, analyzeSource, resetToFileInput, shutdown }),
    [state, analyzeSource, resetToFileInput, shutdown],
  );

  return <BackendContext.Provider value={value}>{children}</BackendContext.Provider>;
}
