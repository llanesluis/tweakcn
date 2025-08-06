import { ChatContainerContent, ChatContainerRoot } from "@/components/prompt-kit/chat-container";
import { ScrollButton } from "@/components/prompt-kit/scroll-button";
import { useAIGenerateChatContext } from "@/hooks/use-ai-generate-chat";
import { cn } from "@/lib/utils";
import { AIPromptData, type ChatMessage } from "@/types/ai";
import { useEffect, useRef, useState } from "react";
import { LoadingLogo } from "./loading-logo";
import Message from "./message";

type ChatMessagesProps = {
  messages: ChatMessage[];
  onRetry: (messageIndex: number) => void;
  onEdit: (messageIndex: number) => void;
  onEditSubmit: (messageIndex: number, newPromptData: AIPromptData) => void;
  onEditCancel: () => void;
  editingMessageIndex?: number | null;
  isGeneratingTheme: boolean;
};

export function Messages({
  messages,
  onRetry,
  onEdit,
  onEditSubmit,
  onEditCancel,
  editingMessageIndex,
  isGeneratingTheme,
}: ChatMessagesProps) {
  const { status } = useAIGenerateChatContext();
  const [isScrollTop, setIsScrollTop] = useState(true);
  const previousUserMsgLength = useRef<number>(
    messages.filter((message) => message.role === "user").length
  );

  const isSubmitting = status === "submitted";
  const feedbackText = useFeedbackText(isSubmitting);

  const messagesStartRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when user submits a new message
  useEffect(() => {
    if (messagesEndRef.current) {
      // When switching tabs, messages do not change, so we don't need to animate the scroll
      const currentUserMsgCount = messages.filter((message) => message.role === "user").length;
      const didUserMsgCountChange = previousUserMsgLength.current !== currentUserMsgCount;

      if (didUserMsgCountChange) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        previousUserMsgLength.current = currentUserMsgCount;
      }
    }
  }, [messages]);

  // Toggle top fade out effect when scrolling
  useEffect(() => {
    const startMarker = messagesStartRef.current;

    if (!startMarker) return;

    const observerOptions = {
      root: null, // Use viewport as root for more reliable detection
      threshold: 0,
    };

    const startMessagesObserver = new IntersectionObserver(([entry]) => {
      setIsScrollTop(entry.isIntersecting);
    }, observerOptions);

    startMessagesObserver.observe(startMarker);

    return () => startMessagesObserver.disconnect();
  }, []);

  return (
    <div className="relative size-full">
      {/* Top fade out effect when scrolling */}
      <div
        className={cn(
          "via-background/50 from-background pointer-events-none absolute top-0 right-0 left-0 z-20 h-6 bg-gradient-to-b to-transparent opacity-100 transition-opacity ease-out",
          isScrollTop ? "opacity-0" : "opacity-100"
        )}
      />
      <ChatContainerRoot className="scrollbar-thin relative flex size-full overflow-hidden">
        <ChatContainerContent className="flex-1">
          <div ref={messagesStartRef} />
          <div className="flex flex-col gap-8 px-4 pt-2 pb-8 wrap-anywhere whitespace-pre-wrap">
            {messages.map((message, index) => {
              const isLastMessage = index === messages.length - 1;
              const isStreaming = status === "submitted" || status === "streaming";
              const isLastMessageStreaming =
                message.role === "assistant" && isStreaming && isLastMessage;
              return (
                <Message
                  key={message.id}
                  message={message}
                  onRetry={() => onRetry(index)}
                  isEditing={editingMessageIndex === index}
                  onEdit={() => onEdit(index)}
                  onEditSubmit={(newPromptData) => onEditSubmit(index, newPromptData)}
                  onEditCancel={onEditCancel}
                  isLastMessageStreaming={isLastMessageStreaming}
                  isGeneratingTheme={isGeneratingTheme}
                />
              );
            })}

            {/* Loading message when AI is generating */}
            {isSubmitting && (
              <div className="flex gap-1.5 pb-8">
                <div className="relative flex size-6 items-center justify-center">
                  <LoadingLogo />
                </div>

                <p className="inline-flex animate-pulse gap-0.25 delay-150">
                  <span className="text-sm">{feedbackText}</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                  <span className="animate-bounce delay-300">.</span>
                </p>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ChatContainerContent>

        <div className="absolute inset-x-0 bottom-2 z-20 flex justify-center">
          <ScrollButton
            variant="outline"
            className="ring-primary/50 size-7 rounded-full shadow-none ring-2"
          />
        </div>
      </ChatContainerRoot>
    </div>
  );
}

const FEEDBACK_MESSAGES = [
  "Generating", // 0-7s
  "Tweaking color tokens", // 8-15s
  "This might take some time", // 16-23s
  "Generating a good theme takes time", // 24-31s
  "Still working on your theme", // 32-39s
  "Almost there", // 40s+
];

const ROTATION_INTERVAL_IN_SECONDS = 8;

function useFeedbackText(isSubmitting: boolean) {
  const [elapsedTimeGenerating, setElapsedTimeGenerating] = useState(0);
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isSubmitting) {
      setElapsedTimeGenerating(0);

      interval = setInterval(() => {
        setElapsedTimeGenerating((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTimeGenerating(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSubmitting]);

  const feedbackIndex = Math.min(
    Math.floor(elapsedTimeGenerating / ROTATION_INTERVAL_IN_SECONDS),
    FEEDBACK_MESSAGES.length - 1
  );
  const feedbackText = FEEDBACK_MESSAGES[feedbackIndex];
  return feedbackText;
}
