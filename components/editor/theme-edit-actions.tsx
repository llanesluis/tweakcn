import { Button } from "../ui/button";
import { X, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Separator } from "../ui/separator";

interface ThemeEditActionsProps {
  themeName: string;
  onCancel: () => void;
  onSave: () => void;
}

const ThemeEditActions: React.FC<ThemeEditActionsProps> = ({
  themeName,
  onCancel,
  onSave,
}) => {
  return (
    <div className="flex items-center">
      <div className="flex flex-1 items-center gap-3 bg-muted/10 min-h-14 px-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground">
            Currently editing
          </span>
        </div>
        <span className="text-sm font-semibold">{themeName}</span>
      </div>

      <Separator orientation="vertical" className="h-8" />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-14 shrink-0 rounded-none bg-muted/10"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cancel changes</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Separator orientation="vertical" className="h-8" />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-14 shrink-0 rounded-none bg-muted/10"
              onClick={onSave}
            >
              <Check className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save changes</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ThemeEditActions;
