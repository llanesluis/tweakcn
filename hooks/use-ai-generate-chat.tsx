"use client";

import { SUBSCRIPTION_STATUS_QUERY_KEY } from "@/hooks/use-subscription";
import { toast } from "@/hooks/use-toast";
import { useAIChatStore } from "@/store/ai-chat-store";
import { ChatMessage } from "@/types/ai";

import { parseAiSdkTransportError } from "@/utils/ai/parse-ai-sdk-transport-error";
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
      const defaultMessage = "Failed to generate theme. Please try again.";
      const normalizedError = parseAiSdkTransportError(error, defaultMessage);

      toast({
        title: "An error occurred",
        description: normalizedError.message,
        variant: "destructive",
      });
    },
    onFinish: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_STATUS_QUERY_KEY] });

      // TBD: Apply the theme to the editor when the assistant has the themeStyles attached to the metadata?
      const themeStyles = message.metadata?.themeStyles;
      if (themeStyles) {
        // applyGeneratedTheme(themeStyles);
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

    // Only update the stored messages when the chat is not currently processing a request
    if (chat.status === "ready" || chat.status === "error") {
      console.log("----- ✅ Updating Stored Messages -----");
      setStoredMessages(chat.messages);
    }
  }, [chat.status, chat.messages]);

  useEffect(() => {
    if (!hasStoreHydrated || hasInitializedRef.current) return;

    if (storedMessages.length > 0) {
      console.log("----- ☑️ Populating Chat with Stored Messages -----");
      chat.setMessages(storedMessages);
    }

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
