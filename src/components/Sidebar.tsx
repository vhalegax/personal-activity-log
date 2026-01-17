'use client';

import { Separator } from './ui';
import { cn } from '@/lib/utils';
import { isDisabled } from '@testing-library/user-event/dist/cjs/utils/index.js';
import { LayoutDashboard, CheckSquare, BarChart3, FolderKanban } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    isDisabled: true,
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: FolderKanban,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-background fixed top-0 left-0 z-40 h-screen w-64 border-r transition-transform">
      <div className="flex h-full flex-col gap-2">
        {/* Logo/Brand */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <LayoutDashboard className="h-6 w-6" />
            <span>Activity Log</span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-4 px-3 py-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.isDisabled ? '#' : item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </div>

          <Separator />
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <p className="text-muted-foreground text-xs">Personal Activity Log v1.0</p>
        </div>
      </div>
    </aside>
  );
}
