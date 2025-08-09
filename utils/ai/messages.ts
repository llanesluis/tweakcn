import { ChatMessage } from "@/types/ai";

function filterMessagesToDisplay(messages: ChatMessage[]): ChatMessage[] {
  return messages.filter((message) =>
    message.parts.some((part) => part.type === "text" && Boolean(part.text))
  );
}

function getUserMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.filter((message) => message.role === "user");
}

function getLastUserMessage(messages: ChatMessage[]): ChatMessage | undefined {
  return getUserMessages(messages).at(-1);
}

function getAssistantMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.filter((message) => message.role === "assistant");
}

function getLastAssistantMessage(messages: ChatMessage[]): ChatMessage | undefined {
  return getAssistantMessages(messages).at(-1);
}

export {
  filterMessagesToDisplay,
  getAssistantMessages,
  getLastAssistantMessage,
  getLastUserMessage,
  getUserMessages,
};
