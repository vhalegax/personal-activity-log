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

  // Redirect to login if not authenticated, or to tasks if authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user) {
      router.push('/tasks');
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

  return <div></div>;
}
