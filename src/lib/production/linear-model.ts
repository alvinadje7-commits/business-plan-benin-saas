// Pattern B — Linéaire mensuel (Commerce, Import-Export, Transport)
import type { ProductionModel, CostLine } from './types';
import { num } from './types';

export const linearModel: ProductionModel = {
  computeMonthlyRevenue(ctx) {
    const totalMonths = ctx.durationYears * 12;
    const prix = num(ctx, 'prixVente', 0);
    const qty = num(ctx, 'quantiteMensuelle', 0);
    return new Array(totalMonths).fill(prix * qty);
  },
  computeMonthlyVariableCosts(ctx): CostLine[] {
    const totalMonths = ctx.durationYears * 12;
    const cout = num(ctx, 'coutUnitaire', 0);
    const qty = num(ctx, 'quantiteMensuelle', 0);
    return [{ key: 'achats', label: 'Achats de marchandises', values: new Array(totalMonths).fill(cout * qty) }];
  },
  computeMonthlyQuantities(ctx) {
    const totalMonths = ctx.durationYears * 12;
    const qty = num(ctx, 'quantiteMensuelle', 0);
    return { 'Quantité vendue': new Array(totalMonths).fill(qty) };
  },
  getTechnicalSheet(ctx) {
    return [
      { label: 'Prix unitaire',      value: `${num(ctx, 'prixVente', 0)} FCFA` },
      { label: 'Quantité mensuelle', value: `${num(ctx, 'quantiteMensuelle', 0)}` },
      { label: 'Coût unitaire',      value: `${num(ctx, 'coutUnitaire', 0)} FCFA` },
    ];
  },
  getSectorKPIs(ctx) {
    const prix = num(ctx, 'prixVente', 0);
    const qty = num(ctx, 'quantiteMensuelle', 0);
    const cout = num(ctx, 'coutUnitaire', 0);
    return [
      { label: 'CA mensuel',    value: Math.round(prix * qty), unit: 'FCFA' },
      { label: 'Marge unitaire', value: Math.round(prix - cout), unit: 'FCFA' },
    ];
  },
};
