import { FormSection } from './FormSection';
import {
  computeAmortizationTable, totalByYear, totalInvestments, totalVNC, fmtFCFA,
} from '../../lib/amortization-engine';
import { useProjectStore } from '../../store/projectStore';
import type { Investment, InvestmentCategory, AmortizationMode } from '../../types/project';

const CATEGORIES: InvestmentCategory[] = ['Incorporel', 'Corporel', 'Financier'];
const MODES: AmortizationMode[] = ['Linéaire', 'Dégressif'];
const DISPLAY_YEARS = 3;

const inputTiny =
  'w-full px-2 py-1 rounded-md border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400 bg-white';

interface Props {
  onValidate?: (investments: Investment[], dotationA1: number) => void;
}

export function InvestissementsCard({ onValidate }: Props) {
  const investments = useProjectStore((s) => s.investments);
  const updateInv = useProjectStore((s) => s.updateInvestment);
  const addInv = useProjectStore((s) => s.addInvestment);
  const removeInv = useProjectStore((s) => s.removeInvestment);

  const lines = computeAmortizationTable(investments, DISPLAY_YEARS);
  const totalBrut = totalInvestments(investments);
  const dotationA1 = totalByYear(lines, 0);
  const dotationA2 = totalByYear(lines, 1);
  const dotationA3 = totalByYear(lines, 2);
  const vncFinA3 = totalVNC(lines);

  const handleAdd = () => {
    addInv({
      id: 'inv' + Date.now(),
      label: '',
      category: 'Corporel',
      cost: 0,
      startDate: '2026-01-01',
      duration: 5,
      mode: 'Linéaire',
    });
  };

  const handleValidate = () => {
    if (onValidate) onValidate(investments, dotationA1);
    else alert(`✅ Investissements validés\nTotal : ${fmtFCFA(totalBrut)} FCFA`);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">🏗️ Investissements</h2>
        <p className="text-sm text-slate-500 mt-1">Immobilisations et amortissements SYSCOHADA</p>
      </div>

      <FormSection title="1. Tableau des immobilisations" icon="📋">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide">Désignation</th>
                <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide w-28">Catégorie</th>
                <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wide w-32">Coût (FCFA)</th>
                <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide w-32">Mise en service</th>
                <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wide w-20">Durée (ans)</th>
                <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide w-24">Mode</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {investments.map((inv) => (
                <tr key={inv.id} className="border-t border-slate-100">
                  <td className="px-3 py-1.5">
                    <input type="text" value={inv.label}
                      onChange={(e) => updateInv(inv.id, { label: e.target.value })}
                      className={inputTiny} placeholder="Ex : Poulailler" />
                  </td>
                  <td className="px-3 py-1.5">
                    <select value={inv.category}
                      onChange={(e) => updateInv(inv.id, { category: e.target.value as InvestmentCategory })}
                      className={inputTiny}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <input type="number" value={inv.cost}
                      onChange={(e) => updateInv(inv.id, { cost: Number(e.target.value) })}
                      className={`${inputTiny} text-right tabular-nums`} step={100000} />
                  </td>
                  <td className="px-3 py-1.5">
                    <input type="date" value={inv.startDate}
                      onChange={(e) => updateInv(inv.id, { startDate: e.target.value })}
                      className={inputTiny} />
                  </td>
                  <td className="px-3 py-1.5">
                    <input type="number" value={inv.duration}
                      onChange={(e) => updateInv(inv.id, { duration: Number(e.target.value) })}
                      className={`${inputTiny} text-right`} min={1} />
                  </td>
                  <td className="px-3 py-1.5">
                    <select value={inv.mode}
                      onChange={(e) => updateInv(inv.id, { mode: e.target.value as AmortizationMode })}
                      className={inputTiny}>
                      {MODES.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button type="button" onClick={() => removeInv(inv.id)}
                      className="text-red-400 hover:text-red-600 text-sm" title="Supprimer">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-semibold border-t-2 border-slate-300">
                <td className="px-3 py-2 text-slate-900" colSpan={2}>Total investissements</td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-900">{fmtFCFA(totalBrut)}</td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <button type="button" onClick={handleAdd}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">
          + Ajouter une immobilisation
        </button>
      </FormSection>

      <FormSection title="2. Tableau d'amortissement (auto)" icon="📉">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide">Immobilisation</th>
                <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wide w-28">Année 1</th>
                <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wide w-28">Année 2</th>
                <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wide w-28">Année 3</th>
                <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wide w-32">VNC fin A3</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.inv.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-700">
                    {l.inv.label || <span className="italic text-slate-400">(sans nom)</span>}
                  </td>
                  {l.dotations.map((d, i) => (
                    <td key={i} className="px-3 py-2 text-right tabular-nums text-slate-800">
                      {d > 0 ? fmtFCFA(d) : <span className="text-slate-300">—</span>}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right tabular-nums text-slate-800 font-medium">{fmtFCFA(l.vnc)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-semibold border-t-2 border-slate-300">
                <td className="px-3 py-2 text-slate-900">TOTAL DOTATIONS</td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-900">{fmtFCFA(dotationA1)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-900">{fmtFCFA(dotationA2)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-900">{fmtFCFA(dotationA3)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-900">{fmtFCFA(vncFinA3)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </FormSection>

      <FormSection title="3. Synthèse" icon="📊">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-600">Valeur brute</span><span className="font-semibold tabular-nums">{fmtFCFA(totalBrut)} FCFA</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-600">Dotation A1</span><span className="font-semibold tabular-nums text-rose-700">−{fmtFCFA(dotationA1)} FCFA</span></div>
            <div className="flex justify-between text-sm pt-2 border-t border-slate-200"><span className="font-semibold">VNC fin A3</span><span className="font-bold tabular-nums text-emerald-700">{fmtFCFA(vncFinA3)} FCFA</span></div>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 space-y-1.5">
            <p className="font-semibold uppercase tracking-wide text-emerald-800">ⓘ Liens SYSCOHADA</p>
            <p>• La <b>VNC</b> alimente l'actif du bilan (Carte 6).</p>
            <p>• Les <b>dotations A1</b> = charge (compte 681) du CR.</p>
            <p>• La dotation A1 ({fmtFCFA(dotationA1)} FCFA) remplace la valeur par défaut dans la Carte 3.</p>
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={handleValidate}
          className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-black">
          Valider les investissements →
        </button>
      </div>
    </div>
  );
}
