import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../lib/mockup-data';

interface ChargePoint {
  poste: string;
  fixes: number;
  variables: number;
}

const DEFAULT_DATA: ChargePoint[] = [
  { poste: 'Achats', fixes: 0, variables: 3_800_000 },
  { poste: 'Personnel', fixes: 1_500_000, variables: 0 },
  { poste: 'Loyer', fixes: 600_000, variables: 0 },
  { poste: 'Énergie', fixes: 350_000, variables: 0 },
  { poste: 'Transport', fixes: 0, variables: 480_000 },
  { poste: 'Autres', fixes: 200_000, variables: 150_000 },
];

const fmtAxis = (v: number) => `${(v / 1_000_000).toFixed(1)} M`;
const fmtTip = (v: number) => v.toLocaleString('fr-FR') + ' FCFA';

interface Props {
  data?: ChargePoint[];
  title?: string;
  subtitle?: string;
}

export function ChargesChart({
  data = DEFAULT_DATA,
  title = 'Charges par poste',
  subtitle = 'Fixes vs Variables (FCFA / mois)',
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="poste" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: `1px solid ${COLORS.border}`, fontSize: 12 }}
            formatter={fmtTip}
            labelStyle={{ fontWeight: 600, color: COLORS.primary }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="fixes" name="Charges fixes" stackId="a" fill={COLORS.chartBlue} />
          <Bar dataKey="variables" name="Charges variables" stackId="a" fill={COLORS.chartAmber} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
