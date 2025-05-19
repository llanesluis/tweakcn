import Logo from "@/assets/logo.svg";
import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";
import { type ChatMessage } from "@/types/ai";
import { ThemeStyles } from "@/types/theme";
import { Copy, CopyCheck, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChatLocal } from "../hooks/use-chat-local";
import { useAIThemeGeneration } from "@/hooks/use-ai-theme-generation";

export function ChatMessages() {
  const [isScrollTop, setIsScrollTop] = useState(true);
  const { messages } = useChatLocal();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Toggle top fade out effect when scrolling
  useEffect(() => {
    const scrollInnerContainer = document.getElementById("scroll-inner-container");
    if (!scrollInnerContainer) return;

    const handleScroll = () => setIsScrollTop(scrollInnerContainer?.scrollTop === 0);
    scrollInnerContainer.addEventListener("scroll", handleScroll);

    return () => scrollInnerContainer.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top fade out effect when scrolling */}
      <div
        className={cn(
          "via-background/50 from-background pointer-events-none absolute top-0 right-4 left-0 z-20 h-8 bg-gradient-to-b to-transparent opacity-100 transition-opacity ease-out",
          isScrollTop ? "opacity-0" : "opacity-100"
        )}
      />
      <div
        id="scroll-inner-container"
        className="scrollbar-thin relative size-full overflow-y-auto py-2 pr-2"
      >
        <div className="flex flex-col gap-12 text-pretty wrap-anywhere">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
        <div ref={messagesEndRef} className="mt-4" />
      </div>
    </>
  );
}

type ChatMessageProps = {
  message: ChatMessage;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const { data: session } = authClient.useSession();
  const isUser = message.role === "user";

  const { hasCopied, copyToClipboard } = useCopyToClipboard();
  const { themeState, setThemeState } = useEditorStore();
  const { loading: isAIGenerating } = useAIThemeGeneration();

  const handleResetThemeToMessageCheckpoint = (themeStyles?: ThemeStyles) => {
    if (!themeStyles) return;

    setThemeState({
      ...themeState,
      styles: themeStyles,
    });
  };

  return (
    <div className={cn("flex items-start gap-4", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[90%] items-start gap-3", isUser && "flex-row-reverse")}>
        <div className="relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-lg border select-none">
          {isUser ? (
            <Avatar className="size-full rounded-lg">
              <AvatarImage src={session?.user.image || ""} alt={session?.user.name || ""} />
              <AvatarFallback>{session?.user.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="bg-muted p-0.5">
              <Logo className="size-full" />
            </div>
          )}
        </div>

        <div className="group/message relative">
          <p
            className={cn(
              "rounded-lg text-sm",
              isUser ? "bg-muted/80 text-foreground/80 border-border/50! rounded-lg border p-4" : ""
            )}
          >
            {message.content}
          </p>

          <div
            className={cn(
              "flex gap-2 pt-2 opacity-0 transition-opacity duration-300 ease-out group-hover/message:opacity-100",
              isUser ? "justify-end" : "justify-start"
            )}
          >
            <TooltipWrapper label="Copy" asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-6 [&>svg]:size-3.5"
                onClick={() => copyToClipboard(message.content)}
              >
                {hasCopied ? <CopyCheck /> : <Copy />}
              </Button>
            </TooltipWrapper>

            {message.role === "assistant" && (
              <TooltipWrapper label="Reset to this checkpoint" asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-6 [&>svg]:size-3.5"
                  disabled={!message.themeStyles || isAIGenerating}
                  onClick={() => handleResetThemeToMessageCheckpoint(message.themeStyles)}
                >
                  <RotateCcw />
                </Button>
              </TooltipWrapper>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
