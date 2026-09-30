'use client';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/components/auth/provider';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { WatchlistsProvider } from '@/components/watchlists/store';
import { ProjectsProvider } from '@/components/projects/store';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { navigation } from '@/lib/navigation';
import { WorkspaceModeProvider, useWorkspaceMode } from '@/components/auth/workspace-mode';
export function AppShell({ children }: { children: React.ReactNode }) {
  return <AuthProvider><WorkspaceModeProvider><AuthenticatedShell>{children}</AuthenticatedShell></WorkspaceModeProvider></AuthProvider>;
}
function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const auth = useAuth(); const mode = useWorkspaceMode();
  if (!auth.ready) return <p className="p-8">Loading Atlas…</p>;
  if (auth.error) return <div role="alert" className="p-8"><p>{auth.error}</p><button onClick={() => window.location.reload()}>Retry</button></div>;
  return <ProjectsProvider browserOnly={!auth.session && mode.browserMode} key={auth.session?.user.id ?? (auth.client && !mode.browserMode ? 'signed-out' : 'browser')}><WatchlistsProvider scope={auth.session?.user.id ?? 'browser'}><ShellContent>{children}</ShellContent></WatchlistsProvider></ProjectsProvider>;
}
function ShellContent({ children }: { children: React.ReactNode }) {
  const auth = useAuth(); const mode = useWorkspaceMode();
  const [open, setOpen] = useState(false); const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => { try { setCollapsed(localStorage.getItem('atlas.ui.sidebar-collapsed') === 'true'); } catch { /* Layout still works if browser storage is unavailable. */ } }, []);
  function toggleSidebar() {
    const next = !collapsed; setCollapsed(next);
    try { localStorage.setItem('atlas.ui.sidebar-collapsed', String(next)); } catch { /* Keep the preference for this session. */ }
  }
  const preview = navigation.flatMap(g => g.items).some(i => i.href === path && i.preview);
  return <div className="atlas-shell flex h-[100dvh] overflow-hidden bg-background p-0 md:p-2">
    <div className="hidden shrink-0 overflow-hidden rounded-l-[20px] border-y border-l border-sidebar-border md:block"><Sidebar collapsed={collapsed} onToggle={toggleSidebar} /></div>
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden md:rounded-r-[20px] md:border md:border-border/70"><div className="flex items-center border-b border-border/50"><div className="pl-3 md:hidden"><Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><button aria-label="Open navigation" className="rounded-md border p-2"><Menu size={20} /></button></SheetTrigger><SheetContent side="left" className="w-[224px] border-0 p-0"><DialogTitle className="sr-only">Atlas navigation</DialogTitle><DialogDescription className="sr-only">Navigate your research workspace</DialogDescription><Sidebar onNavigate={() => setOpen(false)} /></SheetContent></Sheet></div><div className="min-w-0 flex-1"><Topbar /></div></div>
    <main className="scrollbar-thin flex-1 overflow-y-auto"><div className="mx-auto max-w-[1680px] px-4 py-5 md:px-6">{preview && <div className="mb-5 rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">Design preview · figures and stories on this page are example data, not live research.</div>}{auth.client && !auth.session && !mode.browserMode && path !== '/account' ? <div className="space-y-3 rounded-lg border p-6"><h1 className="text-xl font-semibold">Your private Atlas workspace</h1><p>Sign in to access cloud research, or keep a separate workspace in this browser.</p><Link href="/account" className="text-primary hover:underline">Sign in →</Link><button className="block rounded border px-3 py-2 text-sm" onClick={mode.useBrowser}>Continue in this browser</button><p className="text-xs text-muted-foreground">Browser research stays on this device. Export backups; cloud transfer is always your choice.</p></div> : children}</div></main></div>
  </div>;
}
