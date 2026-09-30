'use client';
import { ThemeProvider as Provider, useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <Provider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="atlas.ui.theme" disableTransitionOnChange>{children}</Provider>;
}
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const light = mounted && resolvedTheme === 'light';
  return <button type="button" disabled={!mounted} aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'} title={light ? 'Dark theme' : 'Light theme'} onClick={() => setTheme(light ? 'dark' : 'light')} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground">{light ? <Moon size={15} /> : <Sun size={15} />}</button>;
}
