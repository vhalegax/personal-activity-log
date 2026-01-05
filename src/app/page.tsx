"use client";

import MvpApp from "@/components/MvpApp";

export default function Page() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="p-4 border-b">
        <h1 className="text-xl font-bold">daily-worklog — MVP</h1>
      </header>

      <main className="p-6 max-w-3xl mx-auto">
        <MvpApp />
      </main>
    </div>
  );
}
