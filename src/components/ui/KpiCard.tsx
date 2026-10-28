import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

type KpiColor = 'primary' | 'accent' | 'amber' | 'blue' | 'danger';

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  trend?: { value: number; label?: string };
  color?: KpiColor;
  hint?: string;
}

const COLOR_MAP: Record<KpiColor, { bg: string; text: string; iconBg: string; iconText: string }> = {
  primary: { bg: 'bg-slate-50', text: 'text-slate-900', iconBg: 'bg-slate-900', iconText: 'text-white' },
  accent:  { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-500', iconText: 'text-white' },
  amber:   { bg: 'bg-amber-50',  text: 'text-amber-700', iconBg: 'bg-amber-500', iconText: 'text-white' },
  blue:    { bg: 'bg-blue-50',   text: 'text-blue-700', iconBg: 'bg-blue-500', iconText: 'text-white' },
  danger:  { bg: 'bg-red-50',    text: 'text-red-700', iconBg: 'bg-red-500', iconText: 'text-white' },
};

export function KpiCard({ label, value, unit, icon: Icon, trend, color = 'primary', hint }: KpiCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div className={clsx('rounded-xl border border-slate-200 bg-white p-2.5 lg:p-3 shadow-sm transition-shadow hover:shadow-md', c.bg)}>
      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 truncate">{label}</p>
          <p className={clsx('mt-0.5 truncate text-sm lg:text-lg font-bold leading-tight', c.text)}>
            {value}
            {unit && <span className="ml-0.5 text-[9px] lg:text-[10px] font-medium text-slate-500">{unit}</span>}
          </p>
          {hint && <p className="mt-0.5 truncate text-[9px] lg:text-[10px] text-slate-400">{hint}</p>}
        </div>
        {Icon && (
          <div className={clsx('hidden sm:flex h-6 w-6 lg:h-8 lg:w-8 shrink-0 items-center justify-center rounded-lg', c.iconBg, c.iconText)}>
            <Icon size={14} />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-1.5 flex items-center gap-1 text-[9px]">
          <span
            className={clsx(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold',
              trend.value >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
            )}
          >
            {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value).toFixed(1)}%
          </span>
          {trend.label && <span className="text-slate-400 truncate">{trend.label}</span>}
        </div>
      )}
    </div>
  );
}
