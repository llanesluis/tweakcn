import { Theme } from "@/types/theme";
import { getThemes } from "@/actions/themes";
import { ThemeCard } from "./components/theme-card";
import { Header } from "@/components/editor/header";

export default async function ProfilePage() {
  const themes = await getThemes();

  return (
    <>
      <Header />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Your Themes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme: Theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      </div>
    </>
  );
}
