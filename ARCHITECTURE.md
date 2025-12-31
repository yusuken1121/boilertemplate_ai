# Clean Architecture Implementation - Chat Application

This document describes the complete Clean Architecture implementation for the chat application.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  src/app/_components/example-chat.tsx                       │
│  (React Components - User Interface)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Controller Layer                           │
│  src/app/_actions/chat.ts                                   │
│  (Server Actions - Input Validation & DI)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer                           │
│  src/core/use-cases/send-message.use-case.ts                │
│  (Business Logic - Orchestration)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Port Layer                                │
│  src/core/ports/ai-gateway.port.ts                          │
│  (Interfaces - Abstractions)                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                Infrastructure Layer                          │
│  src/infrastructure/gemini/gemini.gateway.ts                │
│  (Concrete Implementations - External SDKs)                 │
└─────────────────────────────────────────────────────────────┘
```

## 📂 File Structure

```
src/
├── core/                           # Domain & Application Layer (Pure TypeScript)
│   ├── domain/
│   │   └── message.entity.ts       # Message entity with factory functions
│   ├── ports/
│   │   └── ai-gateway.port.ts      # IAIGateway interface
│   └── use-cases/
│       └── send-message.use-case.ts # SendMessageUseCase
│
├── infrastructure/                  # Infrastructure Layer
│   └── gemini/
│       ├── gemini.gateway.ts       # GeminiGateway implementation
│       ├── index.ts                # Barrel exports
│       └── example-usage.ts        # Usage examples
│
└── app/                            # UI & Controller Layer
    ├── _actions/
    │   └── chat.ts                 # Server Actions (Composition Root)
    └── _components/
        └── example-chat.tsx        # Example UI component
```

## 🔄 Data Flow

### 1. User Interaction (UI Layer)
```typescript
// User types a message in the UI
const userMessage = createChatMessage('user', 'Hello!');
```

### 2. Server Action (Controller Layer)
```typescript
// Server Action validates input and coordinates
const stream = await sendMessageAction({
  messages: [userMessage],
  options: { temperature: 0.7 }
});
```

### 3. Use Case (Application Layer)
```typescript
// Use case executes business logic
const sendMessageUseCase = new SendMessageUseCase(aiGateway);
const { stream } = await sendMessageUseCase.execute({ messages, options });
```

### 4. Port (Interface)
```typescript
// Use case depends on abstraction, not implementation
interface IAIGateway {
  generateStream(messages: Message[], options?: AIGenerateOptions): Promise<ReadableStream<string>>;
}
```

### 5. Infrastructure (Implementation)
```typescript
// Gemini Gateway implements the port
class GeminiGateway implements IAIGateway {
  async generateStream(messages, options) {
    // Calls Google Generative AI SDK
  }
}
```

## 🎯 Key Principles Demonstrated

### 1. Dependency Inversion Principle (DIP)
- **Use Case** depends on `IAIGateway` interface (abstraction)
- **GeminiGateway** implements the interface (concrete)
- Dependencies point inward (toward domain)

### 2. Dependency Injection (DI)
```typescript
// Composition Root in Server Action
const aiGateway = createGeminiGateway();
const useCase = new SendMessageUseCase(aiGateway);
```

### 3. Single Responsibility Principle (SRP)
- **Entity**: Data structure only
- **Use Case**: Business logic only
- **Gateway**: External service integration only
- **Server Action**: Input validation & coordination only

### 4. Open/Closed Principle (OCP)
- Easy to add new AI providers (OpenAI, Claude) by implementing `IAIGateway`
- No changes needed to use cases or domain layer

## 🚀 Usage Examples

### Basic Streaming Chat
```typescript
import { sendMessageAction, createChatMessage } from '@/app/_actions/chat';

const userMessage = createChatMessage('user', 'Explain Clean Architecture');
const stream = await sendMessageAction({
  messages: [userMessage],
  options: { temperature: 0.7 }
});

// Read the stream
const reader = stream.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(new TextDecoder().decode(value));
}
```

### Non-Streaming Response
```typescript
import { sendMessageCompleteAction, createChatMessage } from '@/app/_actions/chat';

const userMessage = createChatMessage('user', 'What is TypeScript?');
const response = await sendMessageCompleteAction({
  messages: [userMessage],
  options: { temperature: 0.5 }
});

console.log(response);
```

### Multi-turn Conversation
```typescript
const messages = [
  createChatMessage('system', 'You are a helpful coding assistant.'),
  createChatMessage('user', 'What is Clean Architecture?'),
  createChatMessage('assistant', 'Clean Architecture is...'),
  createChatMessage('user', 'Can you give an example?'),
];

const stream = await sendMessageAction({ messages });
```

## 🔧 Configuration

### Environment Variables
```bash
# .env.local
GEMINI_API_KEY=your_api_key_here
```

### AI Options
```typescript
{
  temperature: 0.7,      // 0.0 - 2.0 (creativity)
  maxTokens: 2048,       // Maximum response length
  topP: 0.9,             // Nucleus sampling
  model: 'gemini-2.0-flash-exp', // Model identifier
  systemPrompt: 'You are...' // System instructions
}
```

## 🧪 Testing Strategy

### Unit Tests (Core Layer)
```typescript
// Test use case with mock gateway
const mockGateway: IAIGateway = {
  generateStream: jest.fn(),
  generate: jest.fn(),
};

const useCase = new SendMessageUseCase(mockGateway);
```

### Integration Tests (Infrastructure)
```typescript
// Test real Gemini integration
const gateway = new GeminiGateway(TEST_API_KEY);
const stream = await gateway.generateStream([testMessage]);
```

## 📝 Adding New AI Providers

To add a new AI provider (e.g., OpenAI):

1. **Create implementation** in `src/infrastructure/openai/`:
```typescript
export class OpenAIGateway implements IAIGateway {
  async generateStream(messages: Message[], options?: AIGenerateOptions) {
    // Implement using OpenAI SDK
  }
}
```

2. **Update Server Action** to use new gateway:
```typescript
const aiGateway = createOpenAIGateway(); // Instead of createGeminiGateway()
```

3. **No changes needed** to:
   - Domain entities
   - Use cases
   - Ports
   - UI components

## 🎓 Benefits of This Architecture

1. **Testability**: Easy to mock dependencies for unit testing
2. **Maintainability**: Clear separation of concerns
3. **Flexibility**: Swap implementations without changing business logic
4. **Scalability**: Add features without modifying existing code
5. **Framework Independence**: Core logic doesn't depend on Next.js or React

## 📚 Further Reading

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
