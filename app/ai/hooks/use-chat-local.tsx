"use client";

import { AssistantMessage, ChatMessage, UserMessage } from "@/types/ai";
import { createContext, ReactNode, useContext, useState } from "react";

interface ChatLocalContextType {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  addUserMessage: (message: UserMessage) => void;
  addAssistantMessage: (message: AssistantMessage) => void;
  clearMessages: () => void;
}

const ChatLocalContext = createContext<ChatLocalContextType | undefined>(undefined);

export function ChatLocalProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const addUserMessage = (message: UserMessage) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: message.prompt,
      jsonContent: message.jsonPrompt,
      role: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
  };

  const addAssistantMessage = (message: AssistantMessage) => {
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: message.content,
      jsonContent: message.jsonContent,
      themeStyles: message.themeStyles,
      role: "assistant",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const chat = {
    messages,
    addMessage,
    addUserMessage,
    addAssistantMessage,
    clearMessages,
  };

  return <ChatLocalContext value={chat}>{children}</ChatLocalContext>;
}

export function useChatLocal() {
  const context = useContext(ChatLocalContext);

  if (context === undefined) {
    throw new Error("useChatLocal must be used within a ChatLocalProvider");
  }

  return context;
}
