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

// TODO: Rethink types
export type PromptImage = {
  url: string;
};

export type AIPromptData = {
  content: string;
  mentions: MentionReference[];
  images?: PromptImage[];
};

export type MessageMetadata = {
  promptData?: AIPromptData;
  themeStyles?: ThemeStyles;
  isError?: boolean;
};

export type ChatMessage = UIMessage<MessageMetadata>;
