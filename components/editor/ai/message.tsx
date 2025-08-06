import Logo from "@/assets/logo.svg";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";
import { AIPromptData, type ChatMessage } from "@/types/ai";
import { buildAIPromptRender } from "@/utils/ai/ai-prompt";

import ColorPreview from "../theme-preview/color-preview";
import { ChatImagePreview } from "./chat-image-preview";
import { ChatThemePreview } from "./chat-theme-preview";
import { LoadingLogo } from "./loading-logo";
import { MessageControls } from "./message-controls";
import { MessageEditForm } from "./message-edit-form";

type MessageProps = {
  message: ChatMessage;
  onRetry: () => void;
  isEditing: boolean;
  onEdit: () => void;
  onEditSubmit: (newPromptData: AIPromptData) => void;
  onEditCancel: () => void;
  isLastMessageStreaming: boolean;
  isGeneratingTheme: boolean;
};

export default function Message({
  message,
  onRetry,
  isEditing,
  onEdit,
  onEditSubmit,
  onEditCancel,
  isLastMessageStreaming,
  isGeneratingTheme,
}: MessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <div className={cn("flex w-full items-start gap-4", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex w-full max-w-[90%] items-start")}>
        <div className={cn("group/message relative flex w-full flex-col gap-2")}>
          {isUser && (
            <UserMessage
              message={message}
              isEditing={isEditing}
              onRetry={onRetry}
              onEdit={onEdit}
              onEditSubmit={onEditSubmit}
              onEditCancel={onEditCancel}
              isGeneratingTheme={isGeneratingTheme}
            />
          )}

          {isAssistant && (
            <AssistantMessage message={message} isLastMessageStreaming={isLastMessageStreaming} />
          )}

          {!isLastMessageStreaming && (
            <MessageControls
              message={message}
              onRetry={onRetry}
              onEdit={onEdit}
              isEditing={isEditing}
              isGeneratingTheme={isGeneratingTheme}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface AssistantMessageProps {
  message: ChatMessage;
  isLastMessageStreaming: boolean;
}

function AssistantMessage({ message, isLastMessageStreaming }: AssistantMessageProps) {
  const { themeState } = useEditorStore();

  return (
    <div className="flex items-start gap-1.5">
      {isLastMessageStreaming ? (
        <div className="relative flex size-6 shrink-0 items-center justify-center">
          <LoadingLogo />
        </div>
      ) : (
        <div
          className={cn(
            "border-border/50! bg-foreground relative flex size-6 shrink-0 items-center justify-center rounded-full border select-none",
            message.metadata?.isError && "bg-destructive"
          )}
        >
          <Logo
            className={cn(
              "text-background size-full p-0.5",
              message.metadata?.isError && "text-destructive-foreground"
            )}
          />
        </div>
      )}

      <div className="relative flex flex-col gap-2">
        {message.parts.map((part, idx) => {
          switch (part.type) {
            case "text":
              return (
                <div key={idx} className="w-fit text-sm">
                  {part.text}
                </div>
              );
          }
        })}

        {message.metadata?.themeStyles && (
          <ChatThemePreview themeStyles={message.metadata.themeStyles} className="p-0">
            <ScrollArea className="h-48">
              <div className="p-2">
                <ColorPreview
                  styles={message.metadata.themeStyles}
                  currentMode={themeState.currentMode}
                />
              </div>
            </ScrollArea>
          </ChatThemePreview>
        )}
      </div>
    </div>
  );
}

interface UserMessageProps {
  message: ChatMessage;
  isEditing: boolean;
  onRetry: () => void;
  onEdit: () => void;
  onEditSubmit: (newPromptData: AIPromptData) => void;
  onEditCancel: () => void;
  isGeneratingTheme: boolean;
}

function UserMessage({
  message,
  isEditing,
  onEditSubmit,
  onEditCancel,
  isGeneratingTheme,
}: UserMessageProps) {
  const promptData = message.metadata?.promptData;
  const shouldDisplayMsgContent = promptData?.content?.trim() != "";

  const getDisplayContent = () => {
    if (promptData) {
      return buildAIPromptRender(promptData);
    }

    return message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
  };

  const msgContent = getDisplayContent();

  const getImagesToDisplay = () => {
    const images = promptData?.images ?? [];

    if (images.length === 1) {
      return (
        <div className="self-end">
          <ChatImagePreview src={images[0].url} alt="Image preview" />
        </div>
      );
    } else if (images.length > 1) {
      return (
        <div className="flex flex-row items-center justify-end gap-1 self-end">
          {images.map((image, idx) => (
            <div key={idx} className="aspect-square size-full max-w-32 flex-1">
              <ChatImagePreview
                className="size-full object-cover"
                src={image.url}
                alt="Image preview"
              />
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  const msgImages = getImagesToDisplay();

  if (isEditing) {
    return (
      <MessageEditForm
        key={message.id}
        message={message}
        onEditSubmit={onEditSubmit}
        onEditCancel={onEditCancel}
        disabled={isGeneratingTheme}
      />
    );
  }

  return (
    <div className="relative flex flex-col gap-1">
      {msgImages}

      {shouldDisplayMsgContent && (
        <div
          className={cn(
            "bg-card/75 text-card-foreground/90 border-border/75! w-fit self-end rounded-lg border p-3 text-sm"
          )}
        >
          {msgContent}
        </div>
      )}
    </div>
  );
}
