"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { type ThemeStyles } from "@/types/theme";

interface ThemeSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (themeName: string) => Promise<void>;
  isSaving: boolean;
  currentStyles: ThemeStyles;
}

export function ThemeSaveDialog({
  open,
  onOpenChange,
  onSave,
  isSaving,
  currentStyles,
}: ThemeSaveDialogProps) {
  const [themeName, setThemeName] = useState("");

  const handleSave = async () => {
    if (!themeName.trim()) return;
    await onSave(themeName);
    setThemeName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Theme</DialogTitle>
          <DialogDescription>
            Enter a name for your theme so you can find it later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              className="col-span-3"
              placeholder="My Awesome Theme"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={isSaving || !themeName.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-1 size-4 animate-spin" />
                Saving
              </>
            ) : (
              "Save Theme"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
