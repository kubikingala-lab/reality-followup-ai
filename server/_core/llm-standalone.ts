/**
 * Standalone LLM Integration
 * Replaces Manus Forge with OpenAI API
 */

import { ENV } from "./env";
import { GoogleGenerativeAI } from "@google/generative-ai";


export type Role = "system" | "user" | "assistant";

export type Message = {
  role: Role;
  content: string;
};

// Add this for GoogleGenerativeAI to work
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GEMINI_API_KEY?: string;
      OPENAI_API_KEY?: string;
    }
  }
}


export type InvokeParams = {
  messages: Message[];
  model?: string;
  maxTokens?: number;
};

export type InvokeResult = {
  choices: Array<{
    message: {
      role: Role;
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

class StandaloneLLMService {
  private getOpenAIApiKey(): string | undefined {
    return ENV.openaiApiKey || process.env.OPENAI_API_KEY;
  }

  private getOpenAIApiUrl(): string {
    return process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
  }

  private getGeminiApiKey(): string | undefined {
    return ENV.geminiApiKey || process.env.GEMINI_API_KEY;
  }

  /**
   * Invoke LLM API for chat completions (prefers Gemini if configured, otherwise OpenAI)
   */
  async invoke(params: InvokeParams): Promise<InvokeResult> {
    const geminiApiKey = this.getGeminiApiKey();
    const openAIApiKey = this.getOpenAIApiKey();

    if (geminiApiKey) {
      return this.invokeGemini(params, geminiApiKey);
    } else if (openAIApiKey) {
      return this.invokeOpenAI(params, openAIApiKey);
    } else {
      throw new Error(
        "Neither GEMINI_API_KEY nor OPENAI_API_KEY is configured. Set at least one environment variable."
      );
    }
  }

  private async invokeOpenAI(params: InvokeParams, apiKey: string): Promise<InvokeResult> {
    const apiUrl = this.getOpenAIApiUrl();

    const payload = {
      model: params.model || "gpt-4o-mini",
      messages: params.messages,
      max_tokens: params.maxTokens || 1000,
      temperature: 0.7,
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText} - ${error}`
        );
      }

      const data = await response.json();
      return data as InvokeResult;
    } catch (error) {
      console.error("[LLM] Error invoking OpenAI API:", error);
      throw error;
    }
  }

  private async invokeGemini(params: InvokeParams, apiKey: string): Promise<InvokeResult> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: params.model || "gemini-pro" });

    const geminiMessages = params.messages.map((msg) => {
      if (msg.role === "user") return { role: "user", parts: [{ text: msg.content }] };
      if (msg.role === "assistant") return { role: "model", parts: [{ text: msg.content }] };
      return { role: "user", parts: [{ text: msg.content }] }; // System messages are treated as user for Gemini
    });

    try {
      const result = await model.generateContent({
        contents: geminiMessages,
        generationConfig: {
          maxOutputTokens: params.maxTokens || 1000,
          temperature: 0.7,
        },
      });

      const response = result.response;
      const text = response.text();

      return {
        choices: [
          {
            message: {
              role: "assistant",
              content: text,
            },
          },
        ],
      };
    } catch (error) {
      console.error("[LLM] Error invoking Gemini API:", error);
      throw error;
    }
  }
}

export const llmService = new StandaloneLLMService();

/**
 * Wrapper function for backward compatibility
 */
export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  return llmService.invoke(params);
}
