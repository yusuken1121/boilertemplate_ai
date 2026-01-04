/**
 * Example Chat Component
 *
 * This demonstrates how to use the Server Actions from a Client Component.
 * This is for reference only - showing the complete flow from UI to Core.
 */

"use client";

import { useState } from "react";
import { sendMessageAction } from "@/app/_actions/chat";
import { createChatMessage } from "@/lib/chat-utils";
import type { Message } from "@/core/domain/message.entity";

export function ExampleChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    setIsLoading(true);
    setStreamingResponse("");

    // Create user message
    const userMessage = createChatMessage("user", input);
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");

    try {
      // Call the Server Action
      const stream = await sendMessageAction({
        messages: updatedMessages,
        options: {
          temperature: 0.7,
          maxTokens: 2048,
        },
      });

      // Read the stream
      const reader = stream.getReader();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Value is already a string from our ReadableStream<string>
        fullResponse += value;
        setStreamingResponse(fullResponse);
      }

      // Add assistant message to history
      const assistantMessage = createChatMessage("assistant", fullResponse);
      setMessages([...updatedMessages, assistantMessage]);
      setStreamingResponse("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.role === "user"
                ? "bg-blue-100 ml-auto max-w-[80%]"
                : "bg-gray-100 mr-auto max-w-[80%]"
            }`}
          >
            <div className="font-semibold mb-1">
              {message.role === "user" ? "You" : "AI"}
            </div>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}

        {streamingResponse && (
          <div className="p-4 rounded-lg bg-gray-100 mr-auto max-w-[80%]">
            <div className="font-semibold mb-1">AI</div>
            <div className="whitespace-pre-wrap">{streamingResponse}</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
