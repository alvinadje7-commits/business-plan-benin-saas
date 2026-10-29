import { useMemo } from 'react';
import { KpiCard } from './ui/KpiCard';
import { CaChart } from './charts/CaChart';
import { TresorerieChart } from './charts/TresorerieChart';
import { ChargesChart } from './charts/ChargesChart';
import { RepartitionChart } from './charts/RepartitionChart';
import { computeFinancialResult, fmtFCFA } from '../lib/financial-statements-engine';
import { useProjectStore } from '../store/projectStore';
import { getSectorConfig } from '../lib/sectors-config';

export function Dashboard() {
  const hypotheses = useProjectStore((s) => s.hypotheses);
  const investments = useProjectStore((s) => s.investments);
  const financement = useProjectStore((s) => s.financement);
  const sectorCode = useProjectStore((s) => s.sectorCode);
  const sectorValues = useProjectStore((s) => s.sectorValues);

  const { kpis } = useMemo(
    () => computeFinancialResult(hypotheses, investments, financement),
    [hypotheses, investments, financement],
  );

  const sector = getSectorConfig(sectorCode);
  const sectorKpis = useMemo(
    () => sector.kpisSpecifiques(sectorValues),
    [sector, sectorValues],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">📊 Tableau de bord</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Secteur <b>{sector.icon} {sector.name}</b> • Scénario <b>Normal</b>
          </p>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
          ● Données synchronisées
        </span>
      </div>

      {/* KPIs bancaires */}
      <div>
        <h3 className="text-[11px] uppercase tracking-wide font-semibold text-slate-500 mb-1.5">
          Indicateurs bancaires
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <KpiCard label="VAN (12%)" value={fmtFCFA(kpis.van)} unit="FCFA" hint={kpis.van > 0 ? 'Rentable' : 'Non rentable'} color={kpis.van > 0 ? 'accent' : 'danger'} />
          <KpiCard label="TRI" value={kpis.tri.toFixed(1)} unit="%" hint="Rentabilité" color={kpis.tri > 12 ? 'accent' : 'primary'} />
          <KpiCard label="Délai récup." value={String(kpis.delaiRecupMois)} unit="mois" hint={`${(kpis.delaiRecupMois / 12).toFixed(1)} ans`} color="primary" />
          <KpiCard label="Seuil rentab." value={fmtFCFA(kpis.seuilRentabilite)} unit="FCFA" hint="CA min" color="primary" />
          <KpiCard label="DSCR" value={kpis.dscr.toFixed(2)} hint={kpis.dscr >= 1.2 ? 'OK' : 'À surveiller'} color={kpis.dscr >= 1.2 ? 'accent' : 'danger'} />
          <KpiCard label="Marge nette" value={kpis.margeNette.toFixed(1)} unit="%" hint="RN / CA" color={kpis.margeNette > 10 ? 'accent' : 'primary'} />
        </div>
      </div>

      {/* KPIs sectoriels */}
      <div>
        <h3 className="text-[11px] uppercase tracking-wide font-semibold text-slate-500 mb-1.5">
          Indicateurs {sector.name}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {sectorKpis.map((kpi, i) => (
            <div
              key={i}
              className={`rounded-lg border p-2.5 ${
                kpi.color === 'accent' ? 'border-emerald-200 bg-emerald-50'
                : kpi.color === 'danger' ? 'border-red-200 bg-red-50'
                : kpi.color === 'amber' ? 'border-amber-200 bg-amber-50'
                : kpi.color === 'blue' ? 'border-blue-200 bg-blue-50'
                : 'border-slate-200 bg-white'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wide text-slate-600 font-medium truncate">
                {kpi.label}
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900 leading-tight truncate">
                {kpi.value}
              </div>
              {kpi.hint && <div className="text-[10px] text-slate-500 mt-0.5 truncate">{kpi.hint}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <CaChart />
        <TresorerieChart />
        <ChargesChart />
        <RepartitionChart />
      </div>
    </div>
  );
}
