import { useState } from 'react';
import { useMemo } from 'react';
import { computeFinancialResult, fmtFCFA } from '../../lib/financial-statements-engine';
import { useProjectStore } from '../../store/projectStore';
import { BANQUES_BENIN } from '../../types/project';

export function PartageView() {
  const [banque, setBanque] = useState('BOA Bénin');
  const [copied, setCopied] = useState(false);

  const hypotheses = useProjectStore((s) => s.hypotheses);
  const investments = useProjectStore((s) => s.investments);
  const financement = useProjectStore((s) => s.financement);
  const result = useMemo(
    () => computeFinancialResult(hypotheses, investments, financement),
    [hypotheses, investments, financement],
  );

  const resumeBancaire = `DOSSIER DE FINANCEMENT — ${banque}

Projet : Élevage Poulets de chair 5000 sujets - Parakou
Secteur : Aviculture
Localisation : Parakou, Borgou

--- STRUCTURE FINANCIÈRE ---
Investissement total : ${fmtFCFA(investments.reduce((s, i) => s + i.cost, 0))} FCFA
Capital social : ${fmtFCFA(financement.capitalSocial)} FCFA
Emprunt demandé : ${fmtFCFA(financement.empruntMontant)} FCFA
Taux : ${financement.empruntTaux}% sur ${financement.empruntDuree} ans

--- PERFORMANCE PRÉVISIONNELLE ---
CA Année 1 : ${fmtFCFA(result.cr[0].ca)} FCFA
Résultat net A1 : ${fmtFCFA(result.cr[0].rn)} FCFA
VAN (12%) : ${fmtFCFA(result.kpis.van)} FCFA
TRI : ${result.kpis.tri.toFixed(1)}%
DSCR A1 : ${result.kpis.dscr.toFixed(2)}
Délai de récupération : ${result.kpis.delaiRecupMois} mois

--- CONCLUSION ---
${result.kpis.van > 0 && result.kpis.dscr >= 1.2
  ? '✅ Projet bancable — tous les indicateurs sont au vert.'
  : '⚠️ Projet à consolider — vérifier les hypothèses.'}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resumeBancaire);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Copie impossible. Voici le résumé :\n\n' + resumeBancaire);
    }
  };

  const handlePDF = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text('Dossier de financement bancaire', 14, 20);
      doc.setFontSize(10);
      const lines = resumeBancaire.split('\n');
      let y = 30;
      for (const line of lines) {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(line, 14, y);
        y += 6;
      }
      doc.save(`dossier-${banque.replace(/\s+/g, '-')}.pdf`);
    } catch (e) {
      alert('Erreur PDF : ' + (e as Error).message);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">🔗 Partage & Banques</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Génère un résumé bancaire prêt à envoyer à ton partenaire financier
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <label className="text-xs font-medium text-slate-700 block mb-1.5">Banque ciblée</label>
        <select
          value={banque}
          onChange={(e) => setBanque(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#0F172A]"
        >
          {BANQUES_BENIN.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Aperçu du résumé</h3>
          <button
            onClick={handleCopy}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
              copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {copied ? '✅ Copié' : '📋 Copier'}
          </button>
        </div>
        <pre className="text-[11px] leading-relaxed text-slate-700 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap font-mono max-h-72 overflow-y-auto">
{resumeBancaire}
        </pre>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handlePDF}
          className="px-3 py-2 rounded-lg bg-[#0F172A] text-white text-xs font-semibold hover:bg-black"
        >
          📄 Télécharger le dossier PDF
        </button>
        <button
          onClick={handleCopy}
          className="px-3 py-2 rounded-lg bg-[#10B981] text-white text-xs font-semibold hover:bg-emerald-600"
        >
          📋 Copier pour email
        </button>
      </div>
    </div>
  );
}
