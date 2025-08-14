import { themeStylesOutputSchema } from "@/utils/ai/generate-theme";
import { baseModel, baseProviderOptions } from "@/utils/ai/model";
import { generateObject, InferUITools, tool } from "ai";
import z from "zod";

export const THEME_GENERATION_TOOLS = {
  generateTheme: tool({
    description: `Generate a complete shadcn/ui theme (light and dark) from the conversation context. Use this tool as soon as you've gathered sufficient input (prompt, images/SVG, or an @base theme reference). The input is the current conversation context.`,
    inputSchema: z.object({}),
    outputSchema: themeStylesOutputSchema,
    execute: async (_input, { messages, abortSignal }) => {
      const { object } = await generateObject({
        abortSignal,
        model: baseModel,
        schema: themeStylesOutputSchema,
        messages,
        providerOptions: baseProviderOptions,
      });

      return object;
    },
  }),
};

export type ThemeGenerationUITools = InferUITools<typeof THEME_GENERATION_TOOLS>;
