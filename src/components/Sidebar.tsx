'use client';

import { Separator } from './ui';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, CheckSquare, BarChart3, FolderKanban, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onClose, onToggle }: SidebarProps) {
  const pathname = usePathname();

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (window.innerWidth < 768) {
      onClose();
    }
  }, [pathname, onClose]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-background fixed top-0 left-0 z-50 h-screen w-64 border-r transition-transform duration-300 md:z-40',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col gap-2">
          {/* Logo/Brand */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <LayoutDashboard className="h-6 w-6" />
              <span>Activity Log</span>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
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
    </>
  );
}
