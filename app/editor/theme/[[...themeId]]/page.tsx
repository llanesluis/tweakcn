import { getEditorConfig } from "@/config/editors";
import { cn } from "@/lib/utils";
import Editor from "@/components/editor/editor";
import { Metadata } from "next";
import { Header } from "../../../../components/editor/header";

export const metadata: Metadata = {
  title: "tweakcn — Theme Generator for shadcn/ui",
  description:
    "Easily customize and preview your shadcn/ui theme with tweakcn. Modify colors, fonts, and styles in real-time.",
};

interface PageProps {
  params: {
    themeId?: string[];
  };
}

export default function Component({ params }: PageProps) {
  const themeId = params.themeId?.[0];

  return (
    <>
      <div
        className={cn(
          "h-screen flex flex-col text-foreground bg-background transition-colors"
        )}
      >
        <Header />
        <main className="flex-1 overflow-hidden">
          <Editor config={getEditorConfig("theme")} themeId={themeId} />
        </main>
      </div>
    </>
  );
}
