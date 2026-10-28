import { FormSection, FormField, inputClass } from './FormSection';
import { computeSIG, computeBFR, fmtFCFA, fmtFCFAsigned } from '../../lib/sig-engine';
import { useProjectStore } from '../../store/projectStore';
import type { Hypotheses, SIG } from '../../types/project';

const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

interface Props {
  onValidate?: (h: Hypotheses, sig: SIG) => void;
}

export function HypothesesCard({ onValidate }: Props) {
  const h = useProjectStore((s) => s.hypotheses);
  const update = useProjectStore((s) => s.updateHypothese);
  const updateSaison = useProjectStore((s) => s.updateSaisonnalite);

  const sig = computeSIG(h);
  const bfr = computeBFR(h, sig.ca);
  const moyenneSaison = h.saisonnalite.reduce((s, v) => s + v, 0) / 12;
  const caA2 = sig.ca * (1 + h.croissanceA2 / 100);
  const caA3 = caA2 * (1 + h.croissanceA3 / 100);

  const handleValidate = () => {
    if (onValidate) onValidate(h, sig);
    else alert(`✅ Hypothèses validées\nRN Année 1 : ${fmtFCFA(sig.resultatNet)} FCFA`);
  };

  const Row = ({ label, value, bold, separator, color }: {
    label: string; value: number; bold?: boolean; separator?: boolean; color?: string;
  }) => (
    <div
      className={`flex items-center justify-between px-3 py-2 ${
        separator ? 'border-t border-slate-300 mt-1 pt-2' : ''
      } ${bold ? 'font-semibold' : ''} ${color ?? 'text-slate-800'}`}
    >
      <span className="text-sm">{label}</span>
      <span className="text-sm tabular-nums">{fmtFCFAsigned(value)} <span className="text-[11px] text-slate-400">FCFA</span></span>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">📊 Hypothèses financières</h2>
        <p className="text-sm text-slate-500 mt-1">
          Scénario <b>Normal</b> (celui utilisé partout dans l'application)
        </p>
      </div>

      <FormSection title="1. Chiffre d'affaires" icon="💵">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="CA mensuel cible (A1)" unit="FCFA" required>
            <input type="number" value={h.caMensuel}
              onChange={(e) => update('caMensuel', Number(e.target.value))}
              className={inputClass} step={100000} />
          </FormField>
          <FormField label="Croissance A2" unit="%" required>
            <input type="number" value={h.croissanceA2}
              onChange={(e) => update('croissanceA2', Number(e.target.value))}
              className={inputClass} />
          </FormField>
          <FormField label="Croissance A3" unit="%" required>
            <input type="number" value={h.croissanceA3}
              onChange={(e) => update('croissanceA3', Number(e.target.value))}
              className={inputClass} />
          </FormField>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-700">Saisonnalité mensuelle (coefficients)</label>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
              Math.abs(moyenneSaison - 1) < 0.02 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              moy = {moyenneSaison.toFixed(2)}
            </span>
          </div>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-1.5">
            {MOIS.map((m, i) => (
              <div key={m} className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 mb-1">{m}</span>
                <input type="number" step={0.1} value={h.saisonnalite[i]}
                  onChange={(e) => updateSaison(i, Number(e.target.value))}
                  className="w-full px-1 py-1.5 rounded-md border border-slate-200 text-xs text-center focus:outline-none focus:border-slate-400" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 grid grid-cols-3 gap-2 text-xs">
          <div><span className="text-slate-500">CA A1 :</span> <b>{fmtFCFA(sig.ca)} FCFA</b></div>
          <div><span className="text-slate-500">CA A2 :</span> <b>{fmtFCFA(caA2)} FCFA</b></div>
          <div><span className="text-slate-500">CA A3 :</span> <b>{fmtFCFA(caA3)} FCFA</b></div>
        </div>
      </FormSection>

      <FormSection title="2. Charges" icon="📉">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Achats consommés (% CA)" unit="%" required>
            <input type="number" value={h.pctAchats}
              onChange={(e) => update('pctAchats', Number(e.target.value))}
              className={inputClass} />
          </FormField>
          <FormField label="Charges externes (% CA)" unit="%" required>
            <input type="number" value={h.pctChargesExt}
              onChange={(e) => update('pctChargesExt', Number(e.target.value))}
              className={inputClass} />
          </FormField>
          <FormField label="Masse salariale (annuelle)" unit="FCFA" required>
            <input type="number" value={h.masseSalariale}
              onChange={(e) => update('masseSalariale', Number(e.target.value))}
              className={inputClass} step={100000} />
          </FormField>
          <FormField label="Charges financières (annuelles)" unit="FCFA" hint="Recalculé depuis la Carte 5">
            <input type="number" value={h.chargesFinancieres}
              onChange={(e) => update('chargesFinancieres', Number(e.target.value))}
              className={inputClass} step={100000} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="3. BFR — Besoin en Fonds de Roulement" icon="📦">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Durée de stockage" unit="jours" required>
            <input type="number" value={h.joursStockage}
              onChange={(e) => update('joursStockage', Number(e.target.value))} className={inputClass} />
          </FormField>
          <FormField label="Délai règlement clients" unit="jours" required>
            <input type="number" value={h.joursClients}
              onChange={(e) => update('joursClients', Number(e.target.value))} className={inputClass} />
          </FormField>
          <FormField label="Délai règlement fournisseurs" unit="jours" required>
            <input type="number" value={h.joursFournisseurs}
              onChange={(e) => update('joursFournisseurs', Number(e.target.value))} className={inputClass} />
          </FormField>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
          <div className="flex justify-between"><span>Stocks</span><b>{fmtFCFA(bfr.stocks)} FCFA</b></div>
          <div className="flex justify-between"><span>+ Créances clients</span><b>{fmtFCFA(bfr.clients)} FCFA</b></div>
          <div className="flex justify-between"><span>− Dettes fournisseurs</span><b>{fmtFCFA(bfr.fournisseurs)} FCFA</b></div>
          <div className="flex justify-between pt-2 border-t border-slate-300 font-semibold text-sm">
            <span>BFR initial</span><span className="text-emerald-700">{fmtFCFA(bfr.bfr)} FCFA</span>
          </div>
        </div>
      </FormSection>

      <FormSection title="4. Cascade des SIG en temps réel" icon="📈">
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50">
            <Row label="Chiffre d'affaires" value={sig.ca} bold />
            <Row label="− Achats consommés" value={-sig.achats} />
            <Row label="= Marge commerciale" value={sig.marge} bold separator />
            <Row label="− Charges externes" value={-sig.chargesExt} />
            <Row label="= Valeur ajoutée" value={sig.valeurAjoutee} bold separator />
            <Row label="− Charges de personnel" value={-sig.personnel} />
            <Row label="= EBE" value={sig.ebe} bold separator />
            <Row label="− Dotations aux amortissements" value={-sig.amortissements} />
            <Row label="= Résultat d'exploitation" value={sig.resultatExpl} bold separator />
            <Row label="+/− Résultat financier" value={sig.resultatFin} />
            <Row label="= Résultat avant impôt" value={sig.resultatAvantImpot} bold separator />
            <Row label="− Impôt sur les sociétés (30 %)" value={-sig.impot} />
          </div>
          <div className={`flex items-center justify-between px-3 py-3 border-t-2 ${sig.resultatNet >= 0 ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'}`}>
            <span className="text-sm font-bold uppercase tracking-wide">= Résultat net</span>
            <span className={`text-base font-bold tabular-nums ${sig.resultatNet >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
              {fmtFCFAsigned(sig.resultatNet)} <span className="text-xs">FCFA</span>
              {sig.resultatNet >= 0 ? ' ✅' : ' ⚠️'}
            </span>
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={handleValidate}
          className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-black">
          Valider les hypothèses →
        </button>
      </div>
    </div>
  );
}
