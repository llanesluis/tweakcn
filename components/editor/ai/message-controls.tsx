import { CopyButton } from "@/components/copy-button";
import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";
import { type ChatMessage } from "@/types/ai";
import { ThemeStyles } from "@/types/theme";
import { mergeThemeStylesWithDefaults } from "@/utils/theme-styles";
import { Edit, History, RefreshCw } from "lucide-react";

type MessageControlsProps = {
  message: ChatMessage;
  onRetry?: () => void;
  onEdit?: () => void;
  isGeneratingTheme: boolean;
  isEditing?: boolean;
};

export function MessageControls({
  message,
  onRetry,
  onEdit,
  isGeneratingTheme,
  isEditing,
}: MessageControlsProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const { themeState, setThemeState } = useEditorStore();

  const handleResetThemeToMessageCheckpoint = (themeStyles?: ThemeStyles) => {
    if (!themeStyles) return;

    setThemeState({
      ...themeState,
      styles: mergeThemeStylesWithDefaults(themeStyles),
    });
  };

  const getCopyContent = () => {
    if (isUser && message.metadata) {
      return message.metadata.promptData?.content ?? "";
    }
    return message.parts?.map((part) => (part.type === "text" ? part.text : "")).join("") ?? "";
  };

  if (isUser) {
    return (
      <div
        className={cn(
          "flex gap-2 opacity-0 transition-opacity duration-300 ease-out group-hover/message:opacity-100",
          "justify-end"
        )}
      >
        {onRetry && (
          <TooltipWrapper label="Retry" asChild>
            <Button
              size="icon"
              variant="ghost"
              className="size-6 [&>svg]:size-3.5"
              disabled={isGeneratingTheme}
              onClick={onRetry}
            >
              <RefreshCw />
            </Button>
          </TooltipWrapper>
        )}

        {onEdit && (
          <TooltipWrapper label="Edit" asChild>
            <Button
              size="icon"
              variant="ghost"
              className="size-6 [&>svg]:size-3.5"
              disabled={isGeneratingTheme || isEditing}
              onClick={onEdit}
            >
              <Edit />
            </Button>
          </TooltipWrapper>
        )}

        <CopyButton textToCopy={getCopyContent()} />
      </div>
    );
  }

  if (isAssistant) {
    const themeStyles = message.metadata?.themeStyles;

    return (
      <div
        className={cn(
          "flex gap-2 opacity-0 transition-opacity duration-300 ease-out group-hover/message:opacity-100",
          "justify-start pl-7.5"
        )}
      >
        {onRetry && (
          <TooltipWrapper label="Retry" asChild>
            <Button
              size="icon"
              variant="ghost"
              className="size-6 [&>svg]:size-3.5"
              disabled={isGeneratingTheme}
              onClick={onRetry}
            >
              <RefreshCw />
            </Button>
          </TooltipWrapper>
        )}

        <CopyButton textToCopy={getCopyContent()} />

        {themeStyles && (
          <TooltipWrapper label="Restore checkpoint" asChild>
            <Button
              size="icon"
              variant="ghost"
              className="size-6 [&>svg]:size-3.5"
              disabled={isGeneratingTheme}
              onClick={() => handleResetThemeToMessageCheckpoint(themeStyles)}
            >
              <History />
            </Button>
          </TooltipWrapper>
        )}
      </div>
    );
  }
}
