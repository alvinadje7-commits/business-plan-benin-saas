import { useState, useMemo } from 'react';
import { KpiCard } from "../ui/KpiCard";
import { useProjectStore } from "../../store/projectStore";
import { getSectorConfig, getActiveChargeRubriques } from '../../lib/sectors-config';
import { fmtFCFA, fmtSigned, computeFinancialResult } from '../../lib/financial-statements-engine';
import type { Hypotheses, Investment } from '../../types/project';

type TabKey = 'cr' | 'bilan' | 'tafire' | 'treso' | 'notes';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'cr', label: 'Compte de résultat', icon: '📊' },
  { key: 'bilan', label: 'Bilan', icon: '⚖️' },
  { key: 'tafire', label: 'TAFIRE', icon: '💵' },
  { key: 'treso', label: 'Trésorerie', icon: '📈' },
  { key: 'notes', label: 'Notes annexes', icon: '📝' },
];

interface Props {
  // Props conservées pour compat, mais on utilise le store par défaut
}

export function ResultatsCard(_props: Props = {}) {
  const [tab, setTab] = useState<TabKey>('cr');
  const hypotheses = useProjectStore((s) => s.hypotheses);
  const investments = useProjectStore((s) => s.investments);
  const financement = useProjectStore((s) => s.financement);
  const result = useMemo(
    () => computeFinancialResult(hypotheses, investments, financement),
    [hypotheses, investments, financement],
  );
  const { cr, bilan, tafire, tresorerie, kpis } = result;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">📑 Exploitation & Résultats</h2>
        <p className="text-sm text-slate-500 mt-1">
          États financiers SYSCOHADA — Bilan, CR, TAFIRE, Notes, KPIs
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="VAN (12%)" value={fmtFCFA(kpis.van)} unit="FCFA" hint={kpis.van > 0 ? 'Projet rentable' : 'Projet non rentable'} color={kpis.van > 0 ? 'accent' : 'danger'} />
        <KpiCard label="TRI" value={kpis.tri.toFixed(1)} unit="%" hint="Rentabilité interne" color={kpis.tri > 12 ? 'accent' : 'primary'} />
        <KpiCard label="Délai récup." value={String(kpis.delaiRecupMois)} unit="mois" hint={`${(kpis.delaiRecupMois / 12).toFixed(1)} ans`} color="primary" />
        <KpiCard label="Seuil rentabilité" value={fmtFCFA(kpis.seuilRentabilite)} unit="FCFA" hint="CA annuel min" color="primary" />
        <KpiCard label="DSCR (A1)" value={kpis.dscr.toFixed(2)} hint={kpis.dscr >= 1.2 ? 'Couverture OK' : 'À surveiller'} color={kpis.dscr >= 1.2 ? 'accent' : 'danger'} />
        <KpiCard label="Marge nette" value={kpis.margeNette.toFixed(1)} unit="%" hint="RN / CA" color={kpis.margeNette > 10 ? 'accent' : 'primary'} />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-xl transition whitespace-nowrap ${
              tab === t.key
                ? 'bg-[#0F172A] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="mr-1.5">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div>
        {tab === 'cr' && <CRTab cr={cr} />}
        {tab === 'bilan' && <BilanTab bilan={bilan} />}
        {tab === 'tafire' && <TafireTab tafire={tafire} />}
        {tab === 'treso' && <TresoTab tresorerie={tresorerie} />}
        {tab === 'notes' && <NotesTab hypotheses={hypotheses} investments={investments} />}
      </div>
    </div>
  );
}

