import { NextResponse } from "next/server";
import { db } from "@/db"; // Assuming db is exported from db/index.ts
import { theme as themeTable } from "@/db/schema"; // Renamed to avoid conflict
import { eq } from "drizzle-orm";
import { z } from "zod";
import cuid from "cuid";
import { type ThemeStyles } from "@/types/theme";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
// import { getCurrentUser } from "@/lib/auth"; // Placeholder for your auth function

// Placeholder - Replace with your actual auth logic from better-auth
async function getCurrentUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.id ?? null;
}

// Zod schema for validating theme styles (matches your ThemeStyles interface)
const themeStylePropsSchema = z.object({
  background: z.string(),
  foreground: z.string(),
  card: z.string(),
  "card-foreground": z.string(),
  popover: z.string(),
  "popover-foreground": z.string(),
  primary: z.string(),
  "primary-foreground": z.string(),
  secondary: z.string(),
  "secondary-foreground": z.string(),
  muted: z.string(),
  "muted-foreground": z.string(),
  accent: z.string(),
  "accent-foreground": z.string(),
  destructive: z.string(),
  "destructive-foreground": z.string(),
  border: z.string(),
  input: z.string(),
  ring: z.string(),
  "chart-1": z.string(),
  "chart-2": z.string(),
  "chart-3": z.string(),
  "chart-4": z.string(),
  "chart-5": z.string(),
  sidebar: z.string(),
  "sidebar-foreground": z.string(),
  "sidebar-primary": z.string(),
  "sidebar-primary-foreground": z.string(),
  "sidebar-accent": z.string(),
  "sidebar-accent-foreground": z.string(),
  "sidebar-border": z.string(),
  "sidebar-ring": z.string(),
  "font-sans": z.string(),
  "font-serif": z.string(),
  "font-mono": z.string(),
  radius: z.string(),
  "shadow-color": z.string(),
  "shadow-opacity": z.string(),
  "shadow-blur": z.string(),
  "shadow-spread": z.string(),
  "shadow-offset-x": z.string(),
  "shadow-offset-y": z.string(),
  "letter-spacing": z.string(),
  spacing: z.string(),
});

const themeStylesSchema = z.object({
  light: themeStylePropsSchema,
  dark: themeStylePropsSchema,
});

const createThemeSchema = z.object({
  name: z.string().min(1, "Theme name cannot be empty"),
  styles: themeStylesSchema,
});

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createThemeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { name, styles } = validation.data;
    const newThemeId = cuid();
    const now = new Date();

    const [insertedTheme] = await db
      .insert(themeTable)
      .values({
        id: newThemeId,
        userId: userId,
        name: name,
        styles: styles as ThemeStyles, // Cast after validation
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(insertedTheme, { status: 201 });
  } catch (error) {
    console.error("Error creating theme:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userThemes = await db
      .select()
      .from(themeTable)
      .where(eq(themeTable.userId, userId));

    return NextResponse.json(userThemes);
  } catch (error) {
    console.error("Error fetching themes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
