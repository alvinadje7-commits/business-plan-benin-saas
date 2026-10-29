import { useMemo, useState } from 'react';
import { FormSection, inputClass } from './FormSection';
import { useProjectStore } from '../../store/projectStore';
import { computeSalaries } from '../../lib/charges-salaires';
import { computeChargesExternes } from '../../lib/charges-externes';
import { computeImpotsTaxes } from '../../lib/impots-taxes';
import { computeChargesExploitation } from '../../lib/charges-exploitation';
import { useProductionModel } from '../../hooks/useProductionModel';
import type { SalaryLine } from '../../lib/charges-salaires';
import type { ChargeExterne } from '../../lib/charges-externes';
import type { TaxLine } from '../../lib/impots-taxes';

type Tab = 'variables' | 'externes' | 'salaires' | 'taxes' | 'synthese';

function fmt(n: number): string {
  return Math.round(n).toLocaleString('fr-FR');
}

const DEFAULT_SALAIRES: SalaryLine[] = [
  { id: 's1', poste: 'Gérant', monthly: 150000, socialCharges: 1, fiscalCharges: 1, recruitments: [{ year: 1, count: 1 }] },
  { id: 's2', poste: 'Comptable', monthly: 100000, socialCharges: 1, fiscalCharges: 1, recruitments: [{ year: 1, count: 1 }] },
  { id: 's3', poste: 'Technicien', monthly: 80000, socialCharges: 1, fiscalCharges: 1, recruitments: [{ year: 1, count: 2 }] },
];

const DEFAULT_EXTERNES: ChargeExterne[] = [
  { id: 'e1', label: 'Loyer', monthly: 100000 },
  { id: 'e2', label: 'Électricité', monthly: 50000 },
  { id: 'e3', label: 'Internet & téléphone', monthly: 30000 },
  { id: 'e4', label: 'Honoraires comptable', monthly: 40000 },
];

const DEFAULT_TAXES: TaxLine[] = [
  { id: 't1', label: 'Patente', monthly: 25000 },
  { id: 't2', label: 'Taxes locales', monthly: 10000 },
];

