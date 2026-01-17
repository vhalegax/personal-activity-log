'use client';

import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set initial state once on mount
  useEffect(() => {
    const isDesktop = window.innerWidth >= 768;
    setSidebarOpen(isDesktop);
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    console.log('Toggle clicked, current:', sidebarOpen);
    setSidebarOpen((prev) => !prev);
  };

  return (
    <>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={toggleSidebar}
      />
      <Navbar onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />

      <div className="h-16"></div>
      <main
        className={cn(
          'bg-background min-h-screen p-4 transition-all duration-300 md:p-6',
          sidebarOpen && mounted ? 'md:ml-64' : 'md:ml-0',
        )}
      >
        {children}
      </main>
    </>
  );
}
