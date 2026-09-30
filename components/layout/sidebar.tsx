'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen, ArrowUpRight, Orbit } from 'lucide-react';
import { Portal } from '@radix-ui/react-tooltip';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { navigation } from '@/lib/navigation';
import { navIconMap } from '@/components/layout/nav-icons';
import { cn } from '@/lib/utils';

type SidebarProps = { onNavigate?: () => void; collapsed?: boolean; onToggle?: () => void };
export function Sidebar({ onNavigate, collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  return <TooltipProvider delayDuration={150}><aside aria-label="Workspace sidebar" className={cn('flex h-full flex-col bg-sidebar transition-[width] duration-200 motion-reduce:transition-none', collapsed ? 'w-[72px]' : 'w-[224px]')}>
    <div className={cn('flex shrink-0 items-center gap-2', collapsed ? 'flex-col px-3 pb-2 pt-4' : 'h-[76px] px-4')}>
      <Link href="/" onClick={onNavigate} aria-label="Atlas dashboard" className="flex min-w-0 items-center gap-2.5 rounded-lg"><Image src="/brand/atlas-symbol-dark-v1.png" alt="" width={36} height={36} sizes="36px" priority className="shrink-0 rounded-xl" />{!collapsed && <span><span className="block text-sm font-semibold tracking-[0.18em]">ATLAS</span><span className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Research OS</span></span>}</Link>
      {onToggle && <button onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} aria-controls="desktop-navigation" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground', !collapsed && 'ml-auto')}>{collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}</button>}
    </div>
    <nav id={onToggle ? 'desktop-navigation' : undefined} aria-label="Main navigation" className={cn('scrollbar-thin flex-1 overflow-y-auto pb-4', collapsed ? 'px-3' : 'px-3.5')}>
      {navigation.map((group, index) => <div key={group.label} className={cn(index > 0 && (collapsed ? 'mt-3 border-t border-sidebar-border pt-3' : 'mt-5'))}>
        <p className={cn('mb-2 px-3 text-[9px] font-medium uppercase tracking-[0.13em] text-muted-foreground', collapsed && 'sr-only')}>{group.label}</p>
        <ul className="space-y-1">{group.items.map(item => {
          const Icon = navIconMap[item.icon];
          const active = pathname === item.href || (item.href === '/projects' && (pathname.startsWith('/projects/') || pathname === '/research'));
          const label = `${item.label}${item.preview ? ' (preview)' : ''}`;
          const link = <Link onClick={onNavigate} href={item.href} aria-label={label} aria-current={active ? 'page' : undefined} className={cn('group relative flex h-10 items-center rounded-xl text-[12px] transition-colors', collapsed ? 'justify-center' : 'gap-2 px-2.5', active ? 'bg-secondary text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground')}><Icon className={cn('h-[17px] w-[17px] shrink-0', active ? 'text-primary' : 'opacity-80 group-hover:opacity-100')} />{!collapsed && <><span className="min-w-0 flex-1 whitespace-nowrap text-[11px]">{item.label}</span>{item.preview && <span aria-hidden="true" className="rounded bg-background/50 px-1 py-0.5 text-[7px] uppercase tracking-wide text-muted-foreground">Preview</span>}</>}{collapsed && item.preview && <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-1 w-1 rounded-full bg-muted-foreground/60" />}</Link>;
          return <li key={item.href}>{collapsed ? <Tooltip><TooltipTrigger asChild>{link}</TooltipTrigger><Portal><TooltipContent side="right" sideOffset={12}>{label}</TooltipContent></Portal></Tooltip> : link}</li>;
        })}</ul>
      </div>)}
    </nav>
    <div className={cn('shrink-0 p-3', collapsed && 'px-3 pb-4')}><Link href="/account" onClick={onNavigate} aria-label="Personal workspace settings" title={collapsed ? 'Personal workspace settings' : undefined} className={cn('flex items-center gap-2.5 rounded-xl bg-secondary/60 p-2.5 transition-colors hover:bg-secondary', collapsed && 'justify-center px-0')}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"><Orbit size={16} /></span>{!collapsed && <><span className="min-w-0 flex-1"><span className="block text-[11px] font-medium">Personal workspace</span><span className="text-[10px] text-muted-foreground">Account & storage</span></span><ArrowUpRight size={13} className="text-muted-foreground" /></>}</Link></div>
  </aside></TooltipProvider>;
}