export function ChargesCard() {
  const [tab, setTab] = useState<Tab>('synthese');
  const hypotheses = useProjectStore((s) => s.hypotheses) as { dureeEtude?: number } | null;
  const durationYears = hypotheses?.dureeEtude ?? 7;

  const [salaires, setSalaires] = useState<SalaryLine[]>(DEFAULT_SALAIRES);
  const [externes, setExternes] = useState<ChargeExterne[]>(DEFAULT_EXTERNES);
  const [taxes, setTaxes] = useState<TaxLine[]>(DEFAULT_TAXES);

  const prod = useProductionModel();
  const cvMonthly = useMemo(() => {
    if (!prod) return new Array(durationYears * 12).fill(0);
    const out = new Array(durationYears * 12).fill(0);
    prod.costs.forEach((c) => c.values.forEach((v, i) => { out[i] += v; }));
    return out;
  }, [prod, durationYears]);

  const salairesResult = useMemo(() => computeSalaries(salaires, durationYears), [salaires, durationYears]);
  const externesResult = useMemo(() => computeChargesExternes(externes, durationYears), [externes, durationYears]);
  const resultatAvantImpot = useMemo(() => {
    // approximation : CA - CV - CE - salaires
    const ca = prod ? prod.revenue : [];
    const annual = new Array(durationYears).fill(0);
    for (let y = 0; y < durationYears; y++) {
      const caY = ca.slice(y * 12, (y + 1) * 12).reduce((s, v) => s + v, 0);
      const cvY = cvMonthly.slice(y * 12, (y + 1) * 12).reduce((s, v) => s + v, 0);
      annual[y] = caY - cvY - externesResult.totalAnnual[y] - salairesResult.totalAnnual[y];
    }
    return annual;
  }, [prod, cvMonthly, externesResult, salairesResult, durationYears]);

  const secteur = useProjectStore((s) => s.sectorCode) ?? 'autres';
  const taxesResult = useMemo(
    () => computeImpotsTaxes({ lines: taxes, sectorCode: secteur, resultatAvantImpot, durationYears }),
    [taxes, secteur, resultatAvantImpot, durationYears]
  );

  const synthese = useMemo(
    () => computeChargesExploitation({
      cvMonthly,
      ceMonthly: externesResult.totalMonthly,
      salairesMonthly: salairesResult.totalMonthly,
      taxesMonthly: taxesResult.totalMonthly,
      impotResultatAnnuel: taxesResult.impotResultatAnnuel,
      durationYears,
    }),
    [cvMonthly, externesResult, salairesResult, taxesResult, durationYears]
  );

  const TABS: { key: Tab; label: string }[] = [
    { key: 'variables', label: 'Variables' },
    { key: 'externes', label: 'Externes' },
    { key: 'salaires', label: 'Salaires' },
    { key: 'taxes', label: 'Taxes' },
    { key: 'synthese', label: 'Synthèse' },
  ];

  return (
    <FormSection title="Charges d'exploitation" icon="💸">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 mb-3">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-t-lg ${
              tab === t.key ? 'bg-[#0F172A] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'variables' && (
        <div className="text-sm text-slate-600">
          <p>Total CV cumulées : <span className="font-semibold">{fmt(cvMonthly.reduce((s, v) => s + v, 0))} FCFA</span></p>
          <p className="mt-1 text-xs">Source : Carte Production (Sprint 4).</p>
        </div>
      )}

      {tab === 'externes' && (
        <div className="space-y-2">
          {externes.map((l, i) => (
            <div key={l.id} className="flex items-center gap-2">
              <input className={inputClass + ' flex-1'} value={l.label}
                onChange={(e) => { const c = [...externes]; c[i] = { ...c[i], label: e.target.value }; setExternes(c); }} />
              <input type="number" className={inputClass + ' w-32'} value={l.monthly}
                onChange={(e) => { const c = [...externes]; c[i] = { ...c[i], monthly: +e.target.value }; setExternes(c); }} />
            </div>
          ))}
          <p className="text-xs text-slate-500">Total mensuel A1 : {fmt(externesResult.totalMonthly[0] ?? 0)} FCFA · A7 : {fmt(externesResult.totalMonthly[durationYears * 12 - 1] ?? 0)} FCFA</p>
        </div>
      )}

      {tab === 'salaires' && (
        <div className="space-y-2">
          {salaires.map((l, i) => (
            <div key={l.id} className="grid grid-cols-3 gap-2">
              <input className={inputClass} value={l.poste}
                onChange={(e) => { const c = [...salaires]; c[i] = { ...c[i], poste: e.target.value }; setSalaires(c); }} />
              <input type="number" className={inputClass} value={l.monthly}
                onChange={(e) => { const c = [...salaires]; c[i] = { ...c[i], monthly: +e.target.value }; setSalaires(c); }} />
              <input type="number" className={inputClass} value={l.recruitments[0]?.count ?? 0}
                onChange={(e) => { const c = [...salaires]; c[i] = { ...c[i], recruitments: [{ year: 1, count: +e.target.value }] }; setSalaires(c); }} />
            </div>
          ))}
          <p className="text-xs text-slate-500">Total annuel A1 : {fmt(salairesResult.totalAnnual[0] ?? 0)} FCFA · A7 : {fmt(salairesResult.totalAnnual[durationYears - 1] ?? 0)} FCFA</p>
        </div>
      )}

      {tab === 'taxes' && (
        <div className="space-y-2">
          {taxes.map((l, i) => (
            <div key={l.id} className="flex items-center gap-2">
              <input className={inputClass + ' flex-1'} value={l.label}
                onChange={(e) => { const c = [...taxes]; c[i] = { ...c[i], label: e.target.value }; setTaxes(c); }} />
              <input type="number" className={inputClass + ' w-32'} value={l.monthly}
                onChange={(e) => { const c = [...taxes]; c[i] = { ...c[i], monthly: +e.target.value }; setTaxes(c); }} />
            </div>
          ))}
          <p className="text-xs text-slate-500">Impôt résultat (secteur {secteur}) — A1 : {fmt(taxesResult.impotResultatAnnuel[0] ?? 0)} FCFA</p>
        </div>
      )}

      {tab === 'synthese' && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="px-2 py-1">Année</th>
                <th className="px-2 py-1 text-right">CV</th>
                <th className="px-2 py-1 text-right">Externes</th>
                <th className="px-2 py-1 text-right">Salaires</th>
                <th className="px-2 py-1 text-right">Taxes</th>
                <th className="px-2 py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: durationYears }, (_, y) => {
                const cv = cvMonthly.slice(y * 12, (y + 1) * 12).reduce((s, v) => s + v, 0);
                return (
                  <tr key={y} className="border-t border-slate-100">
                    <td className="px-2 py-1 font-medium">A{y + 1}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt(cv)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt(externesResult.totalAnnual[y] ?? 0)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt(salairesResult.totalAnnual[y] ?? 0)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt(taxesResult.totalAnnual[y] ?? 0)}</td>
                    <td className="px-2 py-1 text-right tabular-nums font-semibold">{fmt(synthese.totalAnnual[y] ?? 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </FormSection>
  );
}
