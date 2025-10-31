import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface ModelInfo {
  id: string;
  name: string;
  provider: "ollama" | "lmstudio" | "custom";
}

interface OllamaResponse {
  models?: Array<{ name: string }>;
}

interface LMStudioResponse {
  data?: Array<{ id: string }>;
}

// Fetch models from Ollama
async function fetchOllamaModels(): Promise<ModelInfo[]> {
  try {
    const response = await fetch("http://localhost:11434/api/tags");
    if (!response.ok) {
      throw new Error("Ollama not available");
    }

    const data = (await response.json()) as OllamaResponse;
    if (!data.models || !Array.isArray(data.models)) {
      return [];
    }

    return data.models.map((model) => ({
      id: `ollama-${model.name}`,
      name: model.name,
      provider: "ollama" as const,
    }));
  } catch (error) {
    console.log("Ollama not available:", error);
    return [];
  }
}

// Fetch models from LM Studio
async function fetchLMStudioModels(): Promise<ModelInfo[]> {
  try {
    const response = await fetch("http://localhost:1234/v1/models");

    const data = (await response.json()) as LMStudioResponse;

    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }
    console.log("lmstudio models", data);

    return data.data.map((model) => ({
      id: `lmstudio-${model.id}`,
      name: model.id,
      provider: "lmstudio" as const,
    }));
  } catch (error) {
    console.log("LM Studio not available:", error);
    return [];
  }
}

// Fetch models from custom baseURL
async function fetchCustomModels(baseURL: string): Promise<ModelInfo[]> {
  try {
    if (!baseURL) {
      return [];
    }
    
    // Ensure baseURL ends with /v1/models
    const url = baseURL.endsWith("/v1/models") 
      ? baseURL 
      : baseURL.endsWith("/") 
        ? `${baseURL}v1/models` 
        : `${baseURL}/v1/models`;

    const response = await fetch(url);

    if (!response.ok) {
      console.log("Custom API not available:", response.statusText);
      return [];
    }

    const data = (await response.json()) as LMStudioResponse;

    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }
    console.log("custom models", data);

    return data.data.map((model) => ({
      id: `custom-${model.id}`,
      name: model.id,
      provider: "custom" as const,
    }));
  } catch (error) {
    console.log("Custom API not available:", error);
    return [];
  }
}

// Fetch all local models
async function fetchLocalModels(customBaseURL?: string): Promise<ModelInfo[]> {
  const [ollamaModels, lmStudioModels, customModels] = await Promise.all([
    fetchOllamaModels(),
    fetchLMStudioModels(),
    customBaseURL ? fetchCustomModels(customBaseURL) : Promise.resolve([]),
  ]);

  return [...ollamaModels, ...lmStudioModels, ...customModels];
}

// Popular downloadable models for Ollama
export const downloadableModels: ModelInfo[] = [
  {
    id: "ollama-llama3.1:8b",
    name: "llama3.1:8b",
    provider: "ollama",
  },
  {
    id: "ollama-llama3.1:70b",
    name: "llama3.1:70b",
    provider: "ollama",
  },
  {
    id: "ollama-llama3.2:3b",
    name: "llama3.2:3b",
    provider: "ollama",
  },
  {
    id: "ollama-llama3.2:8b",
    name: "llama3.2:8b",
    provider: "ollama",
  },
  {
    id: "ollama-mistral:7b",
    name: "mistral:7b",
    provider: "ollama",
  },
  {
    id: "ollama-codellama:7b",
    name: "codellama:7b",
    provider: "ollama",
  },
  {
    id: "ollama-qwen2.5:7b",
    name: "qwen2.5:7b",
    provider: "ollama",
  },
  {
    id: "ollama-gemma2:9b",
    name: "gemma2:9b",
    provider: "ollama",
  },
  {
    id: "ollama-phi3:3.8b",
    name: "phi3:3.8b",
    provider: "ollama",
  },
  {
    id: "ollama-neural-chat:7b",
    name: "neural-chat:7b",
    provider: "ollama",
  },
];

