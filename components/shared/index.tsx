import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between border-b border-border px-5 py-4', className)}>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

export function StatCard({
  label,
  value,
  change,
  sublabel,
  icon,
}: {
  label: string;
  value: string;
  change?: number;
  sublabel?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icon && <div className="text-muted-foreground/50">{icon}</div>}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-2xl font-bold text-foreground">{value}</span>
        {change !== undefined && (
          <span
            className={cn(
              'font-mono text-sm font-medium',
              change > 0 ? 'text-success' : change < 0 ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {change > 0 ? '+' : ''}
            {change.toFixed(2)}%
          </span>
        )}
      </div>
      {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
    </Card>
  );
}

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'destructive' | 'warning' | 'primary' | 'outline';
  className?: string;
}) {
  const variants: Record<string, string> = {
    default: 'bg-secondary text-secondary-foreground',
    success: 'bg-success/15 text-success',
    destructive: 'bg-destructive/15 text-destructive',
    warning: 'bg-warning/15 text-warning',
    primary: 'bg-primary/15 text-primary',
    outline: 'border border-border text-muted-foreground',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const width = 100;
  const height = 30;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const isUp = data[data.length - 1] >= data[0];
  const color = isUp ? 'hsl(var(--success))' : 'hsl(var(--destructive))';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <polyline
        points={`0,${height} ${points} ${width},${height}`}
        fill={color}
        fillOpacity="0.08"
        stroke="none"
      />
    </svg>
  );
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
}: {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-secondary', className)}>
      <div
        className={cn('h-full rounded-full bg-primary transition-all duration-500', barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function SectionGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('grid gap-4', className)}>{children}</div>;
}
