export default function ThemeLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="w-full max-w-3xl mx-auto space-y-6">
          {/* Title skeleton */}
          <div className="h-10 w-1/3 bg-muted rounded-lg animate-pulse" />

          {/* Theme card skeleton */}
          <div className="w-full h-[300px] bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    </main>
  );
}
