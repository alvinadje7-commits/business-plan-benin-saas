import { useState } from 'react';
import { SECTORS } from '../lib/mockup-data';
import { KpiCard } from '../components/ui/KpiCard';
import { CaChart } from '../components/charts/CaChart';
import { TresorerieChart } from '../components/charts/TresorerieChart';
import { ChargesChart } from '../components/charts/ChargesChart';
import { RepartitionChart } from '../components/charts/RepartitionChart';
import { FinancialTable, type TableRow } from '../components/tables/FinancialTable';

// ========== DONNÉES STATIQUES DE LA VUE ==========

const KPI_LIST = [
  { label: 'VAN (12%)', value: '64 029 587', unit: 'FCFA', hint: 'Projet rentable', color: 'accent' as const },
  { label: 'TRI', value: '55.0', unit: '%', hint: 'Rentabilité interne', color: 'primary' as const },
  { label: 'Délai récup.', value: '7', unit: 'mois', hint: '0.6 ans', color: 'primary' as const },
  { label: 'Seuil rentabilité', value: '87 319 196', unit: 'FCFA', hint: 'CA annuel min', color: 'primary' as const },
  { label: 'DSCR', value: '15.09', hint: 'Couverture OK', color: 'accent' as const },
  { label: 'Marge nette', value: '30.2', unit: '%', hint: 'RN / CA', color: 'accent' as const },
];

const CR_ROWS: TableRow[] = [
  { label: "Chiffre d'affaires", values: ['129 600 000', '155 520 000', '186 624 000'], bold: true },
  { label: 'Achats consommés', values: ['-51 840 000', '-62 208 000', '-74 649 600'] },
  { label: 'Marge brute', values: ['77 760 000', '93 312 000', '111 974 400'], bold: true, separator: true },
  { label: 'Charges externes', values: ['-8 400 000', '-9 000 000', '-9 600 000'] },
  { label: 'Valeur ajoutée', values: ['69 360 000', '84 312 000', '102 374 400'], bold: true, separator: true },
  { label: 'Charges de personnel', values: ['-18 000 000', '-19 800 000', '-21 780 000'] },
  { label: 'EBE', values: ['51 360 000', '64 512 000', '80 594 400'], bold: true, separator: true },
  { label: 'Dotations amortissements', values: ['-7 500 000', '-7 500 000', '-7 500 000'] },
  { label: "Résultat d'exploitation", values: ['43 860 000', '57 012 000', '73 094 400'], bold: true },
  { label: 'Charges financières', values: ['-2 400 000', '-1 800 000', '-1 200 000'] },
  { label: 'Résultat avant impôt', values: ['41 460 000', '55 212 000', '71 894 400'], bold: true, separator: true },
  { label: 'Impôt (30%)', values: ['-12 438 000', '-16 563 600', '-21 568 320'] },
  { label: 'Résultat net', values: ['29 022 000', '38 648 400', '50 326 080'], bold: true, separator: true },
];

const NAV_ITEMS = [
  { label: 'Tableau de bord', icon: '📊' },
  { label: 'Projets', icon: '📁', count: 12 },
  { label: 'Assistant Business Plan', icon: '🧭', active: true },
  { label: 'États financiers', icon: '📑' },
  { label: 'Scénarios', icon: '🔀' },
  { label: 'Exports PDF/Excel', icon: '📤' },
  { label: 'Partage & Banques', icon: '🔗' },
  { label: 'Paramètres', icon: '⚙️' },
];

const STEPS = [
  { id: 1, label: 'Infos générales', desc: 'Projet & promoteur' },
  { id: 2, label: 'Secteur', desc: '12 filières' },
  { id: 3, label: 'Hypothèses', desc: 'Moteur dynamique' },
  { id: 4, label: 'Investissements', desc: 'Amortissements OHADA' },
  { id: 5, label: 'Financement', desc: 'Dette & capital' },
  { id: 6, label: 'Exploitation & Résultats', desc: 'États financiers' },
];

// ========== COMPOSANT ==========

