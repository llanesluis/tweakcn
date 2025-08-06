"use client";

import { SUBSCRIPTION_STATUS_QUERY_KEY } from "@/hooks/use-subscription";
import { toast } from "@/hooks/use-toast";
import { useAIChatStore } from "@/store/ai-chat-store";
import { ChatMessage } from "@/types/ai";
import { ApiError } from "@/types/errors";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import { createContext, useContext, useEffect, useRef } from "react";

interface AIGenerateChatContext extends ReturnType<typeof useChat<ChatMessage>> {
  startNewChat: () => void;
  resetMessagesUpToIndex: (index: number) => void;
}

const AIGenerateChatContext = createContext<AIGenerateChatContext | null>(null);

export function AIGenerateChatProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const storedMessages = useAIChatStore((s) => s.messages);
  const setStoredMessages = useAIChatStore((s) => s.setMessages);
  const chatId = useAIChatStore((s) => s.chatId);

  const hasStoreHydrated = useAIChatStore((s) => s.hasHydrated);
  const hasInitializedRef = useRef(false);

  const chat = useChat<ChatMessage>({
    id: chatId,
    messages: storedMessages || [],
    transport: new DefaultChatTransport({
      api: "/api/generate-theme",
    }),
    onError: (error) => {
      let message = "Failed to generate theme. Please try again.";

      if (error instanceof Error && error.name === "AbortError") {
        message = "The theme generation was cancelled, no changes were made.";
        toast({
          title: "Theme generation cancelled",
          description: message,
        });
      } else if (error instanceof ApiError) {
        if (error.code === "SUBSCRIPTION_REQUIRED") {
          toast({
            title: "Subscription required",
            description: error.message,
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        const description = error instanceof Error ? error.message : message;
        toast({
          title: "Error",
          description,
          variant: "destructive",
        });
      }
    },
    onFinish: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_STATUS_QUERY_KEY] });

      if (message.metadata?.themeStyles) {
        // TODO: Apply the theme to the editor

        toast({
          title: "Theme generated",
          description: "Your AI-generated theme has been applied.",
        });
      }
    },
  });

  const startNewChat = () => {
    chat.setMessages([]);
  };

  const resetMessagesUpToIndex = (index: number) => {
    const newMessages = chat.messages.slice(0, index);
    chat.setMessages(newMessages);
  };

  useEffect(() => {
    if (!hasInitializedRef.current) return;
    setStoredMessages(chat.messages);
  }, [chat.messages]);

  useEffect(() => {
    if (!hasStoreHydrated || hasInitializedRef.current) return;
    chat.setMessages(storedMessages);
    hasInitializedRef.current = true;
  }, [hasStoreHydrated, storedMessages]);

  return (
    <AIGenerateChatContext.Provider value={{ ...chat, startNewChat, resetMessagesUpToIndex }}>
      {children}
    </AIGenerateChatContext.Provider>
  );
}

export function useAIGenerateChatContext() {
  const ctx = useContext(AIGenerateChatContext);

  if (!ctx) {
    throw new Error("useAIGenerateChatContext must be used within an AIGenerateChatProvider");
  }

  return ctx;
}
