import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../lib/mockup-data';

interface Slice {
  name: string;
  value: number;
}

const DEFAULT_DATA: Slice[] = [
  { name: 'Achats matières', value: 3_800_000 },
  { name: 'Personnel', value: 1_500_000 },
  { name: 'Loyer', value: 600_000 },
  { name: 'Transport', value: 480_000 },
  { name: 'Énergie', value: 350_000 },
  { name: 'Autres', value: 350_000 },
];

const fmtTip = (v: number) => v.toLocaleString('fr-FR') + ' FCFA';

interface Props {
  data?: Slice[];
  title?: string;
  subtitle?: string;
}

export function RepartitionChart({
  data = DEFAULT_DATA,
  title = 'Répartition des charges',
  subtitle = 'Part de chaque poste (FCFA / mois)',
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS.series[i % COLORS.series.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: `1px solid ${COLORS.border}`, fontSize: 12 }}
            formatter={fmtTip}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
