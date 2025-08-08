import { recordAIUsage } from "@/actions/ai-usage";
import { handleError } from "@/lib/error-response";
import { getCurrentUserId, logError } from "@/lib/shared";
import { validateSubscriptionAndUsage } from "@/lib/subscription";
import { ChatMessage } from "@/types/ai";
import { SubscriptionRequiredError } from "@/types/errors";
import { SYSTEM_PROMPT } from "@/utils/ai/generate-theme";
import { convertMessagesToModelMessages } from "@/utils/ai/message-converter";
import { createGoogleGenerativeAI, GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  stepCountIs,
  streamText,
} from "ai";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { TOOLS } from "./tools";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const model = google("gemini-2.5-pro");

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.fixedWindow(5, "60s"),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId(req);
    const headersList = await headers();

    if (process.env.NODE_ENV !== "development") {
      const ip = headersList.get("x-forwarded-for") ?? "anonymous";
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);

      if (!success) {
        return new Response("Rate limit exceeded. Please try again later.", {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        });
      }
    }

    const subscriptionCheck = await validateSubscriptionAndUsage(userId);

    if (!subscriptionCheck.canProceed) {
      throw new SubscriptionRequiredError(subscriptionCheck.error, {
        requestsRemaining: subscriptionCheck.requestsRemaining,
      });
    }

    const { messages }: { messages: ChatMessage[] } = await req.json();
    const modelMessages = await convertMessagesToModelMessages(messages);

    const stream = createUIMessageStream<ChatMessage>({
      execute: ({ writer }) => {
        const generateTheme = TOOLS.generateTheme(
          {
            model,
            messages: modelMessages,
          },
          writer
        );

        const result = streamText({
          model,
          system: SYSTEM_PROMPT,
          messages: modelMessages,
          providerOptions: {
            google: {
              thinkingConfig: {
                thinkingBudget: 128,
                includeThoughts: true,
              },
            } satisfies GoogleGenerativeAIProviderOptions,
          },
          tools: { generateTheme },
          stopWhen: stepCountIs(5),
          onError: (error) => {
            if (error instanceof Error) {
              console.log("tool-error:", error);
            }
          },
          onFinish: async (result) => {
            const { usage } = result;
            try {
              await recordAIUsage({
                promptTokens: usage.inputTokens,
                completionTokens: usage.outputTokens,
              });
            } catch (error) {
              logError(error as Error, { action: "recordAIUsage", usage });
            }
          },
          experimental_transform: smoothStream({
            delayInMs: 20,
            chunking: "word",
          }),
        });

        writer.merge(
          result.toUIMessageStream({
            messageMetadata: ({ part }) => {
              if (part.type === "tool-result") {
                // Attach the theme styles to the assistant message metadata
                if (part.toolName === "generateTheme") {
                  return { themeStyles: part.output };
                }
              }
            },
          })
        );
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "ResponseAborted")
    ) {
      return new Response("Request aborted by user", { status: 499 });
    }

    return handleError(error, { route: "/api/generate-theme" });
  }
}
