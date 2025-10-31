import { createOpenAI } from "@ai-sdk/openai";
import { type LanguageModelV1 } from "ai";
import { createOllama } from "ollama-ai-provider";

/**
 * Centralized model picker function for all presentation generation routes
 * Supports OpenAI, Ollama, LM Studio, and custom API models
 */
export function modelPicker(
  modelProvider: string,
  modelId?: string,
  customBaseURL?: string,
  customApiKey?: string,
): LanguageModelV1 {
  if (modelProvider === "ollama" && modelId) {
    // Use Ollama AI provider
    const ollama = createOllama();
    return ollama(modelId) as unknown as LanguageModelV1;
  }

  if (modelProvider === "lmstudio" && modelId) {
    // Use LM Studio with OpenAI compatible provider
    const lmstudio = createOpenAI({
      name: "lmstudio",
      baseURL: "http://localhost:1234/v1",
      apiKey: "lmstudio",
    });
    return lmstudio(modelId) as unknown as LanguageModelV1;
  }

  if (modelProvider === "custom" && modelId && customBaseURL) {
    // Use custom API with OpenAI compatible provider
    // Ensure baseURL ends with /v1
    const baseURL = customBaseURL.endsWith("/v1")
      ? customBaseURL
      : customBaseURL.endsWith("/")
        ? `${customBaseURL}v1`
        : `${customBaseURL}/v1`;

    const custom = createOpenAI({
      name: "custom",
      baseURL,
      apiKey: customApiKey || "custom",
    });
    return custom(modelId) as unknown as LanguageModelV1;
  }

  // Default to OpenAI
  const openai = createOpenAI();
  return openai("gpt-4o-mini") as unknown as LanguageModelV1;
}
