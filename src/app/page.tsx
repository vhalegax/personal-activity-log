'use client';

import MvpApp from '@/components/MvpApp';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
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
      <header className="flex items-center justify-between border-b p-4">
        <div>
          <h1 className="text-xl font-bold">daily-worklog</h1>
          <p className="text-muted-foreground text-xs">{user.email}</p>
        </div>
        <Button variant="outline" onClick={signOut}>
          Sign Out
        </Button>
      </header>

      <main className="mx-auto max-w-3xl p-6">
        <MvpApp />
      </main>
    </div>
  );
}