/* ============ CR ============ */
function CRTab({ cr }: { cr: any[] }) {
  const rows = [
    { key: 'ca', label: "Chiffre d'affaires", bold: true },
    { key: 'achats', label: 'Achats consommés', neg: true },
    { key: 'marge', label: 'Marge commerciale', bold: true, separator: true },
    { key: 'chargesExt', label: 'Charges externes', neg: true },
    { key: 'va', label: 'Valeur ajoutée', bold: true, separator: true },
    { key: 'personnel', label: 'Charges de personnel', neg: true },
    { key: 'ebe', label: 'EBE', bold: true, separator: true },
    { key: 'dotations', label: 'Dotations amortissements', neg: true },
    { key: 're', label: "Résultat d'exploitation", bold: true, separator: true },
    { key: 'chargesFin', label: 'Charges financières', neg: true },
    { key: 'rai', label: 'Résultat avant impôt', bold: true, separator: true },
    { key: 'is', label: 'Impôt (30%)', neg: true },
    { key: 'rn', label: 'Résultat net', bold: true, separator: true, accent: true },
  ];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200">
        <h3 className="text-sm font-semibold">Compte de résultat prévisionnel (SYSCOHADA)</h3>
        <p className="text-xs text-slate-500">3 années — Devise FCFA</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide">Poste</th>
              {cr.map((y) => (
                <th key={y.annee} className="text-right px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide">
                  Année {y.annee}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className={`border-t ${r.separator ? 'border-slate-300 border-t-2' : 'border-slate-100'} ${
                  r.bold ? 'bg-slate-50 font-semibold' : ''
                }`}
              >
                <td className={`px-5 py-2 ${r.accent ? 'text-emerald-800' : 'text-slate-700'}`}>{r.label}</td>
                {cr.map((y) => (
                  <td
                    key={y.annee}
                    className={`px-5 py-2 text-right tabular-nums ${
                      r.accent ? 'text-emerald-800' : r.neg ? 'text-rose-700' : 'text-slate-900'
                    }`}
                  >
                    {r.neg ? '−' + fmtFCFA(Math.abs(y[r.key])) : fmtFCFA(y[r.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ BILAN ============ */
function BilanTab({ bilan }: { bilan: any[] }) {
  return (
    <div className="space-y-4">
      {bilan.map((b) => (
        <div key={b.annee} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Bilan Année {b.annee}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              b.equilibre ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              {b.equilibre ? '✅ Équilibré' : '⚠️ Déséquilibre'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div>
              <div className="px-5 py-2 bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wide">ACTIF</div>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-t border-slate-100">
                    <td className="px-5 py-1.5 text-slate-600">Immobilisations brutes</td>
                    <td className="px-5 py-1.5 text-right tabular-nums">{fmtFCFA(b.immobBrut)}</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-5 py-1.5 text-slate-600">− Amortissements</td>
                    <td className="px-5 py-1.5 text-right tabular-nums text-rose-700">−{fmtFCFA(b.amortCumules)}</td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-5 py-1.5 font-medium">Immobilisations nettes</td>
                    <td className="px-5 py-1.5 text-right tabular-nums font-medium">{fmtFCFA(b.immobNettes)}</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-5 py-1.5 text-slate-600">Stocks</td>
                    <td className="px-5 py-1.5 text-right tabular-nums">{fmtFCFA(b.stocks)}</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-5 py-1.5 text-slate-600">Créances clients</td>
                    <td className="px-5 py-1.5 text-right tabular-nums">{fmtFCFA(b.clients)}</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-5 py-1.5 text-slate-600">Trésorerie</td>
                    <td className="px-5 py-1.5 text-right tabular-nums">{fmtFCFA(b.tresorerie)}</td>
                  </tr>
                  <tr className="border-t-2 border-slate-300 bg-slate-100">
                    <td className="px-5 py-2 font-bold">TOTAL ACTIF</td>
                    <td className="px-5 py-2 text-right tabular-nums font-bold">{fmtFCFA(b.totalActif)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <div className="px-5 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wide">PASSIF</div>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-t border-slate-100">
                    <td className="px-5 py-1.5 text-slate-600">Capital social</td>
                    <td className="px-5 py-1.5 text-right tabular-nums">{fmtFCFA(b.capital)}</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-5 py-1.5 text-slate-600">Apport compte courant</td>
                    <td className="px-5 py-1.5 text-right tabular-nums">{fmtFCFA(b.apportCC)}</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-5 py-1.5 text-slate-600">Subventions</td>
                    <td className="px-5 py-1.5 text-right tabular-nums">{fmtFCFA(b.subventions)}</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-5 py-1.5 text-slate-600">Réserves</td>
                    <td className="px-5 py-1.5 text-right tabular-nums">{fmtFCFA(b.reserves)}</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-5 py-1.5 text-slate-600">Résultat net</td>
                    <td className="px-5 py-1.5 text-right tabular-nums">{fmtFCFA(b.rn)}</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-5 py-1.5 text-slate-600">Emprunt</td>
                    <td className="px-5 py-1.5 text-right tabular-nums">{fmtFCFA(b.emprunt)}</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-5 py-1.5 text-slate-600">Fournisseurs + Dettes fiscales</td>
                    <td className="px-5 py-1.5 text-right tabular-nums">{fmtFCFA(b.fournisseurs + b.dettesFiscales)}</td>
                  </tr>
                  <tr className="border-t-2 border-slate-300 bg-slate-100">
                    <td className="px-5 py-2 font-bold">TOTAL PASSIF</td>
                    <td className="px-5 py-2 text-right tabular-nums font-bold">{fmtFCFA(b.totalPassif)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============ TAFIRE ============ */
function TafireTab({ tafire }: { tafire: any[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200">
        <h3 className="text-sm font-semibold">Tableau financier des ressources et emplois (TAFIRE)</h3>
        <p className="text-xs text-slate-500">3 années — Devise FCFA</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide">Poste</th>
              {tafire.map((t) => (
                <th key={t.annee} className="text-right px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide">
                  Année {t.annee}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-blue-50 font-bold text-blue-800">
              <td colSpan={4} className="px-5 py-2 uppercase tracking-wide text-xs">EMPLOIS</td>
            </tr>
            <tr className="border-t border-slate-100"><td className="px-5 py-2 text-slate-700">Investissements</td>{tafire.map((t) => <td key={t.annee} className="px-5 py-2 text-right tabular-nums">{fmtFCFA(t.investissements)}</td>)}</tr>
            <tr className="border-t border-slate-100"><td className="px-5 py-2 text-slate-700">Variation BFR</td>{tafire.map((t) => <td key={t.annee} className="px-5 py-2 text-right tabular-nums">{fmtFCFA(t.variationBFR)}</td>)}</tr>
            <tr className="border-t border-slate-100"><td className="px-5 py-2 text-slate-700">Remboursement emprunt</td>{tafire.map((t) => <td key={t.annee} className="px-5 py-2 text-right tabular-nums">{fmtFCFA(t.remboursement)}</td>)}</tr>
            <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold"><td className="px-5 py-2">TOTAL EMPLOIS</td>{tafire.map((t) => <td key={t.annee} className="px-5 py-2 text-right tabular-nums">{fmtFCFA(t.totalEmplois)}</td>)}</tr>

            <tr className="bg-emerald-50 font-bold text-emerald-800">
              <td colSpan={4} className="px-5 py-2 uppercase tracking-wide text-xs">RESSOURCES</td>
            </tr>
            <tr className="border-t border-slate-100"><td className="px-5 py-2 text-slate-700">CAF</td>{tafire.map((t) => <td key={t.annee} className="px-5 py-2 text-right tabular-nums">{fmtFCFA(t.caf)}</td>)}</tr>
            <tr className="border-t border-slate-100"><td className="px-5 py-2 text-slate-700">Apports</td>{tafire.map((t) => <td key={t.annee} className="px-5 py-2 text-right tabular-nums">{fmtFCFA(t.apports)}</td>)}</tr>
            <tr className="border-t border-slate-100"><td className="px-5 py-2 text-slate-700">Subventions</td>{tafire.map((t) => <td key={t.annee} className="px-5 py-2 text-right tabular-nums">{fmtFCFA(t.subventions)}</td>)}</tr>
            <tr className="border-t border-slate-100"><td className="px-5 py-2 text-slate-700">Nouveaux emprunts</td>{tafire.map((t) => <td key={t.annee} className="px-5 py-2 text-right tabular-nums">{fmtFCFA(t.nouveauxEmprunts)}</td>)}</tr>
            <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold"><td className="px-5 py-2">TOTAL RESSOURCES</td>{tafire.map((t) => <td key={t.annee} className="px-5 py-2 text-right tabular-nums">{fmtFCFA(t.totalRessources)}</td>)}</tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ TRÉSORERIE ============ */
function TresoTab({ tresorerie }: { tresorerie: any[] }) {
  const min = Math.min(...tresorerie.map((t) => t.soldeCumule));
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Trésorerie prévisionnelle — Année 1</h3>
          <p className="text-xs text-slate-500">Encaissements, décaissements et solde cumulé</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          min >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {min >= 0 ? '✅ Trésorerie toujours positive' : `⚠️ Point bas : ${fmtSigned(min)} FCFA`}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide">Mois</th>
              <th className="text-right px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide">Encaissements</th>
              <th className="text-right px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide">Décaissements</th>
              <th className="text-right px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide">Solde mensuel</th>
              <th className="text-right px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide">Solde cumulé</th>
            </tr>
          </thead>
          <tbody>
            {tresorerie.map((t) => (
              <tr key={t.mois} className="border-t border-slate-100">
                <td className="px-5 py-2 text-slate-700 font-medium">{t.mois}</td>
                <td className="px-5 py-2 text-right tabular-nums text-emerald-700">{fmtFCFA(t.encaissements)}</td>
                <td className="px-5 py-2 text-right tabular-nums text-rose-700">{fmtFCFA(t.decaissements)}</td>
                <td className={`px-5 py-2 text-right tabular-nums ${t.soldeMensuel >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {fmtSigned(t.soldeMensuel)}
                </td>
                <td className={`px-5 py-2 text-right tabular-nums font-medium ${t.soldeCumule >= 0 ? 'text-slate-900' : 'text-rose-700'}`}>
                  {fmtSigned(t.soldeCumule)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ NOTES ============ */
function NotesTab({ hypotheses, investments }: { hypotheses: Hypotheses; investments: Investment[] }) {
  const sectorCode = useProjectStore((s) => s.sectorCode);
  const sectorVariant = useProjectStore((s) => s.sectorVariant);
  const sector = getSectorConfig(sectorCode);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold mb-3">📝 Notes annexes aux états financiers</h3>

        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">1. Méthodes comptables</h4>
            <p className="text-slate-600">
              Les états financiers sont établis conformément au Système Comptable OHADA (SYSCOHADA Révisé).
              Les immobilisations sont amorties selon le mode linéaire ou dégressif sur leur durée d'utilité.
              La devise de présentation est le Franc CFA (XOF). L'exercice comptable est de 12 mois.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-1">2. Immobilisations</h4>
            <p className="text-slate-600 mb-2">
              {investments.length} immobilisations inscrites pour un total brut de{' '}
              <b>{fmtFCFA(investments.reduce((s, i) => s + i.cost, 0))} FCFA</b>.
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
              {investments.map((i) => (
                <li key={i.id}>
                  {i.label} — {i.category} — {fmtFCFA(i.cost)} FCFA — {i.duration} ans ({i.mode})
                </li>
              ))}
            </ul>
          </div>

          <div>
              <h4 className="font-semibold text-slate-900 mb-1">2bis. Rubriques sectorielles ({sector.name})</h4>
              <p className="text-slate-600 mb-1.5">
                Les charges du compte de résultat sont ventilées selon les rubriques du secteur :
              </p>
              <div className="flex flex-wrap gap-1.5">
                {getActiveChargeRubriques(sector, sectorVariant).map((r) => (
                  <span key={r} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {r}
                  </span>
                ))}
              </div>
          </div>

          <div>
              <h4 className="font-semibold text-slate-900 mb-1">3. Hypothèses clés</h4>
            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
              <li>CA mensuel cible : <b>{fmtFCFA(hypotheses.caMensuel)} FCFA</b></li>
              <li>Croissance A2 / A3 : <b>{hypotheses.croissanceA2}%</b> / <b>{hypotheses.croissanceA3}%</b></li>
              <li>Achats consommés : <b>{hypotheses.pctAchats}%</b> du CA</li>
              <li>Charges externes : <b>{hypotheses.pctChargesExt}%</b> du CA</li>
              <li>Masse salariale : <b>{fmtFCFA(hypotheses.masseSalariale)} FCFA/an</b></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-1">4. Engagements et garanties</h4>
            <p className="text-slate-600">
              Aucun engagement hors bilan significatif à signaler. L'emprunt bancaire est garanti par les
              immobilisations corporelles de l'entreprise.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-1">5. Informations sociales</h4>
            <p className="text-slate-600">
              Effectif prévu : 4 emplois directs à la création. Charges sociales : 20% (CNSS Bénin).
              Impôt sur les sociétés : 30%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
