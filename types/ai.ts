import { UIMessage } from "ai";
import { type ThemeStyleProps, type ThemeStyles } from "./theme";

export type MentionReference = {
  id: string;
  label: string;
  themeData: {
    light: Partial<ThemeStyleProps>;
    dark: Partial<ThemeStyleProps>;
  };
};

export type PromptImage = {
  url: string;
};

export type AIPromptData = {
  content: string;
  mentions: MentionReference[];
  images?: PromptImage[];
};

export type MyMetadata = {
  promptData?: AIPromptData;
  themeStyles?: ThemeStyles;
  isError?: boolean;
};

export type ThemeStylesStreamData =
  | {
      status: "processing" | "streaming";
      themeStyles?: ThemeStyles;
    }
  | {
      status: "complete";
      themeStyles: ThemeStyles;
    };

export type MyDataParts = {
  "theme-styles": ThemeStylesStreamData;
};

export type ChatMessage = UIMessage<MyMetadata, MyDataParts>;