// Fallback models when no local models are available (same as downloadable for now)
export const fallbackModels: ModelInfo[] = downloadableModels;

// localStorage keys
const MODELS_CACHE_KEY = "presentation-models-cache";
const SELECTED_MODEL_KEY = "presentation-selected-model";
const CACHE_EXPIRY_KEY = "presentation-models-cache-expiry";
const CUSTOM_BASE_URL_KEY = "presentation-custom-base-url";
const CUSTOM_API_KEY_KEY = "presentation-custom-api-key";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// localStorage utilities
function getCachedModels(): ModelInfo[] | null {
  try {
    const cached = localStorage.getItem(MODELS_CACHE_KEY);
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);

    if (cached && expiry && Date.now() < parseInt(expiry)) {
      return JSON.parse(cached);
    }
    return null;
  } catch {
    return null;
  }
}

function setCachedModels(models: ModelInfo[]): void {
  try {
    localStorage.setItem(MODELS_CACHE_KEY, JSON.stringify(models));
    localStorage.setItem(
      CACHE_EXPIRY_KEY,
      (Date.now() + CACHE_DURATION).toString(),
    );
  } catch {
    // Ignore localStorage errors
  }
}

export function getSelectedModel(): {
  modelProvider: string;
  modelId: string;
} | null {
  try {
    const selected = localStorage.getItem(SELECTED_MODEL_KEY);
    console.log("Getting selected model from localStorage:", selected);
    return selected ? JSON.parse(selected) : null;
  } catch (error) {
    console.error("Error getting selected model from localStorage:", error);
    return null;
  }
}

export function setSelectedModel(modelProvider: string, modelId: string): void {
  try {
    const data = { modelProvider, modelId };
    localStorage.setItem(SELECTED_MODEL_KEY, JSON.stringify(data));
    console.log("Saved model to localStorage:", data);
  } catch (error) {
    console.error("Error saving model to localStorage:", error);
  }
}

export function getCustomBaseURL(): string {
  try {
    return localStorage.getItem(CUSTOM_BASE_URL_KEY) || "";
  } catch (error) {
    console.error("Error getting custom baseURL from localStorage:", error);
    return "";
  }
}

export function setCustomBaseURL(url: string): void {
  try {
    localStorage.setItem(CUSTOM_BASE_URL_KEY, url);
    console.log("Saved custom baseURL to localStorage:", url);
  } catch (error) {
    console.error("Error saving custom baseURL to localStorage:", error);
  }
}

export function getCustomApiKey(): string {
  try {
    return localStorage.getItem(CUSTOM_API_KEY_KEY) || "";
  } catch (error) {
    console.error("Error getting custom API key from localStorage:", error);
    return "";
  }
}

export function setCustomApiKey(key: string): void {
  try {
    localStorage.setItem(CUSTOM_API_KEY_KEY, key);
    console.log("Saved custom API key to localStorage");
  } catch (error) {
    console.error("Error saving custom API key to localStorage:", error);
  }
}

export function useLocalModels(customBaseURL?: string) {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Get cached models for initial load
  const cachedModels = getCachedModels();

  const query = useQuery({
    queryKey: ["local-models", customBaseURL],
    queryFn: async () => {
      const freshModels = await fetchLocalModels(customBaseURL);
      setCachedModels(freshModels);
      return freshModels;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
    initialData: cachedModels || undefined,
    select: (data) => {
      const localModels = data.length > 0 ? data : fallbackModels;
      const showDownloadable = localModels.length < 10;

      return {
        localModels,
        downloadableModels: showDownloadable ? downloadableModels : [],
        showDownloadable,
      };
    },
  });

  // Mark initial load as complete after first render
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  return {
    ...query,
    isInitialLoad,
  };
}
