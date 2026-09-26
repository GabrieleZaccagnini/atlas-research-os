'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '@/lib/mock-data';
import { navIconMap } from '@/components/layout/nav-icons';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/30">
          <span className="text-lg font-bold text-primary text-glow-primary">A</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-base font-bold tracking-tight text-foreground">Atlas</span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Research OS
          </span>
        </div>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto py-3">
        <div className="px-3">
          <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Navigation
          </p>
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = navIconMap[item.icon];
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-accent text-foreground ring-1 ring-primary/20'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                        )}
                      />
                    )}
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                        {item.badge}
                      </span>
                    )}
                    {isActive && <div className="h-1 w-1 rounded-full bg-primary" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
          <span className="text-xs font-medium text-muted-foreground">All systems operational</span>
        </div>
      </div>
    </aside>
  );
}
