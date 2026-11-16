import { useState, useEffect } from 'react';
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
  { id: 'projects', label: 'Projets', icon: '📁' },
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

  // ── Sidebar dynamique ──
  const promoterName = useProjectStore((s) => s.info.promoterName);
  const promoterRole = useProjectStore((s) => s.info.currentRole);
  const [orgSettings, setOrgSettings] = useState<{ organisation: string; rccm: string; ifu: string; devise: string }>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('bpb-settings') || '{}');
      return {
        organisation: raw.organisation || 'Mon Organisation',
        rccm: raw.rccm || '—',
        ifu: raw.ifu || '—',
        devise: raw.devise || 'XOF',
      };
    } catch {
      return { organisation: 'Mon Organisation', rccm: '—', ifu: '—', devise: 'XOF' };
    }
  });
  // Re-lire bpb-settings quand la vue change (retour de Paramètres)
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('bpb-settings') || '{}');
      setOrgSettings({
        organisation: raw.organisation || 'Mon Organisation',
        rccm: raw.rccm || '—',
        ifu: raw.ifu || '—',
        devise: raw.devise || 'XOF',
      });
    } catch {}
  }, [view]);

  // ── Compteur projets (API + localStorage) ──
  const [projectsCount, setProjectsCount] = useState(0);
  useEffect(() => {
    const local = (() => {
      try { return JSON.parse(localStorage.getItem('bpb-local-projects') || '[]').length; }
      catch { return 0; }
    })();
    let cancelled = false;
    fetch('/api/projects')
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => { if (!cancelled) setProjectsCount(list.length + local); })
      .catch(() => { if (!cancelled) setProjectsCount(local); });
    return () => { cancelled = true; };
  }, [view]);

  // ── Nav items dynamiques (count projets) ──
  const navItems = NAV_ITEMS.map((item) =>
    item.id === 'projects' ? { ...item, count: projectsCount } : item
  );

  // ── Initiales organisation + promoteur ──
  const orgInitials = (orgSettings.organisation || 'B').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'B';
  const promoterDisplay = promoterName || 'Utilisateur';
  const promoterInitials = promoterDisplay.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'UT';
  const promoterRoleDisplay = promoterRole || 'Gérant';
  const selectedSector = useProjectStore((s) => s.sectorCode);
  const sectorVariant = useProjectStore((s) => s.sectorVariant);
  const setSelectedSector = useProjectStore((s) => s.setSelectedSector);
  const loadProject = useProjectStore((s) => s.loadProject);

  const currentSector = SECTORS.find((s) => s.code === selectedSector) || SECTORS[0];

  // Header dynamique
  const location = useProjectStore((s) => s.info.location);
  const hypotheses = useProjectStore((s) => s.hypotheses);
  const investments = useProjectStore((s) => s.investments);
  const financement = useProjectStore((s) => s.financement);
  const [isRecalcul, setIsRecalcul] = useState(false);
  useEffect(() => {
    setIsRecalcul(true);
    const t = setTimeout(() => setIsRecalcul(false), 700);
    return () => clearTimeout(t);
  }, [hypotheses, investments, financement, selectedSector]);
  const dureeEtude = (() => {
    try { return Number(JSON.parse(localStorage.getItem('bpb-settings') || '{}').dureeEtude ?? 7); }
    catch { return 7; }
  })();

  const saveProject = async () => {
    try {
      const result = await useProjectStore.getState().saveCurrentProject();
      alert('✅ Projet sauvegardé (id: ' + result.id.slice(0, 8) + '…)');
    } catch (e) {
      // Fallback : sauvegarde locale (API Cloudflare indisponible en localhost)
      const st = useProjectStore.getState();
      const snapshot = {
        name: (st.info as any)?.nomEntreprise || 'Sans titre',
        sector: st.sectorCode,
        variant: st.sectorVariant,
        savedAt: new Date().toISOString(),
        hypotheses: st.hypotheses,
        investments: st.investments,
        financement: st.financement,
        info: st.info,
        sectorValues: st.sectorValues,
      };
      try {
        const existing = JSON.parse(localStorage.getItem('bpb-local-projects') || '[]');
        existing.unshift(snapshot);
        localStorage.setItem('bpb-local-projects', JSON.stringify(existing.slice(0, 50)));
      } catch {}
      const msg = (e as Error).message || '';
      if (msg.includes('401') || msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('HTTP')) {
        alert('✅ Projet sauvegardé LOCALEMENT\n\n(API Neon indisponible en localhost — le projet est conservé dans ton navigateur)\n\nTu pourras rouvrir ce projet via "Projets" dans la sidebar.');
      } else {
        alert('❌ Erreur: ' + msg);
      }
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
            <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center font-bold text-[#0F172A] text-sm">{orgInitials}</div>
            <div>
              <div className="font-semibold tracking-tight text-xs">BENIN BUSINESS PLAN</div>
              <div className="text-[9px] text-white/60 uppercase tracking-widest">SaaS • OHADA • {orgSettings.devise}</div>
            </div>
          </div>
          <div className="mt-3 p-2.5 rounded-lg bg-white/5 border border-white/10">
            <div className="text-[9px] text-white/50 uppercase">Organisation</div>
            <div className="font-medium text-xs mt-0.5 truncate" title={orgSettings.organisation}>{orgSettings.organisation}</div>
            <div className="text-[10px] text-white/60 mt-0.5 truncate" title={orgSettings.rccm}>RCCM: {orgSettings.rccm}</div>
            <div className="text-[10px] text-white/60 truncate" title={orgSettings.ifu}>IFU: {orgSettings.ifu}</div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] border border-emerald-500/30">● Actif</span>
              <span className="text-[10px] text-white/50">SYSCOHADA</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
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
            <div className="text-[10px] text-white/70 mt-0.5">{SECTORS.length} secteurs • Formules OHADA</div>
            <VariantBadge sector={getSectorConfig(selectedSector)} variantKey={sectorVariant} />
            <div className="mt-2 grid grid-cols-5 gap-1">
              {SECTORS.map((s) => (
                <div
                  key={s.code}
                  title={s.name}
                  className={`w-6 h-6 rounded flex items-center justify-center text-[11px] transition cursor-pointer ${
                    s.code === selectedSector
                      ? 'bg-emerald-500 text-[#0F172A] font-bold ring-1 ring-white/60'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  onClick={() => setSelectedSector(s.code)}
                >
                  {s.icon}
                </div>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-3 border-t border-white/10 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white text-[#0F172A] flex items-center justify-center font-semibold text-xs">{promoterInitials}</div>
          <div className="min-w-0">
            <div className="text-xs font-medium truncate" title={promoterDisplay}>{promoterDisplay}</div>
            <div className="text-[10px] text-white/60 truncate" title={promoterRoleDisplay}>{promoterRoleDisplay} • Promoteur</div>
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
                <h1 className="font-semibold text-sm lg:text-base truncate max-w-[280px] lg:max-w-md">{projectName || 'Nouveau projet'}</h1>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-medium">Brouillon</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#0F172A] text-white text-[10px]">{currentSector.name}</span>
              </div>
              <div className="text-[10px] lg:text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>📍 {location || 'Cotonou'}</span> • <span>{dureeEtude * 12} mois</span> • <span>XOF</span> • <span className={isRecalcul ? 'text-amber-600 animate-pulse' : 'text-emerald-600'}>● {isRecalcul ? 'Recalcul…' : 'Recalcul actif'}</span>
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
