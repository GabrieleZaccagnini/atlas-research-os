'use client';

import { cn } from '@/lib/utils';

export function ChartContainer({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </div>
  );
}

export function AreaChartMock({
  data,
  height = 200,
  color = 'hsl(var(--primary))',
  showGrid = true,
}: {
  data: number[];
  height?: number;
  color?: string;
  showGrid?: boolean;
}) {
  const width = 600;
  const padding = 10;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (v - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {showGrid && (
        <>
          {[0.25, 0.5, 0.75].map((p) => (
            <line
              key={p}
              x1={padding}
              x2={width - padding}
              y1={padding + p * (height - padding * 2)}
              y2={padding + p * (height - padding * 2)}
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              strokeDasharray="4 4"
            />
          ))}
        </>
      )}
      <defs>
        <linearGradient id={`grad-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${color.replace(/[^a-z0-9]/gi, '')})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function BarChartMock({
  data,
  labels,
  height = 200,
  color = 'hsl(var(--primary))',
}: {
  data: number[];
  labels?: string[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(...data) || 1;
  const barWidth = 100 / data.length;

  return (
    <div>
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center justify-end">
            <div
              className="w-full rounded-t transition-all duration-500"
              style={{
                height: `${(v / max) * height}px`,
                backgroundColor: color,
                opacity: 0.3 + (v / max) * 0.7,
              }}
            />
          </div>
        ))}
      </div>
      {labels && (
        <div className="mt-2 flex gap-1">
          {labels.map((l, i) => (
            <span key={i} className="flex-1 text-center text-[10px] text-muted-foreground">
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function DonutChartMock({
  segments,
  size = 160,
  strokeWidth = 20,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={strokeWidth}
        />
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * circumference;
          const circle = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="round"
            />
          );
          offset += dash;
          return circle;
        })}
      </svg>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-muted-foreground">{seg.label}</span>
            <span className="ml-auto font-mono text-xs font-medium text-foreground">
              {((seg.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeatmapCell({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label?: string;
}) {
  const intensity = Math.min(value / max, 1);
  const bg = value > 0
    ? `rgba(99, 102, 241, ${0.1 + intensity * 0.5})`
    : `hsl(var(--secondary))`;

  return (
    <div
      className="flex h-10 items-center justify-center rounded text-xs font-medium transition-colors hover:ring-1 hover:ring-primary/30"
      style={{ backgroundColor: bg }}
      title={label}
    >
      {label && <span className="text-foreground/80">{label}</span>}
    </div>
  );
}
