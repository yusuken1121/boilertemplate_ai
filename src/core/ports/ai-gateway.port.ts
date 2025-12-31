/**
 * AI Gateway Port
 * 
 * This interface defines the contract for AI service implementations.
 * It abstracts the underlying AI provider (e.g., Gemini, OpenAI, etc.)
 * following the Dependency Inversion Principle.
 * 
 * Implementations should be placed in src/infrastructure/
 */

import type { Message } from '../domain/message.entity';

/**
 * Configuration options for AI generation
 */
export interface AIGenerateOptions {
  /**
   * Temperature controls randomness (0.0 - 2.0)
   * Lower values make output more focused and deterministic
   */
  temperature?: number;

  /**
   * Maximum number of tokens to generate
   */
  maxTokens?: number;

  /**
   * Top-p sampling parameter (0.0 - 1.0)
   */
  topP?: number;

  /**
   * Model identifier (e.g., 'gemini-pro', 'gpt-4')
   */
  model?: string;

  /**
   * System prompt to guide the AI's behavior
   */
  systemPrompt?: string;
}

/**
 * Interface for AI Gateway implementations
 * 
 * This port must be implemented by infrastructure layer adapters
 * (e.g., GeminiGateway, OpenAIGateway)
 */
export interface IAIGateway {
  /**
   * Generate a streaming response from the AI model
   * 
   * @param messages - Array of conversation messages
   * @param options - Optional configuration for generation
   * @returns ReadableStream of text chunks from the AI
   * @throws Error if the AI service fails or is unavailable
   */
  generateStream(
    messages: Message[],
    options?: AIGenerateOptions
  ): Promise<ReadableStream<string>>;

  /**
   * Generate a complete (non-streaming) response from the AI model
   * 
   * @param messages - Array of conversation messages
   * @param options - Optional configuration for generation
   * @returns Complete response text from the AI
   * @throws Error if the AI service fails or is unavailable
   */
  generate(
    messages: Message[],
    options?: AIGenerateOptions
  ): Promise<string>;
}
