import { useMemo } from 'react';
import { FormSection, FormField, inputClass } from './FormSection';
import { computeLoanSchedule, computeDSCR, fmtFCFA } from '../../lib/financing-engine';
import { computeSIG } from '../../lib/sig-engine';
import { computeBFR } from '../../lib/sig-engine';
import { computeAmortizationTable, totalByYear, totalInvestments } from '../../lib/amortization-engine';
import { useProjectStore } from '../../store/projectStore';
import { BANQUES_BENIN, type Financement } from '../../types/project';

interface Props {
  onValidate?: (f: Financement) => void;
}

export function FinancementCard({ onValidate }: Props) {
  const f = useProjectStore((s) => s.financement);
  const update = useProjectStore((s) => s.updateFinancement);
  const hypotheses = useProjectStore((s) => s.hypotheses);
  const investments = useProjectStore((s) => s.investments);

  // Valeurs dérivées du store
  const investissementTotal = useMemo(() => totalInvestments(investments), [investments]);
  const dotations = useMemo(
    () => totalByYear(computeAmortizationTable(investments, 3), 0),
    [investments],
  );
  const sig = useMemo(() => computeSIG(hypotheses, dotations), [hypotheses, dotations]);
  const bfrInitial = useMemo(() => computeBFR(hypotheses, sig.ca).bfr, [hypotheses, sig.ca]);

  const schedule = useMemo(() => computeLoanSchedule(f), [f]);
  const dscrTable = useMemo(() => computeDSCR(schedule, sig.resultatExpl, dotations), [schedule, sig.resultatExpl, dotations]);

  const remboursementA1 = schedule[0]?.amortissement ?? 0;
  const totalEmplois = investissementTotal + bfrInitial + remboursementA1;
  const totalRessources = f.capitalSocial + f.apportCompteCourant + f.subventions + f.empruntMontant;
  const ecart = totalRessources - totalEmplois;

  const ressourcesStables = totalRessources;
  const emploisStables = investissementTotal;
  const frng = ressourcesStables - emploisStables;
  const tresorerie = frng - bfrInitial;

  const ajusterEmprunt = () => {
    const gap = totalEmplois - (f.capitalSocial + f.apportCompteCourant + f.subventions);
    update('empruntMontant', Math.max(0, Math.ceil(gap / 100_000) * 100_000));
  };

  const handleValidate = () => {
    if (onValidate) onValidate(f);
    else alert(`✅ Financement validé\nÉquilibre : ${ecart >= 0 ? '+' : ''}${fmtFCFA(ecart)} FCFA`);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">💰 Financement</h2>
        <p className="text-sm text-slate-500 mt-1">Plan de financement — Équilibre Emplois / Ressources</p>
      </div>

      <FormSection title="1. Ressources" icon="📥">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Capital social" unit="FCFA" required>
            <input type="number" value={f.capitalSocial}
              onChange={(e) => update('capitalSocial', Number(e.target.value))}
              className={inputClass} step={100000} />
          </FormField>
          <FormField label="Apport compte courant" unit="FCFA">
            <input type="number" value={f.apportCompteCourant}
              onChange={(e) => update('apportCompteCourant', Number(e.target.value))}
              className={inputClass} step={100000} />
          </FormField>
          <FormField label="Subventions" unit="FCFA">
            <input type="number" value={f.subventions}
              onChange={(e) => update('subventions', Number(e.target.value))}
              className={inputClass} step={100000} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Banque" required>
            <select value={f.empruntBanque}
              onChange={(e) => update('empruntBanque', e.target.value)}
              className={inputClass}>
              {BANQUES_BENIN.map((b) => <option key={b}>{b}</option>)}
            </select>
          </FormField>
          <FormField label="Montant emprunt" unit="FCFA" required>
            <div className="flex gap-2">
              <input type="number" value={f.empruntMontant}
                onChange={(e) => update('empruntMontant', Number(e.target.value))}
                className={inputClass} step={100000} />
              <button type="button" onClick={ajusterEmprunt}
                className="shrink-0 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 whitespace-nowrap">
                Ajuster
              </button>
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Taux" unit="%" required>
            <input type="number" value={f.empruntTaux}
              onChange={(e) => update('empruntTaux', Number(e.target.value))}
              className={inputClass} step={0.1} />
          </FormField>
          <FormField label="Durée" unit="ans" required>
            <input type="number" value={f.empruntDuree}
              onChange={(e) => update('empruntDuree', Math.max(1, Number(e.target.value)))}
              className={inputClass} min={1} />
          </FormField>
          <FormField label="Différé" unit="mois">
            <input type="number" value={f.empruntDiffere}
              onChange={(e) => update('empruntDiffere', Math.max(0, Number(e.target.value)))}
              className={inputClass} min={0} max={f.empruntDuree * 12 - 1} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="2. Emplois" icon="📤">
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-2.5 text-slate-700">Investissements (Carte 4)</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-medium">{fmtFCFA(investissementTotal)} FCFA</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-2.5 text-slate-700">BFR initial (Carte 3)</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-medium">{fmtFCFA(bfrInitial)} FCFA</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700">Remb. capital (Année 1)</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-medium">{fmtFCFA(remboursementA1)} FCFA</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-300">
                <td className="px-4 py-2.5 font-semibold text-slate-900">TOTAL EMPLOIS</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-bold text-slate-900">{fmtFCFA(totalEmplois)} FCFA</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </FormSection>

      <FormSection title="3. Équilibre" icon="⚖️">
        <div className={`rounded-xl border-2 p-4 ${ecart >= 0 ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{ecart >= 0 ? '✅ Ressources ≥ Emplois' : '⚠️ Ressources insuffisantes'}</span>
            <span className={`font-bold tabular-nums text-lg ${ecart >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
              {ecart >= 0 ? '+' : ''}{fmtFCFA(ecart)} FCFA
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-white border border-slate-200 p-2.5">
              <div className="text-slate-500">Total Ressources</div>
              <div className="font-semibold tabular-nums">{fmtFCFA(totalRessources)} FCFA</div>
            </div>
            <div className="rounded-lg bg-white border border-slate-200 p-2.5">
              <div className="text-slate-500">Total Emplois</div>
              <div className="font-semibold tabular-nums">{fmtFCFA(totalEmplois)} FCFA</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">FRNG</div>
            <div className="mt-1 text-sm font-semibold tabular-nums text-slate-900">{fmtFCFA(frng)} FCFA</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">BFR</div>
            <div className="mt-1 text-sm font-semibold tabular-nums text-slate-900">{fmtFCFA(bfrInitial)} FCFA</div>
          </div>
          <div className={`rounded-xl border p-3 ${tresorerie >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
            <div className="text-[11px] uppercase tracking-wide font-medium text-slate-600">Trésorerie</div>
            <div className={`mt-1 text-sm font-semibold tabular-nums ${tresorerie >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
              {tresorerie >= 0 ? '' : '−'}{fmtFCFA(Math.abs(tresorerie))} FCFA
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="4. Amortissement de l'emprunt" icon="🏦">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide">Année</th>
                <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wide">Capital début</th>
                <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wide">Intérêts</th>
                <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wide">Amortissement</th>
                <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wide">Annuité</th>
                <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wide">Capital fin</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((y) => (
                <tr key={y.annee} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-700 font-medium">A{y.annee}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtFCFA(y.capitalDebut)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-rose-700">{fmtFCFA(y.interets)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtFCFA(y.amortissement)}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">{fmtFCFA(y.annuite)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-500">{fmtFCFA(y.capitalFin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormSection>

      <FormSection title="5. DSCR" icon="📊">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide">Année</th>
                <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wide">CAF</th>
                <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wide">Annuité</th>
                <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wide">DSCR</th>
                <th className="text-center px-3 py-2 text-[11px] font-semibold uppercase tracking-wide w-20">Seuil</th>
              </tr>
            </thead>
            <tbody>
              {dscrTable.map((d) => (
                <tr key={d.annee} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-700 font-medium">A{d.annee}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtFCFA(d.caf)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtFCFA(d.annuite)}</td>
                  <td className={`px-3 py-2 text-right tabular-nums font-semibold ${d.ok ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {d.dscr.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {d.ok ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">✅</span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">⚠️</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormSection>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={handleValidate}
          className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-black">
          Valider le financement →
        </button>
      </div>
    </div>
  );
}
