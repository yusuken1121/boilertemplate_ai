/**
 * Example Usage of Gemini Gateway
 * 
 * This file demonstrates how to use the GeminiGateway implementation
 * in Server Actions following Clean Architecture principles.
 */

import { createMessage } from '@/core/domain/message.entity';
import { createGeminiGateway } from '@/infrastructure/gemini';

/**
 * Example: Streaming Chat Response
 * 
 * This example shows how to use the Gemini gateway in a Server Action
 * to generate a streaming response.
 */
export async function exampleStreamingChat() {
  // 1. Create the AI gateway (Dependency Injection)
  const aiGateway = createGeminiGateway();

  // 2. Create domain entities (Messages)
  const messages = [
    createMessage('system', 'You are a helpful assistant.'),
    createMessage('user', 'What is Clean Architecture?'),
  ];

  // 3. Call the use case (or directly use the gateway for simple cases)
  const stream = await aiGateway.generateStream(messages, {
    temperature: 0.7,
    maxTokens: 1024,
  });

  // 4. Return the stream (Next.js will handle streaming to the client)
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

/**
 * Example: Non-Streaming Chat Response
 * 
 * This example shows how to get a complete response without streaming.
 */
export async function exampleCompleteChat() {
  // 1. Create the AI gateway
  const aiGateway = createGeminiGateway();

  // 2. Create domain entities
  const messages = [
    createMessage('user', 'Explain dependency injection in one sentence.'),
  ];

  // 3. Get complete response
  const response = await aiGateway.generate(messages, {
    temperature: 0.5,
  });

  return response;
}

/**
 * Example: Multi-turn Conversation
 * 
 * This example shows how to handle a conversation with history.
 */
export async function exampleConversation() {
  const aiGateway = createGeminiGateway();

  const messages = [
    createMessage('system', 'You are a coding tutor.'),
    createMessage('user', 'What is TypeScript?'),
    createMessage('assistant', 'TypeScript is a typed superset of JavaScript...'),
    createMessage('user', 'Can you give me an example?'),
  ];

  const stream = await aiGateway.generateStream(messages);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
