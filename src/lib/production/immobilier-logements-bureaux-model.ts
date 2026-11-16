// ============================================================
// Immobilier — LOGEMENTS + BUREAUX (ventes + loyers récurrents)
// ============================================================
import type { ProductionModel, CostLine } from './types';
import { num } from './types';
import { logementsModel } from './immobilier-logements-model';
import { bureauxModel } from './immobilier-bureaux-model';

export const logementsBureauxModel: ProductionModel = {
  computeMonthlyRevenue(ctx) {
    const log = logementsModel.computeMonthlyRevenue(ctx);
    const bur = bureauxModel.computeMonthlyRevenue(ctx);
    return log.map((v, i) => v + bur[i]);
  },
  computeMonthlyVariableCosts(ctx): CostLine[] {
    const log = logementsModel.computeMonthlyVariableCosts(ctx);
    const bur = bureauxModel.computeMonthlyVariableCosts(ctx);
    return [...log, ...bur];
  },
  computeMonthlyQuantities(ctx) {
    const log = logementsModel.computeMonthlyQuantities(ctx);
    const bur = bureauxModel.computeMonthlyQuantities(ctx);
    return { ...log, ...bur };
  },
  getTechnicalSheet(ctx) {
    return [
      ...logementsModel.getTechnicalSheet(ctx),
      ...bureauxModel.getTechnicalSheet(ctx),
    ];
  },
  getSectorKPIs(ctx) {
    const nMonths = ctx.durationYears * 12;
    const log = logementsModel.computeMonthlyRevenue(ctx).reduce((a, b) => a + b, 0);
    const bur = bureauxModel.computeMonthlyRevenue(ctx).slice(0, 12).reduce((a, b) => a + b, 0);
    const caAnnuelMoyen = (log + bur * ctx.durationYears) / ctx.durationYears;
    const partRecurrent = caAnnuelMoyen > 0 ? (bur / caAnnuelMoyen) * 100 : 0;
    return [
      { label: 'CA logements (total)', value: Math.round(log), unit: 'FCFA' },
      { label: 'Loyers bureaux', value: Math.round(bur), unit: 'FCFA/an' },
      { label: 'Part récurrent', value: partRecurrent.toFixed(0) + ' %', unit: '%' },
      { label: 'CA annuel moyen', value: Math.round(caAnnuelMoyen), unit: 'FCFA' },
    ];
  },
};
