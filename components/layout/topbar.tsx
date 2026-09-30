'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Database, ChevronRight, Settings2 } from 'lucide-react';
import { navigation } from '@/lib/navigation';
import { ThemeToggle } from './theme-provider';
export function Topbar() {
  const path = usePathname();
  const item = navigation.flatMap(group => group.items).find(item => item.href === path);
  const title = item?.label ?? (path.startsWith('/projects/') ? 'Project research' : 'Research workspace');
  return <header className="flex h-[68px] shrink-0 items-center justify-between gap-4 px-4 md:px-6">
    <div className="hidden min-w-0 items-center gap-2 text-[11px] text-muted-foreground lg:flex"><span>Workspace</span><ChevronRight size={12} /><span className="truncate text-foreground">{title}</span></div>
    <div className="flex min-w-0 flex-1 items-center justify-end gap-2 lg:flex-none"><form action="/projects" method="get" role="search" className="relative w-full max-w-[300px] lg:w-[260px]"><Search size={14} className="pointer-events-none absolute left-3 top-2.5 text-muted-foreground" /><input name="q" aria-label="Search your projects" placeholder="Search your projects…" className="h-9 w-full rounded-xl border border-border/60 bg-secondary/50 pl-9 pr-3 text-xs transition-colors focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/60" /></form>
    <ThemeToggle />
    <Link aria-label="Data Sources" title="Data Sources" href="/data-sources" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><Database size={15} /></Link>
    <Link aria-label="Account & Storage" title="Account & Storage" href="/account" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><Settings2 size={15} /></Link></div>
  </header>;
}
