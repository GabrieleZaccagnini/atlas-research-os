'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { ProjectsProvider } from '@/components/projects/store';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { navigation } from '@/lib/navigation';
export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false); const path = usePathname();
  const preview = navigation.flatMap(g => g.items).some(i => i.href === path && i.preview);
  return <ProjectsProvider><div className="flex h-screen overflow-hidden bg-background">
    <div className="hidden shrink-0 md:block"><Sidebar /></div>
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden"><div className="flex items-center border-b md:border-0"><div className="pl-3 md:hidden"><Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><button aria-label="Open navigation" className="rounded-md border p-2"><Menu size={20} /></button></SheetTrigger><SheetContent side="left" className="w-60 border-0 p-0"><DialogTitle className="sr-only">Atlas navigation</DialogTitle><DialogDescription className="sr-only">Navigate your research workspace</DialogDescription><Sidebar onNavigate={() => setOpen(false)} /></SheetContent></Sheet></div><div className="min-w-0 flex-1"><Topbar /></div></div>
    <main className="scrollbar-thin flex-1 overflow-y-auto"><div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6">{preview && <div className="mb-5 rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">Design preview · figures and stories on this page are example data, not live research.</div>}{children}</div></main></div>
  </div></ProjectsProvider>;
}
