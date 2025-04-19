"use client";

import { useEditorStore } from "@/store/editor-store";
import { Button } from "../ui/button";
import {
  FileCode,
  RefreshCw,
  Code,
  Moon,
  Sun,
  Save,
  Bookmark,
  Loader2,
} from "lucide-react";
import CssImportDialog from "./css-import-dialog";
import { useState } from "react";
import { parseCssInput } from "@/utils/parse-css-input";
import { toast } from "../ui/use-toast";
import { CodePanelDialog } from "./code-panel-dialog";
import { Separator } from "../ui/separator";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { useTheme } from "../theme-provider";
import ContrastChecker from "./contrast-checker";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { type ThemeStyles } from "@/types/theme";
import { AuthDialog } from "@/app/(auth)/components/auth-dialog";
import { useThemes } from "@/hooks/use-theme-actions";
import { cn } from "@/lib/utils";

export function ActionBar() {
  const {
    themeState,
    resetToCurrentPreset,
    setThemeState,
    hasCurrentPresetChanged,
  } = useEditorStore();
  const [cssImportOpen, setCssImportOpen] = useState(false);
  const [codePanelOpen, setCodePanelOpen] = useState(false);

  const { createTheme, isCreatingTheme, isAuthRequired, setIsAuthRequired } =
    useThemes();

  const handleCssImport = (css: string) => {
    const { lightColors, darkColors } = parseCssInput(css);
    const styles = {
      ...themeState.styles,
      light: { ...themeState.styles.light, ...lightColors },
      dark: { ...themeState.styles.dark, ...darkColors },
    };

    setThemeState({
      ...themeState,
      styles,
    });

    toast({
      title: "CSS imported",
      description: "Your custom CSS has been imported successfully",
    });
  };

  const { theme, toggleTheme } = useTheme();

  const handleThemeToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX: x, clientY: y } = event;
    toggleTheme({ x, y });
  };

  const handleSave = async () => {
    const themeName = "Custom random theme";
    const themeData = {
      name: themeName,
      styles: themeState.styles as ThemeStyles,
    };

    try {
      await createTheme(themeData);
      console.log("Theme save triggered via hook.");
    } catch (error) {
      console.error(
        "Save operation failed (error likely handled by hook):",
        error
      );
    }
  };

  return (
    <div className="border-b">
      <div className="flex h-14 items-center justify-end gap-4 px-4">
        <div className="flex items-center gap-2">
          <div className="px-2">
            <Tooltip>
              <TooltipTrigger>
                <SwitchPrimitives.Root
                  checked={theme === "dark"}
                  onClick={handleThemeToggle}
                  className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent data-[state=unchecked]:bg-input"
                >
                  <SwitchPrimitives.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 flex items-center justify-center">
                    {theme === "dark" ? (
                      <Moon className="size-3" />
                    ) : (
                      <Sun className="size-3" />
                    )}
                  </SwitchPrimitives.Thumb>
                </SwitchPrimitives.Root>
              </TooltipTrigger>
              <TooltipContent>Toggle light/dark mode</TooltipContent>
            </Tooltip>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <ContrastChecker
            currentStyles={themeState.styles[themeState.currentMode]}
          />
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                onClick={() => setCssImportOpen(true)}
              >
                <FileCode className="size-3.5" />
                <span className="text-sm hidden md:block">Import</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import CSS variables</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                onClick={resetToCurrentPreset}
                disabled={!hasCurrentPresetChanged()}
              >
                <RefreshCw className="size-3.5" />
                <span className="text-sm hidden md:block">Reset</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset to preset defaults</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-8" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                onClick={handleSave}
                disabled={isCreatingTheme}
              >
                {isCreatingTheme ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Bookmark className="size-3.5" />
                )}
                Save
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save theme</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 px-2 gap-1.5"
                onClick={() => setCodePanelOpen(true)}
              >
                <Code className="size-3.5" />
                <span className="text-sm">Code</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>View theme code</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <CssImportDialog
        open={cssImportOpen}
        onOpenChange={setCssImportOpen}
        onImport={handleCssImport}
      />
      <CodePanelDialog
        open={codePanelOpen}
        onOpenChange={setCodePanelOpen}
        themeEditorState={themeState}
      />
      <AuthDialog open={isAuthRequired} onOpenChange={setIsAuthRequired} />
    </div>
  );
}
