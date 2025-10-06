"use client";

import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatContext } from "@/hooks/use-chat-context";
import { MAX_MESSAGES_WINDOW } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AlertCircle, BrainCircuit, MoreVertical, Plus, X } from "lucide-react";
import * as React from "react";

type ContextLimitReachedAlertProps = {
  messageCount: number;
};

export function ContextLimitReachedAlert({ messageCount }: ContextLimitReachedAlertProps) {
  const shouldShow = messageCount >= MAX_MESSAGES_WINDOW;
  const [isMinimized, setIsMinimized] = React.useState(false);
  const { startNewChat } = useChatContext();

  if (!shouldShow) return null;

  if (isMinimized) {
    return (
      <div className="animate-in zoom-in-75 absolute top-0 z-100 px-4" key="minimized-alert">
        <Button
          variant="outline"
          onClick={() => setIsMinimized(false)}
          size="icon"
          className="relative size-8"
        >
          <BrainCircuit className="size-4" />

          <div className="bg-destructive absolute top-1 right-1 size-1.5 animate-bounce rounded-full" />
        </Button>
      </div>
    );
  }

  // Full alert banner centered at the top
  return (
    <div
      key="expanded-alert"
      className={cn("fade-in-100 pointer-events-auto absolute top-0 z-100 w-full px-4")}
    >
      <div
        className={cn(
          "relative flex w-full items-start gap-2 rounded-md border p-3 shadow-sm",
          "bg-muted/90 supports-[backdrop-filter]:bg-muted/80 backdrop-blur"
        )}
      >
        <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-sm font-medium">Context limit reached</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            The context window is limited to the last{" "}
            <span className="font-medium">{MAX_MESSAGES_WINDOW}</span> messages. Consider starting a
            new chat.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <TooltipWrapper label="Actions" asChild>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className={cn("size-6")}>
                  <MoreVertical className="size-3.5!" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipWrapper>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => {
                  startNewChat();
                  setIsMinimized(false);
                }}
                className="cursor-pointer text-sm"
              >
                <Plus />
                Start new chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <TooltipWrapper label="Dismiss" asChild>
            <Button
              onClick={() => setIsMinimized(true)}
              size="icon"
              variant="ghost"
              className={cn("size-6")}
            >
              <X className="size-3.5!" />
            </Button>
          </TooltipWrapper>
        </div>
      </div>
    </div>
  );
}
