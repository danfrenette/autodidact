import { useState, useCallback } from "react";
import { useKeyboard } from "@opentui/react";
import type { SetupPrefill } from "../providers/backend-provider.tsx";
import type { ConfigParams } from "../requests/update-config/index.ts";

type Props = {
  prefill: SetupPrefill;
  modelOptions: string[];
  saving: boolean;
  error: string | null;
  onSubmit: (params: ConfigParams) => void;
};

const CUSTOM_MODEL_VALUE = "__custom__";

type SetupField = "obsidianVaultPath" | "openaiAccessToken" | "openaiModel" | "customModel";

const FALLBACK_MODELS = ["gpt-4.1", "gpt-4.1-mini", "gpt-4o-mini", "o4-mini"];

export function Setup({ prefill, modelOptions, saving, error: backendError, onSubmit }: Props) {
  const availableModels = modelOptions.length > 0 ? modelOptions : FALLBACK_MODELS;
  const prefillModel = prefill.openaiModel;
  const prefillIsCustom = !availableModels.includes(prefillModel);

  const [obsidianVaultPath, setObsidianVaultPath] = useState(prefill.obsidianVaultPath ?? "");
  const [openaiAccessToken, setOpenaiAccessToken] = useState(prefill.openaiAccessToken ?? "");
  const [selectedModel, setSelectedModel] = useState(prefillIsCustom ? CUSTOM_MODEL_VALUE : prefillModel);
  const [customModel, setCustomModel] = useState(prefillIsCustom ? prefillModel : "");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);

  const showCustomModel = selectedModel === CUSTOM_MODEL_VALUE;
  const fields: SetupField[] = showCustomModel
    ? ["obsidianVaultPath", "openaiAccessToken", "openaiModel", "customModel"]
    : ["obsidianVaultPath", "openaiAccessToken", "openaiModel"];

  const error = validationError ?? backendError;

  const clearValidationError = useCallback(() => {
    if (validationError !== null) {
      setValidationError(null);
    }
  }, [validationError]);

  const handleSubmit = useCallback(() => {
    if (obsidianVaultPath.trim().length === 0) {
      setValidationError("Please enter your Obsidian vault path");
      return;
    }

    if (openaiAccessToken.trim().length === 0) {
      setValidationError("Please enter your OpenAI access token");
      return;
    }

    const model = selectedModel === CUSTOM_MODEL_VALUE ? customModel.trim() : selectedModel;
    if (model.length === 0) {
      setValidationError("Please choose an OpenAI model");
      return;
    }

    setValidationError(null);

    onSubmit({
      obsidianVaultPath: obsidianVaultPath.trim(),
      openaiAccessToken: openaiAccessToken.trim(),
      openaiModel: model,
    });
  }, [customModel, obsidianVaultPath, onSubmit, openaiAccessToken, selectedModel]);

  const focusByField = useCallback((field: SetupField) => {
    setFocusIndex(fields.indexOf(field));
  }, [fields]);

  useKeyboard((key) => {
    if (key.name === "tab") {
      setFocusIndex((prev) => (prev + 1) % fields.length);
    }
  });

  const modelValues = [...availableModels, CUSTOM_MODEL_VALUE];
  const modelSelectOptions = modelValues.map((model) => ({
    name: model === CUSTOM_MODEL_VALUE ? "Custom..." : model,
    description: "",
  }));

  const selectedModelIndex = modelValues.findIndex((value) => value === selectedModel);

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
      <text style={{ marginBottom: 1 }}>Autodidact Setup</text>

      <box border title="Obsidian vault path" style={{ width: 80, height: 3, marginBottom: 1 }}>
        <input
          placeholder="/path/to/vault"
          value={obsidianVaultPath}
          onInput={(value) => {
            clearValidationError();
            setObsidianVaultPath(value);
          }}
          onSubmit={() => focusByField("openaiAccessToken")}
          focused={fields[focusIndex] === "obsidianVaultPath"}
        />
      </box>

      <box border title="OpenAI access token" style={{ width: 80, height: 3, marginBottom: 1 }}>
        <input
          placeholder="sk-..."
          value={openaiAccessToken}
          onInput={(value) => {
            clearValidationError();
            setOpenaiAccessToken(value);
          }}
          onSubmit={handleSubmit}
          focused={fields[focusIndex] === "openaiAccessToken"}
        />
      </box>

      <box border title="OpenAI model" style={{ width: 80, height: 9, marginBottom: 1 }}>
        <select
          options={modelSelectOptions}
          height={7}
          showScrollIndicator
          selectedIndex={selectedModelIndex === -1 ? 0 : selectedModelIndex}
          showDescription={false}
          onChange={(index) => {
            const value = modelValues[index];
            if (value) {
              clearValidationError();
              setSelectedModel(value);
            }
          }}
          onSelect={(index) => {
            const value = modelValues[index];
            if (!value) {
              return;
            }

            setSelectedModel(value);
            if (value === CUSTOM_MODEL_VALUE) {
              focusByField("customModel");
            } else {
              handleSubmit();
            }
          }}
          focused={fields[focusIndex] === "openaiModel"}
        />
      </box>

      {showCustomModel && (
        <box border title="Custom model" style={{ width: 80, height: 3, marginBottom: 1 }}>
          <input
            placeholder="Enter model id"
            value={customModel}
            onInput={(value) => {
              clearValidationError();
              setCustomModel(value);
            }}
            onSubmit={handleSubmit}
            focused={fields[focusIndex] === "customModel"}
          />
        </box>
      )}

      {error && (
        <text fg="red" style={{ marginTop: 1 }}>
          {error}
        </text>
      )}

      {saving && (
        <text fg="yellow" style={{ marginTop: 1 }}>
          Saving...
        </text>
      )}

      <text fg="#666666" style={{ marginTop: 1 }}>
        Tab to move focus, arrows to pick model, Enter to confirm
      </text>
    </box>
  );
}
