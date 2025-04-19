"use client";

import { useEditorStore } from "@/store/editor-store";
import { Button } from "../ui/button";
import { FileCode, RefreshCw, Code, Moon, Sun, Save } from "lucide-react";
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
import { type ThemeEditorState, type ThemeStyles } from "@/types/theme";
import useSWRMutation from "swr/mutation";

// Define the fetcher function for the mutation outside the component
async function saveThemeFetcher(
  url: string,
  { arg }: { arg: { name: string; styles: ThemeStyles } }
) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const errorData = await response.json();
    // Throw an error to be caught by useSWRMutation
    throw new Error(errorData.error || "Failed to save theme");
  }

  return response.json();
}

export function ActionBar() {
  const {
    themeState,
    resetToCurrentPreset,
    setThemeState,
    hasCurrentPresetChanged,
  } = useEditorStore();
  const [cssImportOpen, setCssImportOpen] = useState(false);
  const [codePanelOpen, setCodePanelOpen] = useState(false);

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

  // Use the SWR mutation hook
  const { trigger, isMutating } = useSWRMutation(
    "/api/themes",
    saveThemeFetcher
  );

  const handleSave = async () => {
    // User hardcoded this for now
    const themeName = "Custom random theme";
    const themeData = {
      name: themeName,
      // Make sure themeState.styles matches ThemeStyles type
      styles: themeState.styles as ThemeStyles,
    };

    try {
      const savedTheme = await trigger(themeData);
      console.log("Theme saved:", savedTheme);
      toast({
        title: "Theme Saved",
        description: `Theme "${themeName}" saved successfully.`,
      });
      // Optionally reset state or indicate saved status here
      // e.g., update zustand store state if needed
    } catch (error: any) {
      console.error("Failed to save theme:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Could not save the theme.",
        variant: "destructive",
      });
    }
    // isMutating handles the loading state from the hook
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
            <TooltipTrigger>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 px-2 gap-1.5"
                onClick={handleSave}
                disabled={isMutating}
              >
                <Save
                  className={`size-3.5 ${isMutating ? "animate-spin" : ""}`}
                />
                <span className="text-sm">
                  {isMutating ? "Saving..." : "Save"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save current theme</TooltipContent>
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
    </div>
  );
}
