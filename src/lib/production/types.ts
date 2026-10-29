// ============================================================
// Interface commune aux 6 patterns de production (A–F)
// Chaque secteur a UN ProductionModel branché dans registry.ts
// ============================================================

export interface ProductionContext {
  sectorCode: string;
  sectorValues: Record<string, number | string>;
  durationYears: number;
}

export interface CostLine {
  key: string;
  label: string;
  values: number[];       // mensuel
}

export type MonthlyQuantities = Record<string, number[]>;

export interface TechnicalSheetLine {
  label: string;
  value: string;
}

export interface SectorKPI {
  label: string;
  value: number | string;
  unit?: string;
  hint?: string;
}

export interface ProductionModel {
  computeMonthlyRevenue(ctx: ProductionContext): number[];
  computeMonthlyVariableCosts(ctx: ProductionContext): CostLine[];
  computeMonthlyQuantities(ctx: ProductionContext): MonthlyQuantities;
  getTechnicalSheet(ctx: ProductionContext): TechnicalSheetLine[];
  getSectorKPIs(ctx: ProductionContext): SectorKPI[];
}

// ---------- Helpers de lecture sectorValues ----------

export function num(ctx: ProductionContext, key: string, fallback: number): number {
  const v = ctx.sectorValues[key];
  if (typeof v === 'number' && isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/\s/g, '').replace(',', '.'));
    if (!isNaN(n)) return n;
  }
  return fallback;
}

export function str(ctx: ProductionContext, key: string, fallback: string): string {
  const v = ctx.sectorValues[key];
  return typeof v === 'string' && v.length ? v : fallback;
}
