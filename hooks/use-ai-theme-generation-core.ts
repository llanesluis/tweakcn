import { useAIGenerateChatContext } from "@/hooks/use-ai-generate-chat";
import { AIPromptData } from "@/types/ai";

export function useAIThemeGenerationCore() {
  const { status, sendMessage, stop } = useAIGenerateChatContext();
  const isGeneratingTheme = status === "submitted" || status === "streaming";
  const cancelThemeGeneration = stop;

  const generateThemeCore = async (promptData?: AIPromptData) => {
    if (!promptData) throw new Error("Failed to generate theme. Please try again.");

    sendMessage({
      text: promptData.content,
      metadata: { promptData },
    });
  };

  return {
    generateThemeCore,
    isGeneratingTheme,
    cancelThemeGeneration,
  };
}
