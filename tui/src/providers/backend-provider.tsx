import type { ReactNode } from "react";
import { createContext, useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import type { AnalyzeSourceParams } from "@/backend.ts";

import { Backend } from "@/backend.ts";
import type { OnboardingPersistedState } from "@/onboarding/types";
import type {
  AnalysisResult,
  Chapter,
} from "@/requests/analyze-source/index.ts";
import type { SetupStatus } from "@/requests/setup-status/index.ts";
import type { ConfigParams } from "@/requests/update-config/index.ts";

export type SetupPrefill = SetupStatus["prefill"];

type SetupStateBase = {
  prefill: SetupPrefill;
  missingFields: string[];
  providerOptions: string[];
  providerModelOptions: Record<string, string[]>;
  embeddingProviderOptions: string[];
  embeddingProviderModelOptions: Record<string, string[]>;
  storedTokens: Record<string, string>;
};

type SetupState =
  | ({ name: "setup-form"; error: null } & SetupStateBase)
  | ({ name: "setup-saving"; error: null } & SetupStateBase)
  | ({ name: "setup-error"; error: string } & SetupStateBase);

type SourceInputBase = {
  provider: string;
  model: string;
  providerOptions: string[];
  providerModelOptions: Record<string, string[]>;
};

type SourceInputState =
  | ({ name: "source-input"; status: "idle"; lastResult: AnalysisResult | null; error: null } & SourceInputBase)
  | ({ name: "source-input"; status: "submitting"; lastResult: AnalysisResult | null; requestId: number; stage: string | null; error: null; pendingInput: string; pendingChapter?: Chapter; pendingTags: string[] } & SourceInputBase)
  | ({ name: "source-input"; status: "selecting-chapter"; lastResult: AnalysisResult | null; input: string; chapters: Chapter[]; tags: string[]; error: null } & SourceInputBase)
  | ({ name: "source-input"; status: "error"; lastResult: AnalysisResult | null; error: string } & SourceInputBase);

export type AppFlowState =
  | SetupState
  | SourceInputState;

type Action =
  | { type: "setup-ready"; provider: string; model: string }
  | { type: "setup-save" }
  | { type: "setup-save-failed"; message: string; missingFields?: string[] }
  | { type: "submit"; requestId: number; input: string; chapter?: Chapter; tags: string[] }
  | { type: "progress"; requestId: number; stage: string }
  | { type: "success"; requestId: number; result: AnalysisResult }
  | { type: "pending-selection"; requestId: number; input: string; chapters: Chapter[]; tags: string[] }
  | { type: "failure"; requestId: number; message: string }
  | { type: "cancel" }
  | { type: "chapter-confirm"; requestId: number; chapter: Chapter }
  | { type: "chapter-cancel" }
  | { type: "source-input-provider-changed"; provider: string }
  | { type: "source-input-model-changed"; model: string };

type SubmittingState = Extract<SourceInputState, { status: "submitting" }>;

function isActiveRequest(state: AppFlowState, requestId: number): state is SubmittingState {
  return (
    state.name === "source-input" &&
    state.status === "submitting" &&
    state.requestId === requestId
  );
}

function lastResultFrom(state: AppFlowState): AnalysisResult | null {
  return state.name === "source-input" ? state.lastResult : null;
}

function sourceInputOptionsFrom(state: AppFlowState) {
  if (state.name === "source-input") {
    return {
      providerOptions: state.providerOptions,
      providerModelOptions: state.providerModelOptions,
    };
  }

  return {
    providerOptions: state.providerOptions,
    providerModelOptions: state.providerModelOptions,
  };
}

function reducer(state: AppFlowState, action: Action): AppFlowState {
  switch (action.type) {
    case "setup-ready":
      return {
        name: "source-input",
        status: "idle",
        lastResult: null,
        error: null,
        provider: action.provider,
        model: action.model,
        providerOptions: state.providerOptions,
        providerModelOptions: state.providerModelOptions,
      };
    case "setup-save":
      if (state.name !== "setup-form" && state.name !== "setup-error") {
        return state;
      }

      return {
        name: "setup-saving",
        prefill: state.prefill,
        missingFields: state.missingFields,
        providerOptions: state.providerOptions,
        providerModelOptions: state.providerModelOptions,
        embeddingProviderOptions: state.embeddingProviderOptions,
        embeddingProviderModelOptions: state.embeddingProviderModelOptions,
        storedTokens: state.storedTokens,
        error: null,
      };
    case "setup-save-failed":
      if (state.name !== "setup-saving") {
        return state;
      }

      return {
        name: "setup-error",
        prefill: state.prefill,
        missingFields: action.missingFields ?? state.missingFields,
        providerOptions: state.providerOptions,
        providerModelOptions: state.providerModelOptions,
        embeddingProviderOptions: state.embeddingProviderOptions,
        embeddingProviderModelOptions: state.embeddingProviderModelOptions,
        storedTokens: state.storedTokens,
        error: action.message,
      };
    case "submit": {
      const options = sourceInputOptionsFrom(state);
      return {
        name: "source-input",
        status: "submitting",
        lastResult: lastResultFrom(state),
        requestId: action.requestId,
        stage: null,
        error: null,
        pendingInput: action.input,
        pendingChapter: action.chapter,
        pendingTags: action.tags,
        provider: state.name === "source-input" ? state.provider : state.prefill.provider,
        model: state.name === "source-input" ? state.model : state.prefill.modelId,
        ...options,
      };
    }
    case "progress":
      if (!isActiveRequest(state, action.requestId)) {
        return state;
      }

      return { ...state, stage: action.stage };
    case "pending-selection":
      if (!isActiveRequest(state, action.requestId)) {
        return state;
      }

      return {
        name: "source-input",
        status: "selecting-chapter",
        lastResult: lastResultFrom(state),
        input: action.input,
        chapters: action.chapters,
        tags: action.tags,
        error: null,
        provider: state.provider,
        model: state.model,
        providerOptions: state.providerOptions,
        providerModelOptions: state.providerModelOptions,
      };

    case "success":
      if (!isActiveRequest(state, action.requestId)) {
        return state;
      }

      return {
        name: "source-input",
        status: "idle",
        lastResult: action.result,
        error: null,
        provider: state.provider,
        model: state.model,
        providerOptions: state.providerOptions,
        providerModelOptions: state.providerModelOptions,
      };
    case "failure":
      if (!isActiveRequest(state, action.requestId)) {
        return state;
      }

      return {
        name: "source-input",
        status: "error",
        lastResult: lastResultFrom(state),
        error: action.message,
        provider: state.provider,
        model: state.model,
        providerOptions: state.providerOptions,
        providerModelOptions: state.providerModelOptions,
      };
    case "cancel":
      if (state.name !== "source-input" || (state.status !== "submitting" && state.status !== "selecting-chapter")) {
        return state;
      }

      return {
        name: "source-input",
        status: "idle",
        lastResult: lastResultFrom(state),
        error: null,
        provider: state.provider,
        model: state.model,
        providerOptions: state.providerOptions,
        providerModelOptions: state.providerModelOptions,
      };

    case "chapter-confirm":
      if (state.name !== "source-input" || state.status !== "selecting-chapter") {
        return state;
      }

      return {
        ...state,
        status: "submitting",
        lastResult: lastResultFrom(state),
        requestId: action.requestId,
        stage: null,
        error: null,
        pendingInput: state.input,
        pendingChapter: action.chapter,
        pendingTags: state.tags,
      };

    case "chapter-cancel":
      if (state.name !== "source-input" || state.status !== "selecting-chapter") {
        return state;
      }

      return {
        name: "source-input",
        status: "idle",
        lastResult: lastResultFrom(state),
        error: null,
        provider: state.provider,
        model: state.model,
        providerOptions: state.providerOptions,
        providerModelOptions: state.providerModelOptions,
      };
    case "source-input-provider-changed":
      if (state.name !== "source-input") {
        return state;
      }

      return {
        ...state,
        provider: action.provider,
        model: state.providerModelOptions[action.provider]?.includes(state.model)
          ? state.model
          : (state.providerModelOptions[action.provider]?.[0] ?? state.model),
      };
    case "source-input-model-changed":
      if (state.name !== "source-input") {
        return state;
      }

      return {
        ...state,
        model: action.model,
      };
  }

  return state;
}

export type BackendContextValue = {
  state: AppFlowState;
  onboardingState: OnboardingPersistedState | null;
  analyzeSource: (params: AnalyzeSourceParams) => Promise<AnalysisResult | null>;
  cancelRequest: () => void;
  setOnboardingState: (state: OnboardingPersistedState) => Promise<void>;
  updateConfig: (params: ConfigParams) => Promise<void>;
  setSourceInputProvider: (provider: string) => void;
  setSourceInputModel: (model: string) => void;
  confirmChapter: (chapter: Chapter) => Promise<AnalysisResult | null>;
  cancelChapter: () => void;
  shutdown: () => Promise<void>;
  listVaultTags: () => Promise<string[]>;
};

export const BackendContext = createContext<BackendContextValue | null>(null);

type Props = {
  backend: Backend;
  initialState: AppFlowState;
  initialOnboardingState: OnboardingPersistedState | null;
  children: ReactNode;
};

export function BackendProvider({ backend, initialState, initialOnboardingState, children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const activeRequestId = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  const updateConfig = useCallback(
    async (params: ConfigParams) => {
      dispatch({ type: "setup-save" });

      try {
        const result = await backend.updateConfig(params);

        if (result.status === "ready") {
          dispatch({ type: "setup-ready", provider: result.provider, model: result.model });
        } else {
          dispatch({
            type: "setup-save-failed",
            message: "Configuration is still incomplete",
            missingFields: result.missingFields,
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save configuration";
        dispatch({ type: "setup-save-failed", message });
      }
    },
    [backend],
  );

  const cancelRequest = useCallback(() => {
    backend.cancel();
    dispatch({ type: "cancel" });
  }, [backend]);

  const analyzeSource = useCallback(
    async ({ input, tags, chapter }: AnalyzeSourceParams): Promise<AnalysisResult | null> => {
      const normalizedTags = tags ?? [];
      const requestId = activeRequestId.current + 1;
      activeRequestId.current = requestId;
      dispatch({ type: "submit", requestId, input, chapter, tags: normalizedTags });

      try {
        const result = await backend.analyzeSource({ input, chapter, tags: normalizedTags });
        if (activeRequestId.current !== requestId) {
          return null;
        }

        if (result.status === "pending_selection") {
          dispatch({ type: "pending-selection", requestId, input, chapters: result.chapters, tags: normalizedTags });
        } else {
          dispatch({ type: "success", requestId, result });
        }

        return result;
      } catch (error) {
        if (activeRequestId.current !== requestId) {
          return null;
        }

        const message = error instanceof Error ? error.message : "Unknown error";
        dispatch({ type: "failure", requestId, message });
        return null;
      }
    },
    [backend],
  );

  const shutdown = useCallback(async () => {
    activeRequestId.current += 1;
    await backend.shutdown();
  }, [backend]);

  const setOnboardingState = useCallback(async (onboardingState: OnboardingPersistedState) => {
    await backend.setOnboardingState(onboardingState);
  }, [backend]);

  const setSourceInputProvider = useCallback((provider: string) => {
    dispatch({ type: "source-input-provider-changed", provider });
  }, []);

  const setSourceInputModel = useCallback((model: string) => {
    dispatch({ type: "source-input-model-changed", model });
  }, []);

  const listVaultTags = useCallback(async () => {
    return backend.listVaultTags();
  }, [backend]);

  const confirmChapter = useCallback(async (chapter: Chapter): Promise<AnalysisResult | null> => {
    const current = stateRef.current;
    if (current.name !== "source-input" || current.status !== "selecting-chapter") return null;

    const requestId = activeRequestId.current + 1;
    activeRequestId.current = requestId;
    dispatch({ type: "chapter-confirm", requestId, chapter });
    return analyzeSource({ input: current.input, tags: current.tags, chapter });
  }, [analyzeSource]);

  const cancelChapter = useCallback(() => {
    dispatch({ type: "chapter-cancel" });
  }, []);

  useEffect(() => {
    const unsubscribe = backend.subscribe((method, params) => {
      if (method === "progress" && typeof params.stage === "string" && typeof params.request_id === "number") {
        dispatch({ type: "progress", requestId: params.request_id, stage: params.stage });
      }
    });

    return () => {
      unsubscribe();
      activeRequestId.current += 1;
      void backend.shutdown();
    };
  }, [backend]);

  const value = useMemo(
    () => ({
      state,
      onboardingState: initialOnboardingState,
      analyzeSource,
      cancelRequest,
      setOnboardingState,
      updateConfig,
      setSourceInputProvider,
      setSourceInputModel,
      confirmChapter,
      cancelChapter,
      shutdown,
      listVaultTags,
    }),
    [state, initialOnboardingState, analyzeSource, cancelRequest, setOnboardingState, updateConfig, setSourceInputProvider, setSourceInputModel, confirmChapter, cancelChapter, shutdown, listVaultTags],
  );

  return <BackendContext.Provider value={value}>{children}</BackendContext.Provider>;
}
