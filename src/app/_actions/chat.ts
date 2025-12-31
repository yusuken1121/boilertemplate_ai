/**
 * Chat Server Actions
 * 
 * This is the Composition Root where we wire up dependencies.
 * Server Actions serve as Controllers/Adapters between the UI and Use Cases.
 */

'use server';

import { z } from 'zod';
import { createGeminiGateway } from '@/infrastructure/gemini';
import { SendMessageUseCase } from '@/core/use-cases/send-message.use-case';
import type { Message } from '@/core/domain/message.entity';
import { createMessage } from '@/core/domain/message.entity';

/**
 * Zod schema for message validation
 */
const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'Message content cannot be empty'),
  createdAt: z.coerce.date(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Zod schema for the send message action input
 */
const SendMessageInputSchema = z.object({
  messages: z.array(MessageSchema).min(1, 'At least one message is required'),
  options: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().positive().optional(),
      topP: z.number().min(0).max(1).optional(),
      model: z.string().optional(),
      systemPrompt: z.string().optional(),
    })
    .optional(),
});

/**
 * Send Message Action (Streaming)
 * 
 * This Server Action handles sending a message to the AI and streaming the response.
 * It follows Clean Architecture by:
 * 1. Validating input (Controller responsibility)
 * 2. Creating infrastructure implementations (Composition Root)
 * 3. Injecting dependencies into use cases (Dependency Injection)
 * 4. Calling the use case
 * 5. Returning a standard Web ReadableStream
 * 
 * @param input - The chat history and options
 * @returns ReadableStream for streaming response
 */
export async function sendMessageAction(input: {
  messages: Message[];
  options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    model?: string;
    systemPrompt?: string;
  };
}): Promise<ReadableStream<string>> {
  try {
    // 1. Validate input using Zod
    const validatedInput = SendMessageInputSchema.parse(input);

    // 2. Composition Root: Create infrastructure implementations
    const aiGateway = createGeminiGateway();

    // 3. Dependency Injection: Create use case with dependencies
    const sendMessageUseCase = new SendMessageUseCase(aiGateway);

    // 4. Execute the use case
    const { stream } = await sendMessageUseCase.execute({
      messages: validatedInput.messages,
      options: validatedInput.options,
    });

    // 5. Return the stream directly
    return stream;
  } catch (error) {
    console.error('Error in sendMessageAction:', error);
    
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((e) => e.message).join(', ');
      throw new Error(`Validation error: ${errorMessage}`);
    }
    
    throw error;
  }
}

/**
 * Send Message Action (Non-Streaming)
 * 
 * Alternative action for getting a complete response without streaming.
 * 
 * @param input - The chat history and options
 * @returns Complete response text
 */
export async function sendMessageCompleteAction(input: {
  messages: Message[];
  options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    model?: string;
    systemPrompt?: string;
  };
}): Promise<string> {
  try {
    // 1. Validate input
    const validatedInput = SendMessageInputSchema.parse(input);

    // 2. Create infrastructure implementations
    const aiGateway = createGeminiGateway();

    // 3. Create use case with dependencies
    const sendMessageUseCase = new SendMessageUseCase(aiGateway);

    // 4. Execute the use case (non-streaming)
    const response = await sendMessageUseCase.executeNonStreaming({
      messages: validatedInput.messages,
      options: validatedInput.options,
    });

    return response;
  } catch (error) {
    console.error('Error in sendMessageCompleteAction:', error);
    
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((e) => e.message).join(', ');
      throw new Error(`Validation error: ${errorMessage}`);
    }
    
    throw error;
  }
}

/**
 * Helper function to create a new chat message
 * Exported for use in client components
 */
export function createChatMessage(
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: Record<string, unknown>
) {
  return createMessage(role, content, undefined, metadata);
}
