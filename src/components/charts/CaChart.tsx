import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { COLORS, MONTHLY_SERIES, type MonthlyPoint } from '../../lib/mockup-data';

const fmtAxis = (v: number) => `${(v / 1_000_000).toFixed(0)} M`;
const fmtTip = (v: number) => v.toLocaleString('fr-FR') + ' FCFA';

interface Props {
  data?: MonthlyPoint[];
  title?: string;
  subtitle?: string;
}

export function CaChart({
  data = MONTHLY_SERIES,
  title = "Chiffre d'affaires & Résultat",
  subtitle = 'Évolution sur 12 mois (FCFA)',
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">XOF</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="mois" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: `1px solid ${COLORS.border}`, fontSize: 12 }}
            formatter={fmtTip}
            labelStyle={{ fontWeight: 600, color: COLORS.primary }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine y={0} stroke="#94A3B8" />
          <Bar dataKey="ca" name="Chiffre d'affaires" fill={COLORS.chartBlue} radius={[6, 6, 0, 0]} maxBarSize={32} />
          <Line dataKey="rn" name="Résultat net" stroke={COLORS.accent} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
