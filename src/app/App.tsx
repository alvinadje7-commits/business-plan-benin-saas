import { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { SECTORS } from '../lib/mockup-data';
import { Dashboard } from '../components/Dashboard';
import { InfosGenerales } from '../components/forms/InfosGenerales';
import { SecteurCard } from '../components/forms/SecteurCard';
import { HypothesesCard } from '../components/forms/HypothesesCard';
import { InvestissementsCard } from '../components/forms/InvestissementsCard';
import { FinancementCard } from '../components/forms/FinancementCard';
import { ResultatsCard } from '../components/forms/ResultatsCard';
import { ProjetsView } from '../components/views/ProjetsView';
import { ScenariosView } from '../components/views/ScenariosView';
import { ExportsView } from '../components/views/ExportsView';
import { PartageView } from '../components/views/PartageView';
import { ParametresView } from '../components/views/ParametresView';
import { ObjectifTRIView } from '../components/views/ObjectifTRIView';
import { VariantBadge } from '../components/VariantSelector';
import { getSectorConfig } from '../lib/sectors-config';

type View = 'objectif' | 'dashboard' | 'projects' | 'assistant' | 'financial' | 'scenarios' | 'exports' | 'share' | 'settings';

const NAV_ITEMS: { id: View; label: string; icon: string; count?: number }[] = [
  { id: 'objectif', label: 'Objectif TRI', icon: '🎯' },
  { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
  { id: 'projects', label: 'Projets', icon: '📁', count: 12 },
  { id: 'assistant', label: 'Assistant Business Plan', icon: '🧭' },
  { id: 'financial', label: 'États financiers', icon: '📑' },
  { id: 'scenarios', label: 'Scénarios', icon: '🔀' },
  { id: 'exports', label: 'Exports PDF/Excel', icon: '📤' },
  { id: 'share', label: 'Partage & Banques', icon: '🔗' },
  { id: 'settings', label: 'Paramètres', icon: '⚙️' },
];

const STEPS = [
  { id: 1, label: 'Infos', desc: 'Projet & promoteur' },
  { id: 2, label: 'Secteur', desc: '12 filières' },
  { id: 3, label: 'Hypothèses', desc: 'Moteur dynamique' },
  { id: 4, label: 'Investissements', desc: 'Amort. OHADA' },
  { id: 5, label: 'Financement', desc: 'Dette & capital' },
  { id: 6, label: 'Résultats', desc: 'États financiers' },
];

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [step, setStep] = useState(1);
  const isSaving = useProjectStore((s) => s.isSaving);

  const projectName = useProjectStore((s) => s.info.projectName);
  const selectedSector = useProjectStore((s) => s.sectorCode);
  const sectorVariant = useProjectStore((s) => s.sectorVariant);
  const setSelectedSector = useProjectStore((s) => s.setSelectedSector);
  const loadProject = useProjectStore((s) => s.loadProject);

  const currentSector = SECTORS.find((s) => s.code === selectedSector) || SECTORS[0];

  const saveProject = async () => {
    try {
      const result = await useProjectStore.getState().saveCurrentProject();
      alert('✅ Projet sauvegardé (id: ' + result.id.slice(0, 8) + '…)');
    } catch (e) {
      alert('❌ Erreur: ' + (e as Error).message);
    }
  }

  const handleOpenProject = () => {
    setStep(1);
    setView('assistant');
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans text-slate-900 flex">
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#0F172A] text-white flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center font-bold text-[#0F172A] text-sm">B</div>
            <div>
              <div className="font-semibold tracking-tight text-xs">BENIN BUSINESS PLAN</div>
              <div className="text-[9px] text-white/60 uppercase tracking-widest">SaaS • OHADA • XOF</div>
            </div>
          </div>
          <div className="mt-3 p-2.5 rounded-lg bg-white/5 border border-white/10">
            <div className="text-[9px] text-white/50 uppercase">Organisation</div>
            <div className="font-medium text-xs mt-0.5">Cabinet Expert Bénin</div>
            <div className="text-[10px] text-white/60 mt-0.5 truncate">RCCM: RB/COT/23 B 12345</div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] border border-emerald-500/30">● Actif</span>
              <span className="text-[10px] text-white/50">SYSCOHADA</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = view === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#0F172A] font-medium'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full shrink-0">{item.count}</span>
                )}
              </div>
            );
          })}

          <div className="mt-3 p-2.5 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
            <div className="text-[11px] font-medium">Moteur sectoriel</div>
            <div className="text-[10px] text-white/70 mt-0.5">12 secteurs • Formules OHADA</div>
            <VariantBadge sector={getSectorConfig(selectedSector)} variantKey={sectorVariant} />
            <div className="mt-2 grid grid-cols-4 gap-1">
              {SECTORS.slice(0, 8).map((s) => (
                <div key={s.code} className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[11px]">
                  {s.icon}
                </div>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-3 border-t border-white/10 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white text-[#0F172A] flex items-center justify-center font-semibold text-xs">AK</div>
          <div className="min-w-0">
            <div className="text-xs font-medium truncate">Armand K.</div>
            <div className="text-[10px] text-white/60 truncate">Analyste • Admin</div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ml-[260px] flex-1 flex flex-col min-h-screen">
        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-[#F8F9FB]/95 backdrop-blur-xl border-b border-slate-200 px-4 lg:px-6 py-2.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="font-semibold text-sm lg:text-base truncate max-w-[280px] lg:max-w-md">{projectName}</h1>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-medium">Brouillon</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#0F172A] text-white text-[10px]">{currentSector.name}</span>
              </div>
              <div className="text-[10px] lg:text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>📍 Parakou</span> • <span>36 mois</span> • <span>XOF</span> • <span className="text-emerald-600">● Recalcul actif</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Équilibré
              </div>
              <button onClick={() => setView('exports')} className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white hover:bg-slate-50">Export PDF</button>
              <button onClick={() => setView('exports')} className="px-2.5 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-medium flex items-center gap-1 hover:bg-black">
                Excel
              </button>
              <button
                onClick={saveProject}
                disabled={isSaving}
                className="px-2.5 py-1.5 rounded-lg bg-[#10B981] text-white text-xs font-medium hover:bg-emerald-600 shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                {isSaving ? '⏳' : '💾 Sauver'}
              </button>
            </div>
          </div>

          {view === 'assistant' && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setStep(s.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition shrink-0 ${
                      step === s.id
                        ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-md'
                        : step > s.id
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        step === s.id ? 'bg-white text-[#0F172A]' : step > s.id ? 'bg-emerald-600 text-white' : 'bg-slate-100'
                      }`}
                    >
                      {step > s.id ? '✓' : s.id}
                    </span>
                    <span className="font-medium leading-none whitespace-nowrap">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`w-3 h-[1.5px] ${step > s.id ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-3 lg:p-5">
          {view === 'objectif' && <ObjectifTRIView />}
          {view === 'dashboard' && <Dashboard />}
          {view === 'projects' && <ProjetsView onOpenProject={handleOpenProject} />}
          {view === 'scenarios' && <ScenariosView />}
          {view === 'financial' && <ResultatsCard />}
          {view === 'exports' && <ExportsView />}
          {view === 'share' && <PartageView />}
          {view === 'settings' && <ParametresView />}

          {view === 'assistant' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 lg:p-5">
              {step === 1 && <InfosGenerales />}
              {step === 2 && (
                <SecteurCard
                  onSelect={(code) => {
                    setSelectedSector(code);
                    setStep(3);
                  }}
                />
              )}
              {step === 3 && <HypothesesCard onValidate={() => setStep(4)} />}
              {step === 4 && <InvestissementsCard onValidate={() => setStep(5)} />}
              {step === 5 && <FinancementCard onValidate={() => setStep(6)} />}
              {step === 6 && <ResultatsCard />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
