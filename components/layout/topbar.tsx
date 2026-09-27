'use client';
import Link from 'next/link';
import { Search, Database } from 'lucide-react';
export function Topbar() {
  return <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-card/50 px-4 md:px-6">
    <form action="/projects" method="get" role="search" className="relative w-full max-w-md"><Search size={16} className="absolute left-3 top-3 text-muted-foreground" /><input name="q" aria-label="Search your projects" placeholder="Search your projects…" className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></form>
    <Link aria-label="Data Sources" href="/data-sources" className="flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs text-muted-foreground hover:text-foreground"><Database size={15} /><span className="hidden sm:inline">Data Sources</span></Link>
  </header>;
}
