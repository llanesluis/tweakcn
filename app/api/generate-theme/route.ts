import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { themeStylesSchema, themeStylePropsSchema } from "@/types/theme";

const requestSchema = z.object({
  prompt: z.string().min(1),
});

// Create a new schema based on themeStylePropsSchema excluding 'spacing'
const themeStylePropsWithoutSpacing = themeStylePropsSchema.omit({
  spacing: true,
});

// Define the main theme schema using the modified props schema
const themeSchemaWithoutSpacing = z.object({
  light: themeStylePropsWithoutSpacing,
  dark: themeStylePropsWithoutSpacing,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = requestSchema.parse(body);

    const googleAI = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const model = googleAI("models/gemini-2.0-flash");

    const { object: theme } = await generateObject({
      model,
      schema: themeSchemaWithoutSpacing,
      prompt: `Create a complete theme with colors for both light and dark modes based on this description: ${prompt}`,
    });

    return new Response(JSON.stringify(theme), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    // Consider more specific error handling based on AI SDK errors if needed
    return new Response("Error generating theme", { status: 500 });
  }
}
