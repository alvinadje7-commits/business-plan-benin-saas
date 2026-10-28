import React, { useState, useMemo } from 'react'
import { client } from '../lib/supabase/client'

// ========== TYPES ==========
interface SectorField {
  key: string
  label: string
  type: string
  unit?: string
  default: number
}

interface Sector {
  code: string
  name: string
  emoji: string
  description: string
  color: string
  fields: SectorField[]
}

// ========== SECTEURS ==========
const SECTORS: Sector[] = [
  { code: 'aviculture', name: 'Aviculture', emoji: '🐔', description: 'Poulets de chair, pondeuses', color: '#F59E0B', fields: [
    { key: 'cycles', label: 'Nombre de cycles par an', type: 'integer', unit: 'cycles', default: 5 },
    { key: 'birds', label: 'Effectif par cycle', type: 'integer', unit: 'sujets', default: 5000 },
    { key: 'price', label: 'Prix de vente au kg', type: 'currency', unit: 'FCFA', default: 2200 }
  ]},
  { code: 'anacarde', name: 'Anacarde / Cajou', emoji: '🥜', description: 'Superficie, rendement', color: '#92400E', fields: [
    { key: 'superficie', label: 'Superficie', type: 'number', unit: 'ha', default: 15 },
    { key: 'prix', label: 'Prix bord champ', type: 'currency', unit: 'FCFA/kg', default: 400 }
  ]},
  { code: 'agriculture', name: 'Agriculture', emoji: '🌾', description: 'Maïs, riz, maraîchage', color: '#10B981', fields: [] },
  { code: 'agro_industrie', name: 'Agro-industrie', emoji: '🏭', description: 'Transformation', color: '#6366F1', fields: [] },
  { code: 'commerce', name: 'Commerce général', emoji: '🛒', description: 'Stock, rotation', color: '#EC4899', fields: [] },
  { code: 'import_export', name: 'Import-Export', emoji: '🚢', description: 'Devise, douane', color: '#0EA5E9', fields: [] },
  { code: 'restauration', name: 'Restauration', emoji: '🍽️', description: 'Couverts, ticket moyen', color: '#F97316', fields: [] },
  { code: 'btp', name: 'BTP', emoji: '🏗️', description: 'Chantiers', color: '#475569', fields: [] },
  { code: 'transport', name: 'Transport', emoji: '🚚', description: 'Flotte, km', color: '#14B8A6', fields: [] },
  { code: 'services', name: 'Services', emoji: '💼', description: 'Effectifs, TJM', color: '#8B5CF6', fields: [] },
  { code: 'elevage_autre', name: 'Élevage autre', emoji: '🐄', description: 'Bovins, ovins', color: '#A16207', fields: [] },
  { code: 'transformation_agro', name: 'Transformation agro', emoji: '🥫', description: 'Capacité, rendement', color: '#DC2626', fields: [] }
]

