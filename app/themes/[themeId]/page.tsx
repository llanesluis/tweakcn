import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTheme } from "@/actions/themes";
import { ThemeCard } from "@/app/dashboard/components/theme-card";
import { cn } from "@/lib/utils";

interface ThemePageProps {
  params: {
    themeId: string;
  };
}

async function ThemeView({ themeId }: { themeId: string }) {
  const theme = await getTheme(themeId);

  if (!theme) {
    notFound();
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">{theme.name}</h1>
      <div className={cn("w-full max-w-3xl mx-auto")}>
        <ThemeCard theme={theme} />
      </div>
    </div>
  );
}

export default async function ThemePage({ params }: ThemePageProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Suspense
        fallback={
          <div className="container py-8">
            <div className="w-full h-[300px] animate-pulse bg-muted rounded-lg" />
          </div>
        }
      >
        <ThemeView themeId={params.themeId} />
      </Suspense>
    </main>
  );
}
