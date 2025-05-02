import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CustomTextarea from "../../custom-textarea";
import { JSONContent } from "@tiptap/react";

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate AI Theme</DialogTitle>
          <DialogDescription>
            Describe your desired theme and our AI will generate it for you.
          </DialogDescription>
        </DialogHeader>

        <CustomTextarea onContentChange={onContentChange} />

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={onGenerate} disabled={!prompt.trim() || loading}>
            {loading ? "Generating..." : "Generate Theme"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
