export const inputClass = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';
export const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed';
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2 text-sm"><span className="text-muted-foreground">{label}</span>{children}</label>;
}
