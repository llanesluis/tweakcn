"use client";

import { useTheme } from "@/components/theme-provider";
import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { Button } from "@/components/ui/button";
import { useAIThemeGeneration } from "@/hooks/use-ai-theme-generation";
import { DialogActionsProvider, useDialogActions } from "@/hooks/use-dialog-actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEditorStore } from "@/store/editor-store";
import { Code, Edit, Heart, Moon, Plus, Redo, RefreshCw, Sun, Undo } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChatLocal } from "../hooks/use-chat-local";
import { usePreviewPanel } from "../hooks/use-preview-panel";
import { HorizontalScrollArea } from "./horizontal-scroll-area";
import { TogglePreviewPanelButton } from "./toggle-preview-panel-button";

export function Toolbar() {
  return (
    <DialogActionsProvider>
      <div className="h-14 content-center overflow-hidden border-b">
        <HorizontalScrollArea className="isolate mx-auto flex h-full w-full justify-center px-4 py-2">
          <ToolbarActions />
        </HorizontalScrollArea>
      </div>
    </DialogActionsProvider>
  );
}

function ToolbarActions() {
  const {
    themeState,
    setThemeState,
    saveThemeCheckpoint,
    restoreThemeCheckpoint,
    hasThemeChangedFromCheckpoint,
    redo,
    undo,
    canRedo,
    canUndo,
  } = useEditorStore();

  const isMobile = useIsMobile();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { loading: aiGenerateLoading } = useAIThemeGeneration();
  const { isPreviewPanelOpen, setIsPreviewPanelOpen } = usePreviewPanel();
  const { resetState } = useAIThemeGeneration();

  const { handleSaveClick, setCodePanelOpen } = useDialogActions();
  const { clearMessages } = useChatLocal();

  const handleOpenInEditor = () => {
    // Check this implementation once the AI flow works
    if (hasThemeChangedFromCheckpoint()) {
      setThemeState({
        ...themeState,
        preset: undefined,
      });
    }
    saveThemeCheckpoint();
    router.push("/editor/theme");
  };

  const handleThemeToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX: x, clientY: y } = event;
    toggleTheme({ x, y });
  };

  const handleOpenCodePanel = () => {
    setCodePanelOpen(true);
  };

  const handleOpenSaveDialog = () => {
    handleSaveClick({ shareAfterSave: true });
  };

  const handleOpenNewChat = () => {
    clearMessages();
    resetState();
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* New chat button */}
      <TooltipWrapper label="New chat">
        <Button
          size="icon"
          className="border shadow-none"
          onClick={handleOpenNewChat}
          disabled={aiGenerateLoading}
        >
          <Plus />
        </Button>
      </TooltipWrapper>

      {/* Open in Editor Button */}
      <TooltipWrapper label="Customize further in Editor">
        <Button
          size={isMobile ? "icon" : "default"}
          variant="secondary"
          className="border shadow-none"
          onClick={handleOpenInEditor}
          disabled={aiGenerateLoading}
        >
          <Edit />
          <span className="hidden md:block">Open in Editor</span>
        </Button>
      </TooltipWrapper>

      {/* Theme Toggle Button */}
      <TooltipWrapper label="Toggle theme">
        <Button
          size="icon"
          variant="ghost"
          className="bg-background border"
          disabled={aiGenerateLoading}
          onClick={handleThemeToggle}
        >
          {theme === "light" ? <Moon /> : <Sun />}
        </Button>
      </TooltipWrapper>

      {/* Undo Button */}
      <TooltipWrapper label="Undo">
        <Button
          variant="ghost"
          size="icon"
          className="bg-background border"
          onClick={undo}
          disabled={!canUndo() || aiGenerateLoading}
        >
          <Undo />
        </Button>
      </TooltipWrapper>

      {/* Redo Button */}
      <TooltipWrapper label="Redo">
        <Button
          variant="ghost"
          size="icon"
          className="bg-background border"
          onClick={redo}
          disabled={!canRedo() || aiGenerateLoading}
        >
          <Redo />
        </Button>
      </TooltipWrapper>

      {/* Reset Button */}
      <TooltipWrapper label="Reset to preset defaults">
        <Button
          variant="ghost"
          size={isMobile ? "icon" : "default"}
          className="bg-background border"
          onClick={restoreThemeCheckpoint}
          disabled={!hasThemeChangedFromCheckpoint() || aiGenerateLoading}
        >
          <RefreshCw /> <span className="hidden md:block">Reset</span>
        </Button>
      </TooltipWrapper>

      {/* Save Button */}
      <TooltipWrapper label="Save theme">
        <Button
          variant="ghost"
          size={isMobile ? "icon" : "default"}
          className="bg-background border"
          onClick={handleOpenSaveDialog}
          disabled={aiGenerateLoading}
        >
          <Heart /> <span className="hidden md:block">Save</span>
        </Button>
      </TooltipWrapper>

      {/* Code Button */}
      <TooltipWrapper label="View theme code">
        <Button
          variant="ghost"
          size={isMobile ? "icon" : "default"}
          className="bg-background border"
          onClick={handleOpenCodePanel}
          disabled={aiGenerateLoading}
        >
          <Code /> <span className="hidden md:block">Code</span>
        </Button>
      </TooltipWrapper>

      <TooltipWrapper
        label={isPreviewPanelOpen ? "Hide preview panel" : "Show preview panel"}
        asChild
      >
        <TogglePreviewPanelButton variant="ghost" className="border" />
      </TooltipWrapper>
    </div>
  );
}
