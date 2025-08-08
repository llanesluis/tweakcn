import { ChatMessage } from "@/types/ai";
import { ThemeStylePropsWithoutSpacing } from "@/types/theme";
import { themeStylesOutputSchema } from "@/utils/ai/generate-theme";
import { LanguageModel, ModelMessage, streamObject, tool, UIMessageStreamWriter } from "ai";
import z from "zod";

export const TOOLS = {
  generateTheme: (
    _ctx: {
      model: LanguageModel;
      messages: ModelMessage[];
    },
    writer: UIMessageStreamWriter<ChatMessage>
  ) =>
    tool({
      description: `Generate a complete shadcn/ui theme (light and dark) from the conversation context. Use this after you've gathered sufficient input (prompt, images/SVG, or an @base theme reference). No explicit inputs are required; it reads prior messages and returns a schema-validated themeStyles object.`,
      inputSchema: z.object(),
      execute: async () => {
        const generationId = crypto.randomUUID();

        writer.write({
          id: generationId,
          type: "data-theme-styles",
          data: {
            status: "processing",
          },
        });

        const { partialObjectStream } = streamObject({
          model: _ctx.model,
          schema: themeStylesOutputSchema,
          messages: _ctx.messages,
        });

        let theme = {};

        for await (const part of partialObjectStream) {
          theme = part;
          writer.write({
            id: generationId,
            type: "data-theme-styles",
            data: {
              status: "streaming",
            },
          });
        }

        writer.write({
          id: generationId,
          type: "data-theme-styles",
          data: {
            themeStyles: theme as ThemeStylePropsWithoutSpacing,
            status: "complete",
          },
        });

        return theme;
      },
      outputSchema: themeStylesOutputSchema,
    }),
};