export default function App() {
  const [step, setStep] = useState(2) // 2 = Secteur, comme sur ta capture
  const [projectName, setProjectName] = useState('Élevage Poulets de chair 5000 sujets - Parakou')
  const [selectedSector, setSelectedSector] = useState<string>('aviculture')
  const [isSaving, setIsSaving] = useState(false)

  const saveProjectToDB = async () => {
    setIsSaving(true)
    try {
      const { error } = await client
        .from('projects')
        .insert([{ name: projectName, sector: selectedSector }])
      if (error) throw error
      alert('✅ Projet sauvegardé avec succès dans Neon !')
    } catch (err: any) {
      alert('❌ Erreur : ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const currentSector = SECTORS.find(s => s.code === selectedSector) || SECTORS[0]

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
          {[
            { label: 'Tableau de bord', icon: '📊' },
            { label: 'Projets', icon: '📁', count: 12 },
            { label: 'Assistant Business Plan', icon: '🧭', active: true },
            { label: 'États financiers', icon: '📑' },
            { label: 'Scénarios', icon: '🔀' },
            { label: 'Exports PDF/Excel', icon: '📤' },
            { label: 'Partage & Banques', icon: '🔗' },
            { label: 'Paramètres', icon: '⚙️' },
          ].map(item => (
            <div 
              key={item.label}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm cursor-pointer transition ${item.active ? 'bg-white text-[#0F172A] font-medium' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
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
              {SECTORS.slice(0, 8).map(s => (
                <div key={s.code} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[14px]">{s.emoji}</div>
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

      {/* MAIN CONTENT */}
      <div className="ml-[280px] flex-1 flex flex-col min-h-screen">
        
        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-[#F8F9FB]/90 backdrop-blur-xl border-b border-slate-200 px-8 py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-lg">{projectName}</h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-medium">Brouillon</span>
                <span className="px-2 py-0.5 rounded-full bg-[#0F172A] text-white text-[11px]">{currentSector.name}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
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
              <button onClick={saveProjectToDB} disabled={isSaving} className="px-4 py-2 rounded-xl bg-[#10B981] text-white text-sm font-medium hover:bg-emerald-600">
                {isSaving ? '⏳...' : '+ Nouveau projet'}
              </button>
            </div>
          </div>

          {/* STEPPER */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: 1, label: 'Infos générales', desc: 'Projet & promoteur' },
              { id: 2, label: 'Secteur', desc: '12 filières' },
              { id: 3, label: 'Hypothèses', desc: 'Moteur dynamique' },
              { id: 4, label: 'Investissements', desc: 'Amortissements OHADA' },
              { id: 5, label: 'Financement', desc: 'Dette & capital' },
              { id: 6, label: 'Exploitation & Résultats', desc: 'États financiers' }
            ].map((s, i) => (
              <React.Fragment key={s.id}>
                <button 
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm transition shrink-0 ${step === s.id ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-lg' : step > s.id ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === s.id ? 'bg-white text-[#0F172A]' : step > s.id ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>
                    {step > s.id ? '✓' : s.id}
                  </span>
                  <div className="text-left">
                    <div className="font-medium leading-none">{s.label}</div>
                    <div className="text-[11px] opacity-70 mt-1">{s.desc}</div>
                  </div>
                </button>
                {i < 5 && <div className={`w-8 h-[2px] ${step > s.id ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </header>

        {/* CONTENU */}
        <main className="flex-1 p-8 space-y-6">
          
          {/* KPIs */}
          <div className="grid grid-cols-6 gap-3">
            {[
              { label: 'VAN (12%)', value: '64 029 587 FCFA', sub: 'Projet rentable', color: 'text-emerald-600' },
              { label: 'TRI', value: '55.0%', sub: 'Rentabilité interne', color: 'text-slate-900' },
              { label: 'DÉLAI RÉCUP.', value: '7 mois', sub: '0.6 ans', color: 'text-slate-900' },
              { label: 'SEUIL RENTABILITÉ', value: '87 319 196 FCFA', sub: 'CA annuel min', color: 'text-slate-900' },
              { label: 'DSCR', value: '15.09', sub: 'Couverture OK', color: 'text-emerald-600' },
              { label: 'MARGE NETTE', value: '30.2%', sub: 'RN / CA', color: 'text-emerald-600' }
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="text-[11px] uppercase tracking-widest text-slate-500 font-medium">{kpi.label}</div>
                <div className={`mt-2 text-[18px] font-semibold tracking-tight ${kpi.color}`}>{kpi.value}</div>
                <div className="text-[11px] text-slate-500 mt-1">{kpi.sub}</div>
              </div>
            ))}
          </div>

          {/* CONTENU DE L'ÉTAPE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[500px]">
            
            {step === 2 && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">Moteur sectoriel dynamique</h2>
                    <p className="text-sm text-slate-500 mt-1">12 secteurs Bénin/Afrique de l'Ouest • Champs, formules, KPIs auto-adaptés</p>
                  </div>
                  <div className="hidden lg:flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                    ● Registre sectoriel chargé • 12 modèles
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {SECTORS.map(s => (
                    <div 
                      key={s.code} onClick={() => setSelectedSector(s.code)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedSector === s.code ? 'border-[#0F172A] bg-[#0F172A] text-white shadow-xl scale-[1.02]' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${selectedSector === s.code ? 'bg-white text-[#0F172A]' : 'bg-slate-100'}`}>{s.emoji}</div>
                        {selectedSector === s.code && <span className="text-[10px] bg-emerald-500 px-2 py-1 rounded-full text-white font-bold">SÉLECTIONNÉ</span>}
                      </div>
                      <div className="mt-4 font-semibold">{s.name}</div>
                      <div className={`text-xs mt-1 ${selectedSector === s.code ? 'text-white/70' : 'text-slate-500'}`}>{s.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step !== 2 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 py-20">
                <div className="text-4xl text-slate-300">🚧</div>
                <div className="text-lg font-medium text-slate-600">Étape {step} en construction</div>
                <p className="text-sm text-center max-w-md">Le design de cette étape sera connecté à Neon dans la prochaine phase.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
