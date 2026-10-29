import type { ReactNode } from 'react';
import { useState } from 'react';

/* ============================================================
   FORM SECTION (simple, non repliable)
   ============================================================ */
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

/* ============================================================
   ACCORDION GROUP (repliable, avec badge + warning)
   ============================================================ */
interface AccordionProps {
  title: string;
  icon: string;
  description?: string;
  badge?: string;
  hasWarning?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function AccordionGroup({
  title,
  icon,
  description,
  badge,
  hasWarning,
  defaultOpen = false,
  children,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-base">{icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-slate-900 truncate">{title}</h3>
              {hasWarning && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-medium whitespace-nowrap">
                  ⚠️ hors plage
                </span>
              )}
            </div>
            {description && (
              <p className="text-[11px] text-slate-500 truncate">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {badge && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {badge}
            </span>
          )}
          <span
            className={`text-slate-400 transition-transform text-xs ${open ? 'rotate-90' : ''}`}
          >
            ▶
          </span>
        </div>
      </button>
      {open && <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">{children}</div>}
    </div>
  );
}

/* ============================================================
   FORM FIELD
   ============================================================ */
interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  unit?: string;
  warning?: string;
  children: ReactNode;
}

export function FormField({ label, required, hint, unit, warning, children }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
        {unit && <span className="ml-1 text-slate-400 font-normal">({unit})</span>}
      </label>
      {children}
      {warning ? (
        <p className="text-[11px] text-amber-700 mt-1 font-medium">⚠️ {warning}</p>
      ) : (
        hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>
      )}
    </div>
  );
}

export const inputClass =
  'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:border-[#0F172A] focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition';

export const grid2 = 'grid grid-cols-1 md:grid-cols-2 gap-4';
