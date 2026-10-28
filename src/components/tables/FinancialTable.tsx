import clsx from 'clsx';

export interface TableRow {
  label: string;
  values: (string | number)[];
  bold?: boolean;
  separator?: boolean;
}

interface Props {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: TableRow[];
}

export function FinancialTable({ title, subtitle, columns, rows }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wide">Poste</th>
              {columns.map((c) => (
                <th key={c} className="text-right px-5 py-3 font-medium text-xs uppercase tracking-wide whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={clsx(
                  'border-t border-slate-100',
                  row.bold && 'bg-slate-50 font-semibold',
                  row.separator && 'border-t-2 border-slate-300',
                )}
              >
                <td className="px-5 py-2.5 text-slate-700">{row.label}</td>
                {row.values.map((v, j) => (
                  <td key={j} className="px-5 py-2.5 text-right text-slate-900 mono tabular-nums">
                    {typeof v === 'number' ? v.toLocaleString('fr-FR') : v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
