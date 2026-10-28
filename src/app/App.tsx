import React, { useState, useMemo } from 'react'
import { client } from '../lib/supabase/client'

// ========== TYPES ==========
type FieldType = 'number'|'percentage'|'currency'|'text'|'select'
interface AssumptionField {
  key: string
  label: string
  type: FieldType
  unit?: string
  default?: any
  required?: boolean
  help?: string
  options?: {label:string,value:string}[]
}
interface SectorDef {
  sector_code: string
  sector_name: string
  description: string
  icon: string
  assumption_fields: AssumptionField[]
}

// ========== SECTEUR ENGINE - 12 secteurs OHADA ==========
const SECTORS: Record<string, SectorDef> = {
  poultry: {
    sector_code: 'poultry',
    sector_name: 'Aviculture',
    description: 'Poulets de chair, pondeuses, poussins',
    icon: '🐔',
    assumption_fields: [
      { key: 'number_of_cycles_per_year', label: 'Nombre de cycles / an', type: 'number', unit: 'cycles', default: 5, required: true, help: 'Bénin: 5-6 cycles en claustration' },
      { key: 'birds_per_cycle', label: 'Effectif par cycle', type: 'number', unit: 'sujets', default: 5000, required: true },
      { key: 'mortality_rate', label: 'Taux mortalité', type: 'percentage', unit: '%', default: 0.05 },
      { key: 'average_weight', label: 'Poids moyen vente', type: 'number', unit: 'kg', default: 1.8 },
      { key: 'selling_price_per_kg', label: 'Prix vente kg', type: 'currency', unit: 'FCFA', default: 2200 },
      { key: 'feed_consumption_per_bird', label: 'Aliment / sujet / cycle', type: 'number', unit: 'kg', default: 3.5 },
      { key: 'feed_price', label: 'Prix aliment', type: 'currency', unit: 'FCFA/kg', default: 350 },
      { key: 'chick_price', label: 'Prix poussin 1j', type: 'currency', unit: 'FCFA', default: 800 },
      { key: 'vaccine_cost_per_bird', label: 'Vaccins + véto / sujet', type: 'currency', unit: 'FCFA', default: 150 },
    ]
  },
  anacarde: {
    sector_code: 'anacarde',
    sector_name: 'Anacarde / Cajou',
    description: 'Production, collecte, transformation',
    icon: '🥜',
    assumption_fields: [
      { key: 'superficie_ha', label: 'Superficie', type: 'number', unit: 'ha', default: 10, required: true },
      { key: 'rendement_kg_ha', label: 'Rendement brut', type: 'number', unit: 'kg/ha', default: 600 },
      { key: 'prix_bord_champ', label: 'Prix bord champ', type: 'currency', unit: 'FCFA/kg', default: 375 },
      { key: 'taux_transformation', label: 'Taux amande', type: 'percentage', default: 0.22 },
      { key: 'prix_amande_kg', label: 'Prix amande export', type: 'currency', unit: 'FCFA/kg', default: 3500 },
    ]
  },
  agriculture: { sector_code: 'agriculture', sector_name: 'Agriculture', description: 'Céréales, maraîchage', icon: '🌾', assumption_fields: [{ key: 'superficie_ha', label: 'Superficie', type: 'number', unit: 'ha', default: 5 }, { key: 'rendement_t_ha', label: 'Rendement', type: 'number', unit: 't/ha', default: 3 }, { key: 'prix_t', label: 'Prix vente', type: 'currency', unit: 'FCFA/t', default: 250000 }] },
  agro_industrie: { sector_code: 'agro_industrie', sector_name: 'Agro-industrie', description: 'Transformation', icon: '🏭', assumption_fields: [{ key: 'capacite_t_jour', label: 'Capacité t/j', type: 'number', unit: 't/j', default: 2 }, { key: 'taux_utilisation', label: 'Taux utilisation', type: 'percentage', default: 0.7 }, { key: 'prix_vente_kg', label: 'Prix vente', type: 'currency', unit: 'FCFA/kg', default: 800 }] },
  commerce: { sector_code: 'commerce', sector_name: 'Commerce général', description: 'Détail, gros', icon: '🛒', assumption_fields: [{ key: 'stock_initial', label: 'Stock initial', type: 'currency', unit: 'FCFA', default: 5000000 }, { key: 'rotation_stock', label: 'Rotation/an', type: 'number', default: 6 }, { key: 'marge_commerciale', label: 'Marge', type: 'percentage', default: 0.25 }] },
  import_export: { sector_code: 'import_export', sector_name: 'Import-Export', description: 'Transit, douane', icon: '🚢', assumption_fields: [{ key: 'valeur_import', label: 'Valeur import', type: 'currency', unit: 'FCFA', default: 20000000 }, { key: 'taux_douane', label: 'Droits douane', type: 'percentage', default: 0.15 }] },
  restauration: { sector_code: 'restauration', sector_name: 'Restauration', description: 'Maquis, resto', icon: '🍽️', assumption_fields: [{ key: 'nb_couverts_jour', label: 'Couverts/j', type: 'number', default: 80 }, { key: 'ticket_moyen', label: 'Ticket moyen', type: 'currency', unit: 'FCFA', default: 3500 }, { key: 'jours_ouverture', label: 'Jours/mois', type: 'number', default: 26 }] },
  btp: { sector_code: 'btp', sector_name: 'BTP', description: 'Construction', icon: '🏗️', assumption_fields: [{ key: 'nb_chantiers_an', label: 'Chantiers/an', type: 'number', default: 4 }, { key: 'ca_moyen_chantier', label: 'CA moyen', type: 'currency', unit: 'FCFA', default: 15000000 }] },
  transport: { sector_code: 'transport', sector_name: 'Transport', description: 'Flotte, logistique', icon: '🚚', assumption_fields: [{ key: 'nb_vehicules', label: 'Flotte', type: 'number', default: 3 }, { key: 'km_mensuel', label: 'Km/mois/véh', type: 'number', default: 5000 }, { key: 'prix_km', label: 'Prix/km', type: 'currency', unit: 'FCFA', default: 500 }] },
  services: { sector_code: 'services', sector_name: 'Services', description: 'Conseil, presta', icon: '💼', assumption_fields: [{ key: 'effectif_facturable', label: 'Effectif facturable', type: 'number', default: 5 }, { key: 'tjm', label: 'TJM', type: 'currency', unit: 'FCFA', default: 75000 }, { key: 'taux_utilisation', label: 'Taux utilisation', type: 'percentage', default: 0.65 }] },
  elevage_autre: { sector_code: 'elevage_autre', sector_name: 'Élevage autre', description: 'Bovins, ovins, porcs', icon: '🐄', assumption_fields: [{ key: 'cheptel', label: 'Cheptel initial', type: 'number', default: 50 }, { key: 'prix_vente_tete', label: 'Prix/tête', type: 'currency', unit: 'FCFA', default: 150000 }] },
  transformation_agro: { sector_code: 'transformation_agro', sector_name: 'Transfo. agroalimentaire', description: 'Jus, farine, huile', icon: '🥫', assumption_fields: [{ key: 'capacite_installee', label: 'Capacité kg/j', type: 'number', default: 500 }, { key: 'rendement_matiere', label: 'Rendement', type: 'percentage', default: 0.85 }] },
}

