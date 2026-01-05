"use client";

export default function Page() {
  return (
    <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
      <main className="prose prose-invert text-center">
        <h1 className="text-4xl font-extrabold">Welcome</h1>
        <p className="text-muted-foreground mt-4">
          Open <span className="font-medium">/demo</span> to view the demo dashboard.
        </p>
      </main>
    </div>
  );
}
