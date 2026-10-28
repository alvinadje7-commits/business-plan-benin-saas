import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { COLORS, MONTHLY_SERIES, type MonthlyPoint } from '../../lib/mockup-data';

const fmtAxis = (v: number) => `${(v / 1_000_000).toFixed(0)} M`;
const fmtTip = (v: number) => v.toLocaleString('fr-FR') + ' FCFA';

interface Props {
  data?: MonthlyPoint[];
  title?: string;
  subtitle?: string;
}

export function TresorerieChart({
  data = MONTHLY_SERIES,
  title = 'Trésorerie cumulée',
  subtitle = 'Évolution mensuelle (FCFA)',
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">Trésorerie</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="tresoGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.chartAmber} stopOpacity={0.35} />
              <stop offset="100%" stopColor={COLORS.chartAmber} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="mois" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: `1px solid ${COLORS.border}`, fontSize: 12 }}
            formatter={fmtTip}
            labelStyle={{ fontWeight: 600, color: COLORS.primary }}
          />
          <ReferenceLine y={0} stroke="#94A3B8" />
          <Area type="monotone" dataKey="treso" name="Trésorerie" stroke={COLORS.chartAmber} strokeWidth={2.5} fill="url(#tresoGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