export default function App() {
  const [step, setStep] = useState(2);
  const [projectName] = useState('Élevage Poulets de chair 5000 sujets - Parakou');
  const [selectedSector, setSelectedSector] = useState('aviculture');
  const [isSaving, setIsSaving] = useState(false);

  const currentSector = SECTORS.find((s) => s.code === selectedSector) || SECTORS[0];

  // Sauvegarde connectée au proxy Cloudflare / Neon (inchangée)
  const saveProject = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName, sector: selectedSector }),
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Erreur API');
      alert('✅ Projet sauvegardé avec succès dans la base de données !');
    } catch (err) {
      alert('❌ Erreur: ' + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans text-slate-900 flex">
      {/* SIDEBAR */}
      <aside className="w-[280px] bg-[#0F172A] text-white flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#10B981] flex items-center justify-center font-bold text-[#0F172A]">B</div>
            <div>
              <div className="font-semibold tracking-tight text-sm">BENIN BUSINESS PLAN</div>
              <div className="text-[10px] text-white/60 uppercase tracking-widest">SaaS • OHADA • XOF</div>
            </div>
          </div>
          <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-white/50 uppercase">Organisation</div>
            <div className="font-medium text-sm mt-1">Cabinet Expert Bénin</div>
            <div className="text-[11px] text-white/60 mt-1">RCCM: RB/COT/23 B 12345 • IFU 32023...</div>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/30">● Actif</span>
              <span className="text-[11px] text-white/50">SYSCOHADA</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm cursor-pointer transition ${
                item.active
                  ? 'bg-white text-[#0F172A] font-medium'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span>{item.icon}</span>
                {item.label}
              </div>
              {item.count && <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">{item.count}</span>}
            </div>
          ))}

          <div className="mt-6 p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
            <div className="text-xs font-medium">Moteur sectoriel dynamique</div>
            <div className="text-[11px] text-white/70 mt-1">12 secteurs • Formules OHADA • Recalcul temps réel</div>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {SECTORS.slice(0, 8).map((s) => (
                <div key={s.code} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[14px]">
                  {s.icon}
                </div>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white text-[#0F172A] flex items-center justify-center font-semibold text-sm">AK</div>
          <div>
            <div className="text-sm font-medium">Armand K.</div>
            <div className="text-[11px] text-white/60">Analyste Financier • Admin</div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ml-[280px] flex-1 flex flex-col min-h-screen">
        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-[#F8F9FB]/90 backdrop-blur-xl border-b border-slate-200 px-8 py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-semibold text-lg">{projectName}</h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-medium">Brouillon</span>
                <span className="px-2 py-0.5 rounded-full bg-[#0F172A] text-white text-[11px]">{currentSector.name}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                <span>📍 Parakou, Borgou</span> • <span>36 mois</span> • <span>Devise: <b>XOF (FCFA)</b></span> • <span className="text-emerald-600">● Recalcul temps réel actif</span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Moteur financier : Équilibré
              </div>
              <button className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium bg-white hover:bg-slate-50">Export PDF</button>
              <button className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-sm font-medium flex items-center gap-2 hover:bg-black">
                <span>⭳</span> Excel
              </button>
              <button
                onClick={saveProject}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-[#10B981] text-white text-sm font-medium hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {isSaving ? '⏳...' : '💾 Sauvegarder'}
              </button>
            </div>
          </div>

          {/* STEPPER */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <button
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm transition shrink-0 ${
                    step === s.id
                      ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-lg'
                      : step > s.id
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step === s.id ? 'bg-white text-[#0F172A]' : step > s.id ? 'bg-emerald-600 text-white' : 'bg-slate-100'
                    }`}
                  >
                    {step > s.id ? '✓' : s.id}
                  </span>
                  <div className="text-left">
                    <div className="font-medium leading-none">{s.label}</div>
                    <div className="text-[11px] opacity-70 mt-1">{s.desc}</div>
                  </div>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-[2px] ${step > s.id ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-8 space-y-6">
          {/* KPI GRID — utilise <KpiCard /> */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {KPI_LIST.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </div>

          {/* STEP CONTENT */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            {step === 2 && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">Moteur sectoriel dynamique</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      12 secteurs Bénin/Afrique de l'Ouest • Champs, formules, KPIs auto-adaptés
                    </p>
                  </div>
                  <div className="hidden lg:flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                    ● Registre sectoriel chargé • 12 modèles
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SECTORS.map((s) => (
                    <div
                      key={s.code}
                      onClick={() => setSelectedSector(s.code)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedSector === s.code
                          ? 'border-[#0F172A] bg-[#0F172A] text-white shadow-xl scale-[1.02]'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                            selectedSector === s.code ? 'bg-white text-[#0F172A]' : 'bg-slate-100'
                          }`}
                        >
                          {s.icon}
                        </div>
                        {selectedSector === s.code && (
                          <span className="text-[10px] bg-emerald-500 px-2 py-1 rounded-full text-white font-bold">SÉLECTIONNÉ</span>
                        )}
                      </div>
                      <div className="mt-4 font-semibold">{s.name}</div>
                      <div className={`text-xs mt-1 ${selectedSector === s.code ? 'text-white/70' : 'text-slate-500'}`}>
                        {s.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Exploitation & Résultats</h2>
                  <p className="text-sm text-slate-500 mt-1">Compte de résultat prévisionnel (OHADA) • 3 années</p>
                </div>
                <FinancialTable
                  title="Compte de résultat prévisionnel (OHADA)"
                  subtitle="Fiscalité 30% IS • Devise FCFA"
                  columns={['Année 1', 'Année 2', 'Année 3']}
                  rows={CR_ROWS}
                />
              </div>
            )}

            {step !== 2 && step !== 6 && (
              <div className="flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
                <div className="text-4xl">🚧</div>
                <div className="text-lg font-medium text-slate-600">Étape {step} en cours de développement</div>
                <p className="text-sm text-center max-w-md">
                  Reviens à l'étape "Secteur" ou "Exploitation & Résultats" pour voir l'interface.
                </p>
              </div>
            )}
          </div>

          {/* CHARTS — composants séparés */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CaChart />
            <TresorerieChart />
            <ChargesChart />
            <RepartitionChart />
          </div>
        </main>
      </div>
    </div>
  );
}
