"use client";

import MvpApp from "@/components/MvpApp";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="bg-background text-foreground min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Don't show content if not logged in
  if (!user) {
    return null;
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="p-4 border-b flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">daily-worklog</h1>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" onClick={signOut}>
          Sign Out
        </Button>
      </header>

      <main className="p-6 max-w-3xl mx-auto">
        <MvpApp />
      </main>
    </div>
  );
}
