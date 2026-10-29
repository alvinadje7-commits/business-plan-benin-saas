import { useState } from 'react';
import type { KPIs } from '../types/project';
import { fmtFCFA } from '../lib/financial-statements-engine';

interface Props { kpis: KPIs; }

export function RentabiliteDetailCard({ kpis }: Props) {
  const [open, setOpen] = useState(true);
  const fmtPct = (v: number) => (v * 100).toFixed(1) + ' %';
  const taux = kpis.tauxActualisation;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-left">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">🧮 Détail du calcul de rentabilité</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Taux actualisation <b>{fmtPct(taux)}</b> · Horizon <b>{kpis.horizonAnnees} ans</b> · IS appliqué <b>{fmtPct(kpis.tauxISApplique)}</b>
          </p>
        </div>
        <span className="text-xs text-slate-400">{open ? '▼' : '▶'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-[11px] font-mono text-slate-700 space-y-1">
            <div>FCF(t) = EBE(t) − IS(t) − ΔBFR(t) + VRNI(t)</div>
            <div>VAN = −InvestInit + Σ FCF(t) / (1 + {fmtPct(taux)})^t</div>
            <div>TRI = taux r tel que VAN(r) = 0</div>
            <div>DRCI = date où Σ FCF cumulés ≥ InvestInit</div>
            <div>DSCR(A1) = (EBE − IS − ΔBFR) / Annuité emprunt</div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="px-2 py-1">Année</th>
                  <th className="px-2 py-1 text-right">EBE</th>
                  <th className="px-2 py-1 text-right">IS</th>
                  <th className="px-2 py-1 text-right">ΔBFR</th>
                  <th className="px-2 py-1 text-right">VRNI</th>
                  <th className="px-2 py-1 text-right font-semibold">FCF</th>
                  <th className="px-2 py-1 text-right">FCF actualisé</th>
                  <th className="px-2 py-1 text-right">FCF cumulé</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100 bg-red-50/40">
                  <td className="px-2 py-1 font-medium">t=0</td>
                  <td className="px-2 py-1 text-right">—</td>
                  <td className="px-2 py-1 text-right">—</td>
                  <td className="px-2 py-1 text-right">—</td>
                  <td className="px-2 py-1 text-right">—</td>
                  <td className="px-2 py-1 text-right font-semibold tabular-nums text-red-700">−{fmtFCFA(kpis.investInit)}</td>
                  <td className="px-2 py-1 text-right tabular-nums text-red-700">−{fmtFCFA(kpis.investInit)}</td>
                  <td className="px-2 py-1 text-right tabular-nums text-red-700">−{fmtFCFA(kpis.investInit)}</td>
                </tr>
                {kpis.fcf.map((fcf, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-2 py-1 font-medium">A{i + 1}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmtFCFA(kpis.ebe[i])}</td>
                    <td className="px-2 py-1 text-right tabular-nums text-red-600">{kpis.is[i] > 0 ? '−' + fmtFCFA(kpis.is[i]) : '0'}</td>
                    <td className="px-2 py-1 text-right tabular-nums text-red-600">{kpis.deltaBfr[i] > 0 ? '−' + fmtFCFA(kpis.deltaBfr[i]) : fmtFCFA(-kpis.deltaBfr[i])}</td>
                    <td className="px-2 py-1 text-right tabular-nums text-emerald-600">{kpis.vnciYear[i] > 0 ? '+' + fmtFCFA(kpis.vnciYear[i]) : '—'}</td>
                    <td className="px-2 py-1 text-right tabular-nums font-semibold">{fmtFCFA(fcf)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmtFCFA(kpis.fcfActualises[i])}</td>
                    <td className="px-2 py-1 text-right tabular-nums font-medium">{fmtFCFA(kpis.fcfCumules[i])}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
                  <td colSpan={5} className="px-2 py-1 text-right">VAN = Σ FCF actualisés − InvestInit</td>
                  <td colSpan={3} className="px-2 py-1 text-right tabular-nums text-emerald-700">{fmtFCFA(kpis.van)} FCFA</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
            <div className="rounded-lg border border-slate-200 p-2">
              <div className="text-slate-500 uppercase">Taux actualisation</div>
              <div className="font-semibold text-sm">{fmtPct(taux)}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-2">
              <div className="text-slate-500 uppercase">Horizon</div>
              <div className="font-semibold text-sm">{kpis.horizonAnnees} ans</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-2">
              <div className="text-slate-500 uppercase">Invest. initial</div>
              <div className="font-semibold text-sm tabular-nums">{fmtFCFA(kpis.investInit)}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-2">
              <div className="text-slate-500 uppercase">VRNI (fin projet)</div>
              <div className="font-semibold text-sm tabular-nums">{fmtFCFA(kpis.vnci)}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-2">
              <div className="text-slate-500 uppercase">Taux IS appliqué</div>
              <div className="font-semibold text-sm">{fmtPct(kpis.tauxISApplique)}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-2">
              <div className="text-slate-500 uppercase">VAN</div>
              <div className={'font-semibold text-sm tabular-nums ' + (kpis.van > 0 ? 'text-emerald-700' : 'text-red-700')}>{fmtFCFA(kpis.van)}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-2">
              <div className="text-slate-500 uppercase">TRI</div>
              <div className="font-semibold text-sm">{kpis.tri.toFixed(1)} %</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-2">
              <div className="text-slate-500 uppercase">DSCR A1</div>
              <div className={'font-semibold text-sm ' + (kpis.dscr >= 1.2 ? 'text-emerald-700' : 'text-amber-700')}>
                {kpis.dscr.toFixed(2)}
                <div className="text-[10px] text-slate-400 font-normal">{fmtFCFA(kpis.cfadsA1)} / {fmtFCFA(kpis.annuiteA1)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
