import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { KpiCard } from '../ui/KpiCard';
import { computeFinancialResult, fmtFCFA } from '../../lib/financial-statements-engine';
import { useProjectStore } from '../../store/projectStore';
import type { Hypotheses } from '../../types/project';
import { COLORS } from '../../lib/mockup-data';

/**
 * Applique un facteur multiplicateur à des champs d'hypothèses.
 * Les champs absents du facteur restent inchangés.
 */
function applyFactors(
  h: Hypotheses,
  factors: Partial<Record<keyof Hypotheses, number>>,
): Hypotheses {
  const result: Hypotheses = { ...h };
  for (const key of Object.keys(factors) as (keyof Hypotheses)[]) {
    const factor = factors[key];
    if (typeof factor === 'number' && typeof h[key] === 'number') {
      (result[key] as number) = (h[key] as number) * factor;
    }
  }
  return result;
}

const PESSIMISTE_FACTORS: Partial<Record<keyof Hypotheses, number>> = {
  caMensuel: 0.80,
  pctAchats: 1.10,
  pctChargesExt: 1.10,
};

const OPTIMISTE_FACTORS: Partial<Record<keyof Hypotheses, number>> = {
  caMensuel: 1.20,
  pctAchats: 0.95,
  pctChargesExt: 0.95,
};

export function ScenariosView() {
  const workingHypotheses = useProjectStore((s) => s.hypotheses);
  const investments = useProjectStore((s) => s.investments);
  const financement = useProjectStore((s) => s.financement);

  const scenarios = useMemo(() => {
    const list = [
      {
        key: 'pessimiste' as const,
        label: 'Pessimiste',
        hint: 'CA −20 %, charges +10 %',
        hypotheses: applyFactors(workingHypotheses, PESSIMISTE_FACTORS),
      },
      {
        key: 'normal' as const,
        label: 'Normal',
        hint: 'Scénario travaillé (Carte 3)',
        hypotheses: workingHypotheses,
      },
      {
        key: 'optimiste' as const,
        label: 'Optimiste',
        hint: 'CA +20 %, charges −5 %',
        hypotheses: applyFactors(workingHypotheses, OPTIMISTE_FACTORS),
      },
    ];
    return list.map((s) => ({
      ...s,
      result: computeFinancialResult(s.hypotheses, investments, financement),
    }));
  }, [workingHypotheses, investments, financement]);

  const chartData = scenarios.map((r) => ({
    name: r.label,
    VAN: Math.round(r.result.kpis.van / 1_000_000),
    RN: Math.round(r.result.cr[0].rn / 1_000_000),
    CA: Math.round(r.result.cr[0].ca / 1_000_000),
  }));

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">📊 Scénarios comparés</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Le scénario <b>Normal</b> est celui que tu édites dans la Carte 3. Les deux autres sont dérivés automatiquement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map((r) => (
          <div
            key={r.key}
            className={`rounded-xl border-2 bg-white shadow-sm overflow-hidden ${
              r.key === 'normal' ? 'border-[#0F172A]' : 'border-slate-200'
            }`}
          >
            <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wide flex items-center justify-between ${
              r.key === 'pessimiste' ? 'bg-red-50 text-red-800' :
              r.key === 'optimiste' ? 'bg-emerald-50 text-emerald-800' :
              'bg-[#0F172A] text-white'
            }`}>
              <span>{r.label}</span>
              {r.key === 'normal' && <span className="text-[10px] opacity-80">● Actif</span>}
            </div>
            <div className="px-3 pt-2 text-[10px] text-slate-500">{r.hint}</div>
            <div className="p-3 space-y-2">
              <KpiCard label="VAN (12%)" value={fmtFCFA(r.result.kpis.van)} unit="FCFA" color={r.result.kpis.van > 0 ? 'accent' : 'danger'} />
              <KpiCard label="TRI" value={r.result.kpis.tri.toFixed(1)} unit="%" color={r.result.kpis.tri > 12 ? 'accent' : 'primary'} />
              <KpiCard label="RN Année 1" value={fmtFCFA(r.result.cr[0].rn)} unit="FCFA" color={r.result.cr[0].rn > 0 ? 'accent' : 'danger'} />
              <KpiCard label="DSCR A1" value={r.result.kpis.dscr.toFixed(2)} color={r.result.kpis.dscr >= 1.2 ? 'accent' : 'danger'} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <h3 className="text-sm font-semibold mb-2">Comparaison visuelle (M FCFA)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="CA" name="CA A1 (M FCFA)" fill={COLORS.chartBlue} radius={[4, 4, 0, 0]} />
            <Bar dataKey="RN" name="RN A1 (M FCFA)" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
            <Bar dataKey="VAN" name="VAN (M FCFA)" fill={COLORS.chartAmber} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
        <p className="font-semibold mb-1">💡 Comment ça marche</p>
        <p>
          Modifie une hypothèse dans l'Assistant → Carte 3 (par ex. CA mensuel 13,75 M → 15 M) →
          les <b>3 scénarios se recalculent instantanément</b>. Le scénario <b>Normal</b> reflète ta saisie,
          les deux autres appliquent automatiquement les facteurs ci-dessus.
        </p>
      </div>
    </div>
  );
}
