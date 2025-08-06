import { ChatMessage } from "@/types/ai";

export function getUserMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.filter((message) => message.role === "user");
}

export function getLastUserMessage(messages: ChatMessage[]): ChatMessage | undefined {
  return getUserMessages(messages).at(-1);
}

export function getAssistantMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.filter((message) => message.role === "assistant");
}

export function getLastAssistantMessage(messages: ChatMessage[]): ChatMessage | undefined {
  return getAssistantMessages(messages).at(-1);
}
