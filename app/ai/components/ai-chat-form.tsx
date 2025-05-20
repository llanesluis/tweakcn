"use client";

import { Loading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { useAIThemeGeneration, useAIThemeGenerationPrompts } from "@/hooks/use-ai-theme-generation";
import { usePostLoginAction } from "@/hooks/use-post-login-action";
import { toast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { JSONContent } from "@tiptap/react";
import { ArrowUp, Loader, StopCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { usePreviewPanel } from "../hooks/use-preview-panel";
import { LoadingLogo } from "./loading-logo";
import ThemePresetSelect from "./temp-theme-preset-select";
import { useChatLocal } from "../hooks/use-chat-local";
import { ThemeStyles } from "@/types/theme";

const CustomTextarea = dynamic(() => import("@/components/editor/custom-textarea"), {
  ssr: false,
  loading: () => (
    <div className="bg-muted/50 flex h-[60px] w-full animate-pulse flex-col items-center justify-center overflow-hidden rounded-lg">
      <Loading className="w-full" />
    </div>
  ),
});

export function AIChatForm() {
  const { prompt, jsonPrompt, setPrompt, setJsonPrompt } = useAIThemeGenerationPrompts();
  const {
    generateTheme,
    loading: aiGenerateLoading,
    cancelThemeGeneration,
  } = useAIThemeGeneration();

  const { data: session } = authClient.useSession();
  const { openAuthDialog } = useAuthStore();
  const { addUserMessage, addAssistantMessage } = useChatLocal();

  const { setIsPreviewPanelOpen } = usePreviewPanel();
  const handleSuccessfulThemeGeneration = () => {
    setIsPreviewPanelOpen(true);
    // TODO: reset prompts
  };

  usePostLoginAction("AI_GENERATE_FROM_CHAT", async ({ prompt, jsonPrompt }) => {
    if (!prompt || !jsonPrompt) {
      toast({
        title: "Error",
        description: "Failed to generate theme. Please try again.",
      });
      return;
    }

    const theme: ThemeStyles = await generateTheme({
      prompt,
      jsonPrompt,
      onSuccess: handleSuccessfulThemeGeneration,
    });

    // Add assistant message to chat history
    addAssistantMessage({
      content: prompt,
      jsonContent: jsonPrompt,
      themeStyles: theme,
    });
  });

  const handleContentChange = (textContent: string, jsonContent: JSONContent) => {
    setJsonPrompt(JSON.stringify(jsonContent));
    setPrompt(textContent);
  };

  const handleGenerate = async () => {
    if (!session) {
      openAuthDialog("signup", "AI_GENERATE_FROM_CHAT", { prompt, jsonPrompt });
      return;
    }

    // TODO: Improve implementation
    addUserMessage({
      prompt,
      jsonPrompt: JSON.parse(jsonPrompt),
    });

    const theme = await generateTheme({
      prompt,
      jsonPrompt,
      onSuccess: handleSuccessfulThemeGeneration,
    });

    // TODO: Improve implementation
    addAssistantMessage({
      content: prompt,
      jsonContent: JSON.parse(jsonPrompt),
      themeStyles: theme,
    });
  };

  return (
    <div className="@container/form relative transition-all">
      <div className="bg-background relative z-10 flex size-full min-h-[100px] flex-1 flex-col overflow-hidden rounded-lg border shadow-xs">
        <label className="sr-only">Chat Input</label>
        <div className={cn("min-h-[60px] p-2 pb-0", aiGenerateLoading && "pointer-events-none")}>
          <div className="relative isolate" aria-disabled={aiGenerateLoading}>
            <AIChatFormGeneratingFallback aiGenerateLoading={aiGenerateLoading} />
            <CustomTextarea onContentChange={handleContentChange} onGenerate={handleGenerate} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 p-2">
          <div className="flex w-full max-w-68 items-center gap-2 overflow-hidden">
            <ThemePresetSelect disabled={aiGenerateLoading} withCycleThemes={false} />
          </div>

          <div className="flex items-center gap-2">
            {/* TODO: Add image upload */}
            {aiGenerateLoading ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={cancelThemeGeneration}
                className={cn("flex items-center gap-1", "@max-[350px]/form:w-8")}
              >
                <StopCircle />
                <span className="hidden @[350px]/form:inline-flex">Stop</span>
              </Button>
            ) : (
              <Button
                size="icon"
                className="size-8"
                onClick={handleGenerate}
                disabled={!prompt || aiGenerateLoading}
              >
                {aiGenerateLoading ? <Loader className="animate-spin" /> : <ArrowUp />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AIChatFormGeneratingFallback({ aiGenerateLoading }: { aiGenerateLoading: boolean }) {
  return (
    <div
      className={cn(
        "bg-background/50 pointer-events-none absolute inset-0 z-1 flex size-full items-center justify-center opacity-0 backdrop-blur-sm transition-all duration-150 ease-out",
        aiGenerateLoading && "pointer-events-auto opacity-100"
      )}
    >
      <div
        className={cn(
          "text-muted-foreground size-8 scale-0 opacity-0 transition-all duration-150 ease-out md:size-10",
          aiGenerateLoading && "scale-100 opacity-100"
        )}
      >
        <LoadingLogo />
      </div>
    </div>
  );
}