// ========== FORMATAGE FCFA OHADA ==========
const fmtFCFA = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n).replace('XOF', 'FCFA')
const fmtNum = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n))
const fmtPct = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 1 }).format(n)

// ========== MOTEUR FINANCIER CENTRAL ==========
function calculateFinancials(assumptions: Record<string, number>, investments: any[], financings: any[], months: number, scenario: 'prudent'|'central'|'optimiste') {
  const multCA = scenario === 'prudent' ? 0.85 : scenario === 'optimiste' ? 1.15 : 1
  const multCost = scenario === 'prudent' ? 1.10 : scenario === 'optimiste' ? 0.95 : 1

  let caBase = 0
  if (assumptions.birds_per_cycle) {
    const birdsVendables = assumptions.birds_per_cycle * (1 - (assumptions.mortality_rate || 0.05))
    const caParCycle = birdsVendables * (assumptions.average_weight || 1.8) * (assumptions.selling_price_per_kg || 2200)
    caBase = (caParCycle * (assumptions.number_of_cycles_per_year || 5)) / 12
  } else if (assumptions.superficie_ha && assumptions.rendement_kg_ha) {
    caBase = (assumptions.superficie_ha * assumptions.rendement_kg_ha * (assumptions.prix_bord_champ || 375)) / 12
  } else if (assumptions.nb_couverts_jour) {
    caBase = assumptions.nb_couverts_jour * (assumptions.ticket_moyen || 3500) * (assumptions.jours_ouverture || 26)
  } else {
    caBase = 8000000
  }

  const caMonthly = Array(months).fill(0).map((_, i) => {
    const saison = 1 + 0.2 * Math.sin((i / 12) * 2 * Math.PI)
    return caBase * multCA * saison
  })

  const varCostMonthly = caMonthly.map(ca => ca * 0.55 * multCost)
  const fixedCostMonthly = Array(months).fill(450000 * multCost)

  const dotations = Array(months).fill(0)
  investments.forEach((inv: any) => {
    const mensuel = (inv.amount - (inv.residual_value || 0)) / (inv.duration || 60)
    for (let m = 0; m < Math.min(months, inv.duration || 60); m++) dotations[m] += mensuel
  })

  const interets = Array(months).fill(0)
  const remboursements = Array(months).fill(0)
  financings.filter((f: any) => f.type === 'emprunt').forEach((loan: any) => {
    const r = (loan.rate || 0.08) / 12
    const n = loan.duration || 36
    const mensualite = n > 0 ? loan.amount * r / (1 - Math.pow(1 + r, -n)) : 0
    let capitalRestant = loan.amount
    for (let m = loan.defer || 0; m < Math.min(months, (loan.defer || 0) + n); m++) {
      const interet = capitalRestant * r
      const capital = mensualite - interet
      interets[m] += interet
      remboursements[m] += capital
      capitalRestant -= capital
    }
  })

  let tresorCumul = financings.reduce((s: number, f: any) => s + f.amount, 0) - investments.reduce((s: number, i: any) => s + i.amount, 0)
  let resultatCumul = 0
  let amortCumul = 0

  const income: any[] = []
  const treasury: any[] = []
  const balance: any[] = []
  const alerts: any[] = []

  for (let m = 0; m < months; m++) {
    const ca = caMonthly[m]
    const achats = varCostMonthly[m]
    const marge = ca - achats
    const ebe = marge - fixedCostMonthly[m]
    const re = ebe - dotations[m]
    const rf = -interets[m]
    const rai = re + rf
    const is = rai > 0 ? rai * 0.30 : 0
    const rn = rai - is
    const caf = rn + dotations[m]
    resultatCumul += rn
    amortCumul += dotations[m]

    const encaissements = ca * 0.95
    const decaissements = achats + fixedCostMonthly[m] + interets[m] + remboursements[m] + is
    const solde = encaissements - decaissements
    tresorCumul += solde

    income.push({ ca, achats, marge, ebe, re, rf, rai, is, rn, caf, dot: dotations[m] })
    treasury.push({ encaissements, decaissements, solde, cumul: tresorCumul })

    const immoNet = investments.reduce((s: number, i: any) => s + i.amount, 0) - amortCumul
    const stocks = achats * 0.3
    const creances = ca * 0.05
    const dettesFourn = achats * 0.25
    const dettesFisc = is * 0.5
    const dettesFin = financings.reduce((s: number, f: any) => s + f.amount, 0) - remboursements.slice(0, m + 1).reduce((a, b) => a + b, 0)
    const capitaux = financings.filter((f: any) => f.type !== 'emprunt').reduce((s: number, f: any) => s + f.amount, 0) + resultatCumul
    const totalActif = immoNet + stocks + creances + tresorCumul
    const totalPassif = capitaux + dettesFin + dettesFourn + dettesFisc

    balance.push({ immoNet, stocks, creances, tresor: tresorCumul, capitaux, dettesFin, dettesFourn, dettesFisc, totalActif, totalPassif })

    if (Math.abs(totalActif - totalPassif) > 1000) alerts.push({ type: 'error', month: m + 1, message: `Le bilan n'est pas équilibré au mois ${m + 1}. Écart ${fmtFCFA(totalActif - totalPassif)}. Vérifiez le financement des investissements.` })
    if (tresorCumul < 0) alerts.push({ type: 'error', month: m + 1, message: `La trésorerie devient négative au mois ${m + 1}. Envisagez un apport supplémentaire ou un crédit de trésorerie.` })
  }

  const caTotal = caMonthly.reduce((a, b) => a + b, 0)
  const rnTotal = income.reduce((s, i) => s + i.rn, 0)
  const investTotal = investments.reduce((s, i) => s + i.amount, 0)

  const van = -investTotal + treasury.reduce((s, t, i) => s + t.solde / Math.pow(1.12, (i + 1) / 12), 0)
  const tri = investTotal > 0 ? rnTotal / investTotal : 0
  const delai = treasury.findIndex(t => t.cumul > 0)
  const dscr = 1.5
  const margeNette = caTotal > 0 ? rnTotal / caTotal : 0
  const seuil = fixedCostMonthly.reduce((a, b) => a + b, 0) + dotations.reduce((a, b) => a + b, 0)

  if (balance.length && balance[balance.length - 1].dettesFin / Math.max(1, balance[balance.length - 1].totalPassif) > 0.7) {
    alerts.push({ type: 'warning', message: `Le taux d'endettement dépasse 70%.` })
  }

  return { caMonthly, income, treasury, balance, kpis: { van, tri, delai: delai >= 0 ? delai : months, dscr, margeNette, seuil, caTotal, rnTotal, investTotal }, alerts }
}

