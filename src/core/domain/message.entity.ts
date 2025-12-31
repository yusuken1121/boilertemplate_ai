/**
 * Message Entity
 * 
 * Represents a single chat message in the conversation.
 * This is a pure domain entity with no external dependencies.
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  /**
   * Unique identifier for the message
   */
  id: string;

  /**
   * The role of the message sender
   */
  role: MessageRole;

  /**
   * The content of the message
   */
  content: string;

  /**
   * Timestamp when the message was created
   */
  createdAt: Date;

  /**
   * Optional metadata for the message
   */
  metadata?: Record<string, unknown>;
}

/**
 * Factory function to create a new Message entity
 */
export function createMessage(
  role: MessageRole,
  content: string,
  id?: string,
  metadata?: Record<string, unknown>
): Message {
  return {
    id: id ?? crypto.randomUUID(),
    role,
    content,
    createdAt: new Date(),
    metadata,
  };
}

/**
 * Type guard to check if an object is a valid Message
 */
export function isMessage(obj: unknown): obj is Message {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const msg = obj as Partial<Message>;

  return (
    typeof msg.id === 'string' &&
    (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system') &&
    typeof msg.content === 'string' &&
    msg.createdAt instanceof Date
  );
}
