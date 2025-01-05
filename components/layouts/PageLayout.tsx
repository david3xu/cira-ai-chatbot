export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="flex min-h-screen flex-col">{children}</main>
    </div>
  );
} 