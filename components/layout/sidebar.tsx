'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigation } from '@/lib/navigation';
import { navIconMap } from '@/components/layout/nav-icons';
import { cn } from '@/lib/utils';
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <aside className="flex h-full w-60 flex-col border-r border-sidebar-border bg-sidebar">
    <Link href="/projects" onClick={onNavigate} className="flex h-16 shrink-0 items-center gap-3 border-b px-5"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-lg font-bold text-primary ring-1 ring-primary/30">A</span><span><span className="block font-bold tracking-tight">Atlas</span><span className="text-[10px] uppercase tracking-widest text-muted-foreground">Research OS</span></span></Link>
    <nav aria-label="Main navigation" className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-3 py-5">{navigation.map(group => <div key={group.label}><p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{group.label}</p><ul className="space-y-1">{group.items.map(item => {
      const Icon = navIconMap[item.icon]; const active = pathname === item.href || (item.href === '/projects' && (pathname.startsWith('/projects/') || pathname === '/research'));
      return <li key={item.href}><Link onClick={onNavigate} href={item.href} aria-current={active ? 'page' : undefined} className={cn('flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors', active ? 'bg-accent text-foreground ring-1 ring-primary/20' : 'text-muted-foreground hover:bg-secondary hover:text-foreground')}><Icon className={cn('h-4 w-4 shrink-0', active && 'text-primary')} /><span className="flex-1">{item.label}</span>{item.preview && <span className="text-[9px] uppercase tracking-wider opacity-60">Preview</span>}</Link></li>;
    })}</ul></div>)}</nav>
    <div className="border-t px-5 py-4 text-xs text-muted-foreground">Personal research workspace<Link href="/data-sources" onClick={onNavigate} className="mt-1 block text-primary hover:underline">Check data connections →</Link></div>
  </aside>;
}
