// Pattern C — Saisonnier (Agriculture)
import type { ProductionModel, CostLine } from './types';
import { num } from './types';

const DEFAULT_PROFILE = [0.05, 0.05, 0.05, 0.10, 0.15, 0.15, 0.15, 0.10, 0.10, 0.05, 0.03, 0.02];

function normalizeProfile(p: number[]): number[] {
  const s = p.reduce((a, b) => a + b, 0);
  return s > 0 ? p.map((v) => v / s) : DEFAULT_PROFILE;
}

export const seasonalModel: ProductionModel = {
  computeMonthlyRevenue(ctx) {
    const totalMonths = ctx.durationYears * 12;
    const qty = num(ctx, 'quantiteAnnuelle', 0);
    const prix = num(ctx, 'prixVente', 0);
    const profile = normalizeProfile(DEFAULT_PROFILE);
    const out: number[] = [];
    for (let m = 0; m < totalMonths; m++) out.push(qty * profile[m % 12] * prix);
    return out;
  },
  computeMonthlyVariableCosts(ctx): CostLine[] {
    const totalMonths = ctx.durationYears * 12;
    const qty = num(ctx, 'quantiteAnnuelle', 0);
    const cout = num(ctx, 'coutUnitaire', 0);
    const profile = normalizeProfile(DEFAULT_PROFILE);
    const out: number[] = [];
    for (let m = 0; m < totalMonths; m++) out.push(qty * profile[m % 12] * cout);
    return [{ key: 'intrants', label: 'Intrants agricoles', values: out }];
  },
  computeMonthlyQuantities(ctx) {
    const totalMonths = ctx.durationYears * 12;
    const qty = num(ctx, 'quantiteAnnuelle', 0);
    const profile = normalizeProfile(DEFAULT_PROFILE);
    const out: number[] = [];
    for (let m = 0; m < totalMonths; m++) out.push(qty * profile[m % 12]);
    return { 'Quantité récoltée': out };
  },
  getTechnicalSheet(ctx) {
    return [
      { label: 'Quantité annuelle', value: `${num(ctx, 'quantiteAnnuelle', 0)}` },
      { label: 'Prix unitaire',     value: `${num(ctx, 'prixVente', 0)} FCFA` },
      { label: 'Coût unitaire',     value: `${num(ctx, 'coutUnitaire', 0)} FCFA` },
    ];
  },
  getSectorKPIs(ctx) {
    const qty = num(ctx, 'quantiteAnnuelle', 0);
    const prix = num(ctx, 'prixVente', 0);
    const cout = num(ctx, 'coutUnitaire', 0);
    return [
      { label: 'CA annuel',   value: Math.round(qty * prix), unit: 'FCFA' },
      { label: 'Marge annuelle', value: Math.round(qty * (prix - cout)), unit: 'FCFA' },
    ];
  },
};
