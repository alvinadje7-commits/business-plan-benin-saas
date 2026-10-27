
export type FieldType = 'number'|'percentage'|'currency'|'text'|'select'|'boolean'|'date'
export interface AssumptionField {
  key: string
  label: string
  type: FieldType
  unit?: string
  default?: any
  required?: boolean
  min?: number
  max?: number
  options?: {label:string,value:string}[]
  help?: string
  depends_on?: string
  formula?: string
}
export interface RevenueRule { key:string; label:string; formula:string; unit?:string }
export interface CostRule { key:string; label:string; formula:string; type:'variable'|'fixed' }
export interface SectorKPI { key:string; label:string; formula:string; unit:string }
export interface SectorDefinition {
  sector_code: string
  sector_name: string
  description: string
  currency: string
  production_models: string[]
  assumption_fields: AssumptionField[]
  revenue_rules: RevenueRule[]
  cost_rules: CostRule[]
  kpis: SectorKPI[]
  default_investments: {key:string,label:string,category:string,duration_months:number}[]
  risks: {key:string,label:string,impact:'low'|'medium'|'high'}[]
  document_sections: string[]
  charts: string[]
}
