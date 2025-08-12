import { ChatMessage } from "@/types/ai";
import { ThemeStylePropsWithoutSpacing } from "@/types/theme";
import { themeStylesOutputSchema } from "@/utils/ai/generate-theme";
import { baseModel, baseProviderOptions } from "@/utils/ai/model";
import { ModelMessage, streamObject, tool, UIMessageStreamWriter } from "ai";
import z from "zod";

export const TOOLS = {
  generateTheme: (
    _ctx: {
      messages: ModelMessage[];
    },
    writer: UIMessageStreamWriter<ChatMessage>
  ) =>
    tool({
      description: `Generate a complete shadcn/ui theme (light and dark) from the conversation context. Use this tool as soon as you've gathered sufficient input (prompt, images/SVG, or an @base theme reference). The input is the current conversation context.`,
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
          model: baseModel,
          schema: themeStylesOutputSchema,
          messages: _ctx.messages,
          providerOptions: baseProviderOptions,
        });

        let theme = {};

        for await (const part of partialObjectStream) {
          theme = part;
          writer.write({
            id: generationId,
            type: "data-theme-styles",
            data: {
              status: "streaming",
              themeStyles: theme,
            },
          });
        }

        writer.write({
          id: generationId,
          type: "data-theme-styles",
          data: {
            status: "complete",
            themeStyles: theme as ThemeStylePropsWithoutSpacing,
          },
        });

        return theme;
      },
      outputSchema: themeStylesOutputSchema,
    }),
};
