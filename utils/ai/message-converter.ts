import { AIPromptData, ChatMessage } from "@/types/ai";
import { buildMentionStringForAPI, dedupeMentionReferences } from "@/utils/ai/ai-prompt";
import { AssistantContent, ModelMessage, TextPart, UserContent } from "ai";

export function buildUserContentPartsFromPromptData(promptData: AIPromptData): UserContent {
  const userContentParts: UserContent = [];

  if (promptData.images && promptData.images.length > 0) {
    promptData.images.forEach((image) => {
      if (image.url.startsWith("data:image/svg+xml")) {
        try {
          const dataUrlPart = image.url.split(",")[1];
          let svgMarkup: string;

          if (image.url.includes("base64")) {
            svgMarkup = atob(dataUrlPart);
          } else {
            svgMarkup = decodeURIComponent(dataUrlPart);
          }

          userContentParts.push({
            type: "text",
            text: `Here is an SVG image for analysis:\n\`\`\`svg\n${svgMarkup}\n\`\`\``,
          });
        } catch {
          userContentParts.push({
            type: "image",
            image: image.url,
          });
        }
      } else {
        userContentParts.push({
          type: "image",
          image: image.url,
        });
      }
    });
  }

  // Add the prompt text content as a text part
  const textContent = promptData.content;
  if (textContent.trim().length > 0) {
    const textPart: TextPart = {
      type: "text",
      text: textContent,
    };
    userContentParts.push(textPart);
  }

  const uniqueMentions = dedupeMentionReferences(promptData.mentions);
  // Add each mention as a text part
  uniqueMentions.forEach((mention) => {
    userContentParts.push({
      type: "text",
      text: buildMentionStringForAPI(mention),
    });
  });

  return userContentParts;
}

export async function convertMessagesToModelMessages(
  messages: ChatMessage[]
): Promise<ModelMessage[]> {
  const modelMessages: ModelMessage[] = [];

  // Only include the most recent assistant themeStyles to avoid exponential growth.
  let latestAssistantWithThemeIndex = -1;
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m.role === "assistant" && m.metadata?.themeStyles) {
      latestAssistantWithThemeIndex = i;
    }
  }

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const promptData = message.metadata?.promptData;

    const msgTextContent = message.parts
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("");

    if (message.role === "user" && promptData) {
      const userContentParts: UserContent = buildUserContentPartsFromPromptData(promptData);
      modelMessages.push({
        role: "user",
        content: userContentParts,
      });
    }

    if (message.role === "assistant") {
      const assistantContentParts: AssistantContent = [];
      assistantContentParts.push({
        type: "text",
        text: msgTextContent,
      });

      // Attach themeStyles JSON only for the latest assistant message that has it.
      // We do this to avoid attaching the `themeStyles` object to every assistant message that generated a theme
      // Assistant text responses already include useful information about the plans and changes made,
      // so we ** might not need** to attach the `themeStyles` object to every message.
      if (i === latestAssistantWithThemeIndex) {
        const themeStyles = message.metadata?.themeStyles;
        if (themeStyles) {
          assistantContentParts.push({
            type: "text",
            text: JSON.stringify(themeStyles),
          });
        }
      }

      modelMessages.push({
        role: "assistant",
        content: assistantContentParts,
      });
    }
  }

  return modelMessages;
}
