// Pattern E — TJM / capacité (Services)
import type { ProductionModel, CostLine } from './types';
import { num } from './types';

export const tjmModel: ProductionModel = {
  computeMonthlyRevenue(ctx) {
    const totalMonths = ctx.durationYears * 12;
    const tjm = num(ctx, 'tjm', 0);
    const jours = num(ctx, 'joursFacturablesMois', 20);
    const occ = num(ctx, 'tauxOccupation', 0.8);
    return new Array(totalMonths).fill(tjm * jours * occ);
  },
  computeMonthlyVariableCosts(ctx): CostLine[] {
    const totalMonths = ctx.durationYears * 12;
    const coutJour = num(ctx, 'coutJourConsultant', 0);
    const jours = num(ctx, 'joursFacturablesMois', 20);
    const occ = num(ctx, 'tauxOccupation', 0.8);
    return [{ key: 'consultants', label: 'Coût consultants', values: new Array(totalMonths).fill(coutJour * jours * occ) }];
  },
  computeMonthlyQuantities(ctx) {
    const totalMonths = ctx.durationYears * 12;
    const jours = num(ctx, 'joursFacturablesMois', 20);
    const occ = num(ctx, 'tauxOccupation', 0.8);
    return { 'Jours facturés': new Array(totalMonths).fill(jours * occ) };
  },
  getTechnicalSheet(ctx) {
    return [
      { label: 'TJM',                    value: `${num(ctx, 'tjm', 0)} FCFA` },
      { label: 'Jours facturables/mois', value: `${num(ctx, 'joursFacturablesMois', 20)}` },
      { label: 'Taux d\'occupation',      value: `${(num(ctx, 'tauxOccupation', 0.8) * 100).toFixed(0)} %` },
    ];
  },
  getSectorKPIs(ctx) {
    const tjm = num(ctx, 'tjm', 0);
    const jours = num(ctx, 'joursFacturablesMois', 20);
    const occ = num(ctx, 'tauxOccupation', 0.8);
    return [
      { label: 'CA mensuel',  value: Math.round(tjm * jours * occ), unit: 'FCFA' },
      { label: 'CA annuel',   value: Math.round(tjm * jours * occ * 12), unit: 'FCFA' },
    ];
  },
};
