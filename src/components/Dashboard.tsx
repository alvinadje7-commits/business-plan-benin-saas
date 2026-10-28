import { useMemo } from 'react';
import { KpiCard } from './ui/KpiCard';
import { CaChart } from './charts/CaChart';
import { TresorerieChart } from './charts/TresorerieChart';
import { ChargesChart } from './charts/ChargesChart';
import { RepartitionChart } from './charts/RepartitionChart';
import { computeFinancialResult, fmtFCFA } from '../lib/financial-statements-engine';
import { useProjectStore } from '../store/projectStore';

export function Dashboard() {
  const hypotheses = useProjectStore((s) => s.hypotheses);
  const investments = useProjectStore((s) => s.investments);
  const financement = useProjectStore((s) => s.financement);

  const { kpis } = useMemo(
    () => computeFinancialResult(hypotheses, investments, financement),
    [hypotheses, investments, financement],
  );

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">📊 Tableau de bord</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Scénario <b>Normal</b> — KPIs bancaires et graphiques financiers
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <KpiCard label="VAN (12%)" value={fmtFCFA(kpis.van)} unit="FCFA" hint={kpis.van > 0 ? 'Rentable' : 'Non rentable'} color={kpis.van > 0 ? 'accent' : 'danger'} />
        <KpiCard label="TRI" value={kpis.tri.toFixed(1)} unit="%" hint="Rentabilité" color={kpis.tri > 12 ? 'accent' : 'primary'} />
        <KpiCard label="Délai récup." value={String(kpis.delaiRecupMois)} unit="mois" hint={`${(kpis.delaiRecupMois / 12).toFixed(1)} ans`} color="primary" />
        <KpiCard label="Seuil rentab." value={fmtFCFA(kpis.seuilRentabilite)} unit="FCFA" hint="CA min" color="primary" />
        <KpiCard label="DSCR" value={kpis.dscr.toFixed(2)} hint={kpis.dscr >= 1.2 ? 'OK' : 'À surveiller'} color={kpis.dscr >= 1.2 ? 'accent' : 'danger'} />
        <KpiCard label="Marge nette" value={kpis.margeNette.toFixed(1)} unit="%" hint="RN / CA" color={kpis.margeNette > 10 ? 'accent' : 'primary'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <CaChart />
        <TresorerieChart />
        <ChargesChart />
        <RepartitionChart />
      </div>
    </div>
  );
}
