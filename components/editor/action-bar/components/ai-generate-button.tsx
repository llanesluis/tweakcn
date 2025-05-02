import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { useEditorStore } from "@/store/editor-store";
import { JSONContent } from "@tiptap/react";
import { useThemePresetStore } from "@/store/theme-preset-store";
import { AIGenerateDialog } from "@/components/editor/action-bar/components/ai-generate-dialog";

export function AIGenerateButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [jsonPrompt, setJsonPrompt] = useState("");
  const { themeState, setThemeState } = useEditorStore();
  const { toast } = useToast();

  const transformPrompt = (prompt: string, jsonPrompt: string) => {
    const parsedJsonPrompt = JSON.parse(jsonPrompt) as JSONContent;
    const mentions = parsedJsonPrompt.content?.[0]?.content?.filter(
      (item) => item.type === "mention"
    );

    const getMentionContent = (id: string) => {
      if (id === "editor:current-changes") {
        return useEditorStore.getState().themeState.styles;
      }

      return useThemePresetStore.getState().getPreset(id)?.styles;
    };

    const mentionReferences = mentions?.map(
      (mention) => `@${mention.attrs?.label} = 
    ${JSON.stringify(getMentionContent(mention.attrs?.id))}`
    );

    return prompt + "\n\n" + mentionReferences?.join("\n");
  };

  const handleGenerateTheme = async () => {
    if (!prompt.trim()) return;
    const transformedPrompt = transformPrompt(prompt, jsonPrompt);

    setLoading(true);
    try {
      const response = await fetch("/api/generate-theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: transformedPrompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate theme");
      }

      const themeStyles = await response.json();

      // Update the theme styles in the store
      setThemeState({
        ...themeState,
        styles: themeStyles,
      });

      toast({
        title: "Theme generated",
        description: "Your AI-generated theme has been applied",
      });

      setOpen(false);
      setPrompt("");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate theme. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (
    textContent: string,
    jsonContent: JSONContent
  ) => {
    setJsonPrompt(JSON.stringify(jsonContent));
    setPrompt(textContent);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(true)}
            className="h-8 px-2 gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50"
          >
            <Sparkles className="size-3.5" />
            <span className="text-sm hidden md:block">Generate</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Generate theme with AI</TooltipContent>
      </Tooltip>

      <AIGenerateDialog
        open={open}
        onOpenChange={setOpen}
        loading={loading}
        prompt={prompt}
        onContentChange={handleContentChange}
        onGenerate={handleGenerateTheme}
      />
    </>
  );
}
