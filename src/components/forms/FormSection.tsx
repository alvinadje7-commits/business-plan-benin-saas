import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  icon?: string;
  children: ReactNode;
}

export function FormSection({ title, icon, children }: SectionProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        {icon && <span className="text-lg">{icon}</span>}
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  unit?: string;
  children: ReactNode;
}

export function FormField({ label, required, hint, unit, children }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
        {unit && <span className="ml-1 text-slate-400 font-normal">({unit})</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

export const inputClass =
  'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:border-[#0F172A] focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition';

export const grid2 = 'grid grid-cols-1 md:grid-cols-2 gap-4';
