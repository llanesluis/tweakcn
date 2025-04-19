"use client";

import { Theme } from "@/types/theme"; // Assuming Theme type includes foreground colors
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Edit, Share } from "lucide-react";
import { useMemo } from "react";
import { useEditorStore } from "@/store/editor-store";

interface ThemeCardProps {
  theme: Theme;
  className?: string;
  onDelete?: (theme: Theme) => void;
  onEdit?: (theme: Theme) => void;
  onShare?: (theme: Theme) => void;
}

// --- Define the mapping for swatches ---
type SwatchDefinition = {
  name: string; // Text to display on hover
  bgKey: keyof Theme["styles"]["light" | "dark"]; // Key for background color
  fgKey: keyof Theme["styles"]["light" | "dark"]; // Key for text color
};

const swatchDefinitions: SwatchDefinition[] = [
  { name: "Primary", bgKey: "primary", fgKey: "primary-foreground" },
  { name: "Secondary", bgKey: "secondary", fgKey: "secondary-foreground" },
  { name: "Accent", bgKey: "accent", fgKey: "accent-foreground" },
  { name: "Muted", bgKey: "muted", fgKey: "muted-foreground" },
  // Special case: Background swatch shows "Foreground" text using the main foreground color
  { name: "Background", bgKey: "background", fgKey: "foreground" },
];
// --- End of swatch mapping ---

export function ThemeCard({
  theme,
  className,
  onDelete,
  onEdit,
  onShare,
}: ThemeCardProps) {
  const { themeState } = useEditorStore();
  const mode = themeState.currentMode;

  const colorSwatches = useMemo(() => {
    return swatchDefinitions.map((def) => ({
      name: def.name,
      // Get background color, fallback to a default if necessary (e.g., white)
      bg: theme.styles[mode][def.bgKey] || "#ffffff",
      // Get foreground color, fallback to main foreground or a default (e.g., black)
      fg:
        theme.styles[mode][def.fgKey] ||
        theme.styles[mode].foreground ||
        "#000000",
    }));
  }, [theme.styles[mode]]);
  // --- End of swatch data generation ---

  return (
    <Card
      className={cn(
        "group overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300",
        className
      )}
    >
      <div className="flex h-36 relative">
        {colorSwatches.map((swatch) => (
          <div
            // Use a combination for a more robust key
            key={swatch.name + swatch.bg}
            className={cn(
              "group/swatch relative flex-1 h-full transition-all duration-300 ease-in-out",
              "hover:flex-grow-[1.5]"
            )}
            style={{ backgroundColor: swatch.bg }}
          >
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                "opacity-0 group-hover/swatch:opacity-100",
                "transition-opacity duration-300 ease-in-out",
                "text-xs font-medium pointer-events-none"
              )}
              style={{ color: swatch.fg }}
            >
              {swatch.name}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 flex items-center justify-between bg-background">
        <div>
          <h3 className={cn("text-sm font-medium text-foreground")}>
            {theme.name}
          </h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">
            <div className="p-2 hover:bg-accent rounded-md">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover">
            <DropdownMenuItem onClick={() => onEdit?.(theme)} className="gap-2">
              <Edit className="h-4 w-4" />
              Open in Editor
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onShare?.(theme)}
              className="gap-2"
            >
              <Share className="h-4 w-4" />
              Share Theme
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(theme)}
              className="text-destructive gap-2 focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete Theme
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
