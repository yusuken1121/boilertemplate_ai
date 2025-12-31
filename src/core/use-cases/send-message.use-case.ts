/**
 * Send Message Use Case
 * 
 * Application-specific business logic for sending a message to the AI
 * and receiving a streaming response.
 * 
 * This use case orchestrates the flow:
 * 1. Validates the input messages
 * 2. Calls the AI Gateway to generate a response
 * 3. Returns the streaming response
 */

import type { IAIGateway, AIGenerateOptions } from '../ports/ai-gateway.port';
import type { Message } from '../domain/message.entity';

/**
 * Input for the SendMessage use case
 */
export interface SendMessageInput {
  /**
   * The conversation history including the new user message
   */
  messages: Message[];

  /**
   * Optional configuration for AI generation
   */
  options?: AIGenerateOptions;
}

/**
 * Output from the SendMessage use case
 */
export interface SendMessageOutput {
  /**
   * Streaming response from the AI
   */
  stream: ReadableStream<string>;
}

/**
 * SendMessageUseCase
 * 
 * Handles the business logic for sending a message to the AI.
 * Depends on IAIGateway abstraction (Dependency Inversion Principle).
 */
export class SendMessageUseCase {
  constructor(private readonly aiGateway: IAIGateway) {}

  /**
   * Execute the use case
   * 
   * @param input - The messages and options
   * @returns Streaming response from the AI
   * @throws Error if validation fails or AI service is unavailable
   */
  async execute(input: SendMessageInput): Promise<SendMessageOutput> {
    // Validate input
    this.validateInput(input);

    // Call the AI gateway to generate streaming response
    const stream = await this.aiGateway.generateStream(
      input.messages,
      input.options
    );

    return { stream };
  }

  /**
   * Validate the input messages
   * 
   * @param input - The input to validate
   * @throws Error if validation fails
   */
  private validateInput(input: SendMessageInput): void {
    if (!input.messages || input.messages.length === 0) {
      throw new Error('Messages array cannot be empty');
    }

    // Ensure at least one user message exists
    const hasUserMessage = input.messages.some(msg => msg.role === 'user');
    if (!hasUserMessage) {
      throw new Error('At least one user message is required');
    }

    // Validate each message has content
    for (const message of input.messages) {
      if (!message.content || message.content.trim().length === 0) {
        throw new Error(`Message with id ${message.id} has empty content`);
      }
    }
  }

  /**
   * Execute the use case with non-streaming response
   * 
   * @param input - The messages and options
   * @returns Complete response text from the AI
   * @throws Error if validation fails or AI service is unavailable
   */
  async executeNonStreaming(input: SendMessageInput): Promise<string> {
    // Validate input
    this.validateInput(input);

    // Call the AI gateway to generate complete response
    const response = await this.aiGateway.generate(
      input.messages,
      input.options
    );

    return response;
  }
}
