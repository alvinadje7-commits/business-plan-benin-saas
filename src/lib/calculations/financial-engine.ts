
import { InvestmentItem, FinancingSource, FinancialResult } from '../../types/financial'

interface EngineInput {
  months: number
  ca_monthly: number[]
  variable_cost_monthly: number[]
  fixed_cost_monthly: number[]
  investments: InvestmentItem[]
  financings: FinancingSource[]
  tax_rate: number
  vat_rate: number
  assumptions: Record<string,number>
  seasonality?: number[]
}

function amortissementLineaire(montant:number,duree:number): number[] {
  const mensuel = montant / duree
  return Array(duree).fill(mensuel)
}

export function calculateFinancials(input: EngineInput): FinancialResult {
  const { months, ca_monthly, variable_cost_monthly, fixed_cost_monthly, investments, financings, tax_rate } = input
  const seasonality = input.seasonality ?? Array(months).fill(1)

  const ca = ca_monthly.map((v,i)=> v*seasonality[i])
  const achats = variable_cost_monthly.map((v,i)=> v*seasonality[i])
  const charges_fixes = fixed_cost_monthly

  // amortissements
  const dotations = Array(months).fill(0)
  investments.forEach(inv=>{
    const schedule = amortissementLineaire(inv.amount - inv.residual_value, inv.depreciation_duration)
    schedule.forEach((d,idx)=>{ if(idx<months) dotations[idx]+=d })
  })

  // dette - tableau amortissement simplifié
  const interets = Array(months).fill(0)
  const remboursements = Array(months).fill(0)
  financings.filter(f=>f.type==='emprunt').forEach(loan=>{
    const r = loan.interest_rate/12
    const n = loan.duration_months
    const mensualite = n>0 ? loan.amount * r / (1-Math.pow(1+r,-n)) : 0
    let capitalRestant = loan.amount
    for(let m=loan.defer_months; m<Math.min(months, loan.defer_months+n); m++){
      const interet = capitalRestant * r
      const capital = mensualite - interet
      interets[m]+=interet
      remboursements[m]+=capital
      capitalRestant-=capital
    }
  })

  const income = []
  const treasury = []
  const balance = []
  let tresorerieCumul = financings.reduce((s,f)=>s+f.amount,0) - investments.reduce((s,i)=>s+i.amount,0)
  let resultatCumul = 0
  let amortCumul = 0

  for(let m=0;m<months;m++){
    const chiffre = ca[m]
    const marge = chiffre - achats[m]
    const ebe = marge - charges_fixes[m]
    const re = ebe - dotations[m]
    const rf = -interets[m]
    const rai = re + rf
    const is = rai>0 ? rai*tax_rate : 0
    const rn = rai - is
    const caf = rn + dotations[m]
    resultatCumul += rn
    amortCumul += dotations[m]

    // tresorerie
    const encaissements = chiffre * 0.95 // hypothese delai client 5%
    const decaissements = achats[m] + charges_fixes[m] + interets[m] + remboursements[m] + is
    const solde = encaissements - decaissements
    tresorerieCumul += solde

    income.push({ ca:chiffre, achats:achats[m], marge_brute:marge, ebe, re, rf, rai, is, rn, caf })
    treasury.push({ encaissements, decaissements, solde, cumul: tresorerieCumul })

    const actifImmobiliseNet = investments.reduce((s,i)=>s+i.amount,0) - amortCumul
    const stocks = achats[m]*0.3
    const creances = ca[m]*0.05
    const dettesFourn = achats[m]*0.25
    const dettesFisc = is*0.5
    const dettesFin = financings.reduce((s,f)=>s+f.amount,0) - remboursements.slice(0,m+1).reduce((a,b)=>a+b,0)
    const capitaux = financings.filter(f=>f.type!=='emprunt').reduce((s,f)=>s+f.amount,0) + resultatCumul
    const totalActif = actifImmobiliseNet + stocks + creances + tresorerieCumul
    const totalPassif = capitaux + dettesFin + dettesFourn + dettesFisc
    balance.push({ actif_immobilise_net:actifImmobiliseNet, stocks, creances, tresorerie:tresorerieCumul, capitaux_propres:capitaux, dettes_fin:dettesFin, dettes_fourn:dettesFourn, dettes_fisc:dettesFisc, total_actif:totalActif, total_passif:totalPassif })
  }

  // VAN TRI simplifiés
  const tauxActualisation = 0.12
  let van = -investments.reduce((s,i)=>s+i.amount,0)
  treasury.forEach((t,i)=>{ van += t.solde / Math.pow(1+tauxActualisation, (i+1)/12) })
  const totalInvest = investments.reduce((s,i)=>s+i.amount,0)
  const tri = totalInvest>0 ? (income.reduce((s,i)=>s+i.rn,0)/totalInvest) : 0
  const delaiRecup = treasury.findIndex(t=>t.cumul>0)
  const caAnnuel = ca.reduce((a,b)=>a+b,0) / (months/12)
  const chargesAnnuel = [...achats, ...charges_fixes, ...dotations, ...interets].reduce((a,b)=>a+b,0) / (months/12)
  const seuil = chargesAnnuel>0 && caAnnuel>0 ? chargesAnnuel : 0

  const alerts: FinancialResult['alerts'] = []
  balance.forEach((b,i)=>{
    if(Math.abs(b.total_actif-b.total_passif)>100) alerts.push({type:'error',message:`Le bilan n'est pas équilibré au mois ${i+1}. Écart ${Math.round(b.total_actif-b.total_passif)} FCFA. Vérifiez le financement.`,month:`M${i+1}`})
    if(b.tresorerie<0) alerts.push({type:'error',message:`La trésorerie devient négative au mois ${i+1}. Envisagez un apport supplémentaire ou un crédit de trésorerie.`,month:`M${i+1}`})
  })
  if((financings.reduce((s,f)=>s+f.amount,0)>0) && (balance[balance.length-1].dettes_fin / balance[balance.length-1].total_passif >0.7)){
    alerts.push({type:'warning',message:`Le taux d'endettement dépasse 70%.`})
  }

  return {
    months: Array.from({length:months},(_,i)=>`M${i+1}`),
    income, balance, treasury,
    financing_plan: treasury.map(t=>({ besoins: totalInvest, ressources: financings.reduce((s,f)=>s+f.amount,0), solde: t.cumul })),
    kpis: { van, tri, delai_recup: delaiRecup>=0?delaiRecup:months, seuil_rentabilite:seuil, dscr:1.5, marge_nette: income.reduce((s,i)=>s+i.rn,0)/Math.max(1,ca.reduce((a,b)=>a+b,0)) },
    alerts
  }
}