// ========== APP PRINCIPALE ==========
export default function App() {
  const [projectName, setProjectName] = useState('Élevage Poulets de chair 5000 sujets - Parakou')
  const [sectorCode, setSectorCode] = useState('poultry')
  const [scenario, setScenario] = useState<'prudent'|'central'|'optimiste'>('central')
  const [duration, setDuration] = useState(36)
  const [assumptions, setAssumptions] = useState<Record<string, number>>({
    number_of_cycles_per_year: 5,
    birds_per_cycle: 5000,
    mortality_rate: 0.05,
    average_weight: 1.8,
    selling_price_per_kg: 2200,
    feed_consumption_per_bird: 3.5,
    feed_price: 350,
    chick_price: 800,
    vaccine_cost_per_bird: 150,
  })
  const [investments] = useState([
    { label: 'Poulailler 500m²', amount: 12000000, duration: 120, residual_value: 0 },
    { label: 'Abreuvoirs, mangeoires, chauffage', amount: 4000000, duration: 60, residual_value: 200000 },
    { label: 'Forage + château', amount: 2500000, duration: 84, residual_value: 0 },
  ])
  const [financings] = useState([
    { type: 'capital', label: 'Apport capital', amount: 8000000 },
    { type: 'emprunt', label: 'Emprunt bancaire', amount: 10000000, rate: 0.08, duration: 36, defer: 3 },
  ])
  const [activeTab, setActiveTab] = useState<'cr'|'bilan'|'treso'|'fin'>('cr')
  const [isSaving, setIsSaving] = useState(false)

  const sector = SECTORS[sectorCode]
  const results = useMemo(() => calculateFinancials(assumptions, investments, financings, duration, scenario), [assumptions, investments, financings, duration, scenario])

  const saveProject = async () => {
    setIsSaving(true)
    try {
      const { data, error } = await client
        .from('projects')
        .insert([{ name: projectName, sector: sectorCode }])
        .select()

      if (error) throw error
      alert('✅ Projet sauvegardé avec succès dans la base de données !')
      console.log('Données sauvegardées:', data)
    } catch (err: any) {
      console.error(err)
      alert('❌ Erreur: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-zinc-900 font-[Inter] antialiased">
      <header className="sticky top-0 z-30 bg-[#0F172A] text-white border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center font-bold">B</div>
            <div>
              <div className="font-semibold leading-none">Business Plan Bénin</div>
              <div className="text-[11px] text-white/60">SaaS OHADA • FCFA XOF • Bénin</div>
            </div>
            <span className="ml-4 text-[10px] px-2 py-1 bg-white/10 rounded-full">CABINET EXPERT BÉNIN</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-white/10 px-3 py-1.5 rounded-full">Devise: FCFA</span>
            <button onClick={saveProject} disabled={isSaving} className="text-xs bg-[#10B981] px-4 py-1.5 rounded-full font-semibold hover:bg-emerald-600">
              {isSaving ? '⏳...' : '💾 Sauvegarder'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border p-4">
            <h3 className="font-semibold text-sm mb-3">Nom du projet</h3>
            <input 
              type="text" 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm mb-4 focus:border-emerald-500 outline-none"
            />
            
            <h3 className="font-semibold text-sm mb-3">Secteur d'activité</h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(SECTORS).map(s => (
                <button
                  key={s.sector_code}
                  onClick={() => setSectorCode(s.sector_code)}
                  className={`text-left p-3 rounded-xl border flex items-start gap-2.5 transition ${sectorCode === s.sector_code ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-white hover:bg-zinc-50'}`}
                >
                  <span className="text-lg">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[13px] leading-tight">{s.sector_name}</div>
                    <div className={`text-[11px] truncate ${sectorCode === s.sector_code ? 'text-white/60' : 'text-zinc-500'}`}>{s.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-4">
            <h3 className="font-semibold text-sm mb-3">Paramètres</h3>
            <label className="text-xs text-zinc-600">Durée (mois)</label>
            <input type="range" min={12} max={60} step={12} value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full" />
            <div className="text-xs mono">{duration} mois</div>
            <div className="mt-3">
              <label className="text-xs text-zinc-600">Scénario</label>
              <select value={scenario} onChange={e => setScenario(e.target.value as any)} className="w-full mt-1 border rounded-lg px-2 py-2 text-sm">
                <option value="prudent">Prudent (-15% CA, +10% coûts)</option>
                <option value="central">Central</option>
                <option value="optimiste">Optimiste (+15% CA)</option>
              </select>
            </div>
          </div>
        </aside>

        <main className="col-span-9 space-y-4">
          <div className="grid grid-cols-6 gap-3">
            <div className="bg-white rounded-2xl border p-4"><div className="text-[11px] text-zinc-500">CA Total</div><div className="font-bold mono text-sm">{fmtFCFA(results.kpis.caTotal)}</div></div>
            <div className="bg-white rounded-2xl border p-4"><div className="text-[11px] text-zinc-500">Résultat Net</div><div className="font-bold mono text-sm text-[#10B981]">{fmtFCFA(results.kpis.rnTotal)}</div></div>
            <div className="bg-white rounded-2xl border p-4"><div className="text-[11px] text-zinc-500">VAN 12%</div><div className="font-bold mono text-sm">{fmtFCFA(results.kpis.van)}</div></div>
            <div className="bg-white rounded-2xl border p-4"><div className="text-[11px] text-zinc-500">TRI</div><div className="font-bold mono text-sm">{fmtPct(results.kpis.tri)}</div></div>
            <div className="bg-white rounded-2xl border p-4"><div className="text-[11px] text-zinc-500">Marge nette</div><div className="font-bold mono text-sm">{fmtPct(results.kpis.margeNette)}</div></div>
            <div className="bg-white rounded-2xl border p-4"><div className="text-[11px] text-zinc-500">Délai récup</div><div className="font-bold mono text-sm">{results.kpis.delai} mois</div></div>
          </div>

          {results.alerts.length > 0 && (
            <div className="space-y-2">
              {results.alerts.map((a, i) => (
                <div key={i} className={`px-4 py-2.5 rounded-xl text-[13px] border ${a.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>⚠️ {a.message}</div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5 bg-white rounded-2xl border">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-sm">Hypothèses - {sector.sector_name} {sector.icon}</h3>
                <span className="text-[10px] px-2 py-1 bg-[#0F172A] text-white rounded-full">OHADA</span>
              </div>
              <div className="p-4 space-y-3 max-h-[520px] overflow-auto">
                {sector.assumption_fields.map(f => (
                  <div key={f.key} className="grid grid-cols-2 gap-3 items-center">
                    <label className="text-[12px] leading-tight">
                      <div className="font-medium">{f.label}</div>
                      {f.help && <div className="text-[10px] text-zinc-500">{f.help}</div>}
                      <div className="text-[10px] text-zinc-400">{f.unit}</div>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={assumptions[f.key] ?? f.default ?? 0}
                      onChange={e => setAssumptions({ ...assumptions, [f.key]: Number(e.target.value) })}
                      className="border rounded-lg px-3 py-2 text-sm mono w-full focus:border-emerald-500 outline-none"
                    />
                  </div>
                ))}
                <div className="pt-3 border-t text-[11px] text-zinc-500">Toute modification recalcule instantanément CR, bilan, trésorerie, VAN/TRI.</div>
              </div>
            </div>

            <div className="col-span-7 space-y-4">
              <div className="bg-white rounded-2xl border p-4">
                <h4 className="font-semibold text-sm mb-3">Évolution CA & Résultat (12 mois)</h4>
                <div className="h-[180px] flex items-end gap-[2px]">
                  {results.income.slice(0, 12).map((r, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end gap-1">
                      <div className="bg-[#0F172A] rounded-t" style={{ height: `${Math.max(4, (r.ca / Math.max(...results.income.map(x => x.ca))) * 120)}px` }} />
                      <div className="bg-[#10B981] rounded-t" style={{ height: `${Math.max(4, (Math.max(0, r.rn) / Math.max(...results.income.map(x => Math.max(0, x.rn)))) * 60)}px` }} />
                      <div className="text-[9px] text-center text-zinc-400">M{i + 1}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-2 text-[11px]"><span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#0F172A] rounded-full" />CA</span><span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#10B981] rounded-full" />RN</span></div>
              </div>

              <div className="bg-white rounded-2xl border p-4">
                <h4 className="font-semibold text-sm mb-3">Trésorerie cumulée</h4>
                <div className="h-[120px] relative">
                  <svg viewBox="0 0 300 100" className="w-full h-full">
                    <polyline fill="none" stroke="#10B981" strokeWidth="2" points={results.treasury.slice(0, 12).map((t, i) => `${(i / 11) * 300},${100 - Math.min(90, Math.max(10, (t.cumul / Math.max(1, Math.max(...results.treasury.map(x => x.cumul)))) * 80))}`).join(' ')} />
                  </svg>
                </div>
                <div className="text-xs mono mt-1">Fin: {fmtFCFA(results.treasury[results.treasury.length - 1]?.cumul || 0)} {results.treasury[results.treasury.length - 1]?.cumul < 0 && '⚠️ NÉGATIVE'}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border">
            <div className="p-2 flex gap-1 border-b">
              {[
                { k: 'cr', l: 'Compte de résultat' },
                { k: 'bilan', l: 'Bilan' },
                { k: 'treso', l: 'Trésorerie' },
                { k: 'fin', l: 'Plan financement' },
              ].map(t => (
                <button key={t.k} onClick={() => setActiveTab(t.k as any)} className={`px-4 py-2 rounded-xl text-[13px] font-medium ${activeTab === t.k ? 'bg-[#0F172A] text-white' : 'hover:bg-zinc-100'}`}>{t.l}</button>
              ))}
              <div className="ml-auto flex gap-2">
                <button className="px-3 py-2 text-xs border rounded-xl">Export Excel</button>
                <button className="px-3 py-2 text-xs bg-[#0F172A] text-white rounded-xl">Export PDF</button>
              </div>
            </div>

            <div className="overflow-auto max-h-[360px]">
              {activeTab === 'cr' && (
                <table className="w-full text-[12px] mono">
                  <thead className="sticky top-0 bg-zinc-50"><tr><th className="text-left p-2">Rubrique</th>{Array.from({ length: 12 }).map((_, i) => <th key={i} className="text-right p-2">M{i + 1}</th>)}<th className="text-right p-2 font-bold">Total</th></tr></thead>
                  <tbody>
                    {[
                      { l: 'Chiffre d’affaires', v: results.income.map(r => r.ca) },
                      { l: 'Achats consommés', v: results.income.map(r => r.achats) },
                      { l: 'Marge brute', v: results.income.map(r => r.marge), bold: true },
                      { l: 'Charges fixes', v: results.income.map(r => 450000) },
                      { l: 'EBE', v: results.income.map(r => r.ebe) },
                      { l: 'Dot. amortissements', v: results.income.map(r => r.dot) },
                      { l: 'Résultat exploitation', v: results.income.map(r => r.re), bold: true },
                      { l: 'Intérêts emprunt', v: results.income.map(r => -r.rf) },
                      { l: 'Résultat avant impôt', v: results.income.map(r => r.rai) },
                      { l: 'IS 30%', v: results.income.map(r => r.is) },
                      { l: 'Résultat net', v: results.income.map(r => r.rn), bold: true, color: true },
                    ].map((row, idx) => (
                      <tr key={idx} className={`border-t ${row.bold ? 'font-semibold bg-zinc-50/50' : ''}`}>
                        <td className="p-2 text-left font-[Inter]">{row.l}</td>
                        {row.v.slice(0, 12).map((val, i) => <td key={i} className={`text-right p-2 ${row.color && val < 0 ? 'text-red-600' : ''}`}>{fmtNum(val as number)}</td>)}
                        <td className="text-right p-2 font-bold">{fmtNum((row.v as number[]).reduce((a, b) => a + (b as number), 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {activeTab === 'bilan' && (
                <table className="w-full text-[12px] mono">
                  <thead className="sticky top-0 bg-zinc-50"><tr><th className="text-left p-2">Bilan</th><th className="text-right p-2">M1</th><th className="text-right p-2">M6</th><th className="text-right p-2">M12</th><th className="text-right p-2">M{results.balance.length}</th></tr></thead>
                  <tbody>
                    {[
                      { l: 'Actif immobilisé net', k: 'immoNet' },
                      { l: 'Stocks (30% achats)', k: 'stocks' },
                      { l: 'Créances (5% CA)', k: 'creances' },
                      { l: 'Trésorerie', k: 'tresor' },
                      { l: 'TOTAL ACTIF', k: 'totalActif', bold: true },
                      { l: 'Capitaux propres', k: 'capitaux' },
                      { l: 'Dettes financières', k: 'dettesFin' },
                      { l: 'Dettes fournisseurs', k: 'dettesFourn' },
                      { l: 'TOTAL PASSIF', k: 'totalPassif', bold: true },
                    ].map(r => (
                      <tr key={r.k} className={`border-t ${r.bold ? 'font-bold bg-zinc-50' : ''}`}>
                        <td className="p-2 text-left font-[Inter]">{r.l}</td>
                        <td className="text-right p-2">{fmtNum((results.balance[0] as any)[r.k])}</td>
                        <td className="text-right p-2">{fmtNum((results.balance[Math.min(5, results.balance.length - 1)] as any)[r.k])}</td>
                        <td className="text-right p-2">{fmtNum((results.balance[Math.min(11, results.balance.length - 1)] as any)[r.k])}</td>
                        <td className="text-right p-2">{fmtNum((results.balance[results.balance.length - 1] as any)[r.k])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {activeTab === 'treso' && (
                <table className="w-full text-[12px] mono">
                  <thead className="sticky top-0 bg-zinc-50"><tr><th className="text-left p-2">Trésorerie</th>{Array.from({ length: 12 }).map((_, i) => <th key={i} className="text-right p-2">M{i + 1}</th>)}</tr></thead>
                  <tbody>
                    <tr className="border-t"><td className="p-2">Encaissements 95%</td>{results.treasury.slice(0, 12).map((t, i) => <td key={i} className="text-right p-2">{fmtNum(t.encaissements)}</td>)}</tr>
                    <tr className="border-t"><td className="p-2">Décaissements</td>{results.treasury.slice(0, 12).map((t, i) => <td key={i} className="text-right p-2">{fmtNum(t.decaissements)}</td>)}</tr>
                    <tr className="border-t font-bold"><td className="p-2">Solde mensuel</td>{results.treasury.slice(0, 12).map((t, i) => <td key={i} className={`text-right p-2 ${t.solde < 0 ? 'text-red-600' : ''}`}>{fmtNum(t.solde)}</td>)}</tr>
                    <tr className="border-t font-bold bg-zinc-50"><td className="p-2">Trésorerie cumulée</td>{results.treasury.slice(0, 12).map((t, i) => <td key={i} className={`text-right p-2 ${t.cumul < 0 ? 'text-red-600 bg-red-50' : ''}`}>{fmtNum(t.cumul)}</td>)}</tr>
                  </tbody>
                </table>
              )}
              {activeTab === 'fin' && (
                <div className="p-4 grid grid-cols-2 gap-6 text-sm">
                  <div><h4 className="font-semibold mb-2">Besoins</h4><div className="space-y-1 mono text-[13px]"><div className="flex justify-between"><span>Investissements</span><span>{fmtFCFA(results.kpis.investTotal)}</span></div><div className="flex justify-between"><span>BFR démarrage</span><span>{fmtFCFA(results.kpis.caTotal * 0.15)}</span></div><div className="flex justify-between font-bold border-t pt-1"><span>Total besoins</span><span>{fmtFCFA(results.kpis.investTotal + results.kpis.caTotal * 0.15)}</span></div></div></div>
                  <div><h4 className="font-semibold mb-2">Ressources</h4><div className="space-y-1 mono text-[13px]"><div className="flex justify-between"><span>Capital</span><span>{fmtFCFA(8000000)}</span></div><div className="flex justify-between"><span>Emprunt</span><span>{fmtFCFA(10000000)}</span></div><div className="flex justify-between font-bold border-t pt-1"><span>Total ressources</span><span>{fmtFCFA(18000000)}</span></div></div></div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
