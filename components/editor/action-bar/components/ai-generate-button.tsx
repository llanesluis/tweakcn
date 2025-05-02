import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useEditorStore } from "@/store/editor-store";

export function AIGenerateButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const { themeState, setThemeState } = useEditorStore();
  const { toast } = useToast();

  const handleGenerateTheme = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/generate-theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
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

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1"
      >
        <Sparkles className="h-4 w-4" />
        AI Generate
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate AI Theme</DialogTitle>
            <DialogDescription>
              Describe your desired theme and our AI will generate it for you.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Describe your theme (e.g. 'A dark cyberpunk theme with neon accents' or 'A clean, minimal light theme with soft pastels')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px]"
          />

          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateTheme}
              disabled={!prompt.trim() || loading}
            >
              {loading ? "Generating..." : "Generate Theme"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
