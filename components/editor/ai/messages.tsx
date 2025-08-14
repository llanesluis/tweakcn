import Logo from "@/assets/logo.svg";
import { ChatContainerContent, ChatContainerRoot } from "@/components/prompt-kit/chat-container";
import { Loader } from "@/components/prompt-kit/loader";
import { ScrollButton } from "@/components/prompt-kit/scroll-button";
import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { Button } from "@/components/ui/button";
import { useAIGenerateChatContext } from "@/hooks/use-ai-generate-chat";
import { useFeedbackText } from "@/hooks/use-feedback-text";
import { cn } from "@/lib/utils";
import { AIPromptData, type ChatMessage } from "@/types/ai";
import { filterMessagesToDisplay, getLastAssistantMessage } from "@/utils/ai/messages";
import { parseAiSdkTransportError } from "@/utils/ai/parse-ai-sdk-transport-error";
import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const { status, error, clearError } = useAIGenerateChatContext();
  const [isScrollTop, setIsScrollTop] = useState(true);
  const previousUserMsgLength = useRef<number>(
    messages.filter((message) => message.role === "user").length
  );

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

  const visibleMessages = useMemo(() => filterMessagesToDisplay(messages), [messages]);

  const showLoadingMessage = useMemo(() => {
    const isSubmitted = status === "submitted";
    const isStreaming = status === "streaming";
    const isError = status === "error";
    const lastAssistantMsgHasText = getLastAssistantMessage(messages)?.parts.some(
      (part) => part.type === "text" && Boolean(part.text)
    );

    return !isError && (isSubmitted || (isStreaming && !lastAssistantMsgHasText));
  }, [status, messages]);

  const feedbackText = useFeedbackText({
    showFeedbackText: showLoadingMessage,
    feedbackMessages: FEEDBACK_MESSAGES,
    rotationIntervalInSeconds: 10,
  });

  const errorText = useMemo(() => {
    if (!error) return undefined;
    const defaultMessage = "Failed to generate theme. Please try again.";
    const normalized = parseAiSdkTransportError(error, defaultMessage);
    return normalized.message ?? defaultMessage;
  }, [error]);

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
            {visibleMessages.map((message, index) => {
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
            {showLoadingMessage && (
              <div className="flex items-start gap-1.5">
                <div className="relative flex size-6 items-center justify-center">
                  <LoadingLogo />
                </div>

                <Loader variant="text-shimmer" text={feedbackText} size="md" />
              </div>
            )}

            {/* Error message when generating theme fails */}
            {status === "error" && error && (
              <div className="flex items-start gap-1.5">
                <div
                  className={cn(
                    "border-border/50! bg-destructive relative flex size-6 shrink-0 items-center justify-center rounded-full border select-none"
                  )}
                >
                  <Logo className={cn("text-destructive-foreground size-full p-0.5")} />
                </div>

                <div
                  className={cn(
                    "bg-destructive/50 text-foreground group/error-banner relative flex w-full gap-2 rounded-lg p-3"
                  )}
                >
                  <span className="text-sm">{errorText}</span>

                  <TooltipWrapper label="Clear error" asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="invisible ml-auto size-4 group-hover/error-banner:visible [&>svg]:size-3"
                      onClick={clearError}
                    >
                      <X />
                    </Button>
                  </TooltipWrapper>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ChatContainerContent>

        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
          <ScrollButton
            variant="outline"
            className="ring-primary/50 pointer-events-auto z-20 size-7 rounded-full shadow-none ring-2"
          />
        </div>
      </ChatContainerRoot>
    </div>
  );
}

const FEEDBACK_MESSAGES = ["Loading...", "Processing your request...", "Just a moment..."];
