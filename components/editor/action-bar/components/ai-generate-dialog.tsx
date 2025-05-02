"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Loader2 } from "lucide-react";
import CustomTextarea from "../../custom-textarea";
import type { JSONContent } from "@tiptap/react";

interface AIGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  prompt: string;
  onContentChange: (textContent: string, jsonContent: JSONContent) => void;
  onGenerate: () => void;
}

export function AIGenerateDialog({
  open,
  onOpenChange,
  loading,
  prompt,
  onContentChange,
  onGenerate,
}: AIGenerateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-lg border shadow-lg">
        <DialogHeader className="px-6 pt-6 mb-1 w-full">
          <div className="text-center text-2xl font-bold">
            How can I help you theme?
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="bg-muted/40 rounded-lg p-1">
            <CustomTextarea
              onContentChange={onContentChange}
              onGenerate={onGenerate}
            />
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            Try{" "}
            <em className="text-foreground font-medium">
              @Modern Minimal but in red
            </em>{" "}
            or{" "}
            <em className="text-foreground font-medium">
              Make the @Current Theme high contrast
            </em>
          </div>
        </div>

        <DialogFooter className="bg-muted/30 px-6 py-4 border-t">
          <div className="flex items-center justify-end w-full gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              disabled={loading}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={onGenerate}
              disabled={!prompt.trim() || loading}
              className="gap-1"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create Theme
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
