import { NextResponse } from "next/server";
import { db } from "@/db";
import { theme as themeTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { type ThemeStyles } from "@/types/theme";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getCurrentUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.id ?? null;
}

// Re-use validation schemas (could be moved to a shared file)
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

// Schema for updating: name and styles are optional
const updateThemeSchema = z.object({
  name: z.string().min(1, "Theme name cannot be empty").optional(),
  styles: themeStylesSchema.optional(),
});

interface RouteParams {
  params: { themeId: string };
}

// GET /api/themes/[themeId] - Fetch a single theme
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const userId = await getCurrentUserId();
    const { themeId } = params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!themeId) {
      return NextResponse.json({ error: "Theme ID required" }, { status: 400 });
    }

    const [theme] = await db
      .select()
      .from(themeTable)
      .where(and(eq(themeTable.id, themeId), eq(themeTable.userId, userId))); // Ensure ownership

    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    return NextResponse.json(theme);
  } catch (error) {
    console.error(`Error fetching theme ${params.themeId}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/themes/[themeId] - Update a theme
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const userId = await getCurrentUserId();
    const { themeId } = params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!themeId) {
      return NextResponse.json({ error: "Theme ID required" }, { status: 400 });
    }

    const body = await request.json();
    const validation = updateThemeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { name, styles } = validation.data;

    // Check if there's anything to update
    if (!name && !styles) {
      return NextResponse.json(
        { error: "No update data provided" },
        { status: 400 }
      );
    }

    const updateData: Partial<{
      name: string;
      styles: ThemeStyles;
      updatedAt: Date;
    }> = {
      updatedAt: new Date(),
    };
    if (name) updateData.name = name;
    if (styles) updateData.styles = styles as ThemeStyles; // Cast after validation

    const [updatedTheme] = await db
      .update(themeTable)
      .set(updateData)
      .where(and(eq(themeTable.id, themeId), eq(themeTable.userId, userId))) // Ensure ownership
      .returning();

    if (!updatedTheme) {
      // Either theme didn't exist or user didn't own it
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTheme);
  } catch (error) {
    console.error(`Error updating theme ${params.themeId}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/themes/[themeId] - Delete a theme
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const userId = await getCurrentUserId();
    const { themeId } = params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!themeId) {
      return NextResponse.json({ error: "Theme ID required" }, { status: 400 });
    }

    const [deletedTheme] = await db
      .delete(themeTable)
      .where(and(eq(themeTable.id, themeId), eq(themeTable.userId, userId))) // Ensure ownership
      .returning({ id: themeTable.id }); // Return the ID of the deleted item

    if (!deletedTheme) {
      // Either theme didn't exist or user didn't own it
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Theme deleted successfully" });
  } catch (error) {
    console.error(`Error deleting theme ${params.themeId}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
