
export interface Project {
  id:string; organization_id:string; name:string; sector_code:string; sub_sector:string;
  duration_months:number; start_date:string; currency:string; objective:'banque'|'investisseur'|'subvention'|'interne';
  status:'brouillon'|'complet'|'a_verifier'|'valide'|'partage';
  created_at:string; updated_at:string
}
export interface InvestmentItem {
  id:string; label:string; category:string; amount:number; vat_rate:number;
  depreciation_duration:number; method:'lineaire'|'degressif'; start_date:string; residual_value:number
}
export interface FinancingSource {
  id:string; type:'capital'|'cca'|'emprunt'|'microfinance'|'subvention'|'leasing'|'fournisseur';
  amount:number; interest_rate:number; duration_months:number; defer_months:number; frequency:'mensuelle'|'trimestrielle'
}
export interface FinancialResult {
  months: string[]
  income: { ca:number; achats:number; marge_brute:number; ebe:number; re:number; rf:number; rai:number; is:number; rn:number; caf:number }[]
  balance: { actif_immobilise_net:number; stocks:number; creances:number; tresorerie:number; capitaux_propres:number; dettes_fin:number; dettes_fourn:number; dettes_fisc:number; total_actif:number; total_passif:number }[]
  treasury: { encaissements:number; decaissements:number; solde:number; cumul:number }[]
  financing_plan: { besoins:number; ressources:number; solde:number }[]
  kpis: { van:number; tri:number; delai_recup:number; seuil_rentabilite:number; dscr:number; marge_nette:number }
  alerts: { type:'error'|'warning'; message:string; month?:string }[]
}
