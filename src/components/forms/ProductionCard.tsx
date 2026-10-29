import { useProductionModel } from '../../hooks/useProductionModel';

function fmt(n: number): string {
  return Math.round(n).toLocaleString('fr-FR');
}

export function ProductionCard() {
  const data = useProductionModel();

  if (!data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Choisis un secteur dans la carte 2 pour voir la production.</p>
      </div>
    );
  }

  const { revenue, costs, quantities, technical, kpis, durationYears } = data;
  const monthlyTotals: number[] = revenue.map((r, m) => r - costs.reduce((s, c) => s + c.values[m], 0));
  const totalCA = revenue.reduce((s, v) => s + v, 0);
  const totalCosts = costs.reduce((s, c) => s + c.values.reduce((a, b) => a + b, 0), 0);

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs text-slate-500">CA cumulé ({durationYears} ans)</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{fmt(totalCA)} FCFA</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs text-slate-500">CV cumulées</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{fmt(totalCosts)} FCFA</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs text-slate-500">Marge brute cumulée</p>
          <p className="mt-1 text-lg font-semibold text-emerald-700">{fmt(totalCA - totalCosts)} FCFA</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs text-slate-500">Production mois 6</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{fmt(revenue[5] ?? 0)} FCFA</p>
        </div>
      </div>

      {/* KPIs sectoriels */}
      {kpis.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">KPIs sectoriels</h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-lg bg-slate-50 p-2">
                <p className="text-xs text-slate-500">{k.label}</p>
                <p className="text-sm font-semibold text-slate-900">
                  {typeof k.value === 'number' ? fmt(k.value) : k.value}
                  {k.unit ? ` ${k.unit}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fiche technique */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Fiche technique</h3>
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          {technical.map((t) => (
            <div key={t.label} className="flex justify-between border-b border-slate-100 py-1 text-sm">
              <dt className="text-slate-500">{t.label}</dt>
              <dd className="font-medium text-slate-900">{t.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Détail coûts */}
      {costs.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Charges variables mensuelles</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="px-2 py-1">Poste</th>
                  <th className="px-2 py-1 text-right">Total cumulé</th>
                  <th className="px-2 py-1 text-right">Mois 6</th>
                </tr>
              </thead>
              <tbody>
                {costs.map((c) => (
                  <tr key={c.key} className="border-t border-slate-100">
                    <td className="px-2 py-1">{c.label}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt(c.values.reduce((a, b) => a + b, 0))}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt(c.values[5] ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quantités */}
      {Object.keys(quantities).length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Quantités mensuelles</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="px-2 py-1">Produit</th>
                  <th className="px-2 py-1 text-right">Total cumulé</th>
                  <th className="px-2 py-1 text-right">Mois 6</th>
                  <th className="px-2 py-1 text-right">Mois 12</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(quantities).map(([label, values]) => (
                  <tr key={label} className="border-t border-slate-100">
                    <td className="px-2 py-1">{label}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt(values.reduce((a, b) => a + b, 0))}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt(values[5] ?? 0)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt(values[11] ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Marge nette */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Marge brute mensuelle (CA − CV)</h3>
        <div className="mt-2 grid grid-cols-3 gap-2 text-sm sm:grid-cols-6">
          {[0, 3, 5, 11, 17, monthlyTotals.length - 1].map((m) => (
            <div key={m} className="rounded bg-slate-50 p-2">
              <p className="text-xs text-slate-500">Mois {m + 1}</p>
              <p className="text-sm font-semibold tabular-nums">{fmt(monthlyTotals[m] ?? 0)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
