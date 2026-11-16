// ============================================================
// Immobilier — LOGEMENTS (loyers récurrents sur toute la durée)
// ============================================================
import type { ProductionModel, CostLine } from './types';
import { num } from './types';

export const logementsModel: ProductionModel = {
  computeMonthlyRevenue(ctx) {
    const nMonths = ctx.durationYears * 12;
    const nbLogements = num(ctx, 'nbLogements', 20);
    const surfaceMoy = num(ctx, 'surfaceMoyenne', 100);
    const loyerM2 = num(ctx, 'loyerM2MoisLogement', 5000);
    const tauxOcc = num(ctx, 'tauxOccupationLogement', 85) / 100;
    const loyerMensuel = nbLogements * surfaceMoy * tauxOcc * loyerM2;
    return new Array(nMonths).fill(loyerMensuel);
  },
  computeMonthlyVariableCosts(ctx): CostLine[] {
    const nMonths = ctx.durationYears * 12;
    const revenue = this.computeMonthlyRevenue(ctx);
    return [
      {
        key: 'maintenance',
        label: 'Maintenance immeuble (5% CA)',
        values: revenue.map((r) => r * 0.05),
      },
    ];
  },
  computeMonthlyQuantities(ctx) {
    const nMonths = ctx.durationYears * 12;
    const nbLogements = num(ctx, 'nbLogements', 20);
    const surfaceMoy = num(ctx, 'surfaceMoyenne', 100);
    const tauxOcc = num(ctx, 'tauxOccupationLogement', 85) / 100;
    const surfaceLouee = nbLogements * surfaceMoy * tauxOcc;
    return { 'Surface louée (m²)': new Array(nMonths).fill(surfaceLouee) };
  },
  getTechnicalSheet(ctx) {
    const nbLogements = num(ctx, 'nbLogements', 20);
    const surfaceMoy = num(ctx, 'surfaceMoyenne', 100);
    const loyerM2 = num(ctx, 'loyerM2MoisLogement', 5000);
    const tauxOcc = num(ctx, 'tauxOccupationLogement', 85);
    return [
      { label: 'Nombre de logements', value: String(nbLogements) },
      { label: 'Surface moyenne', value: surfaceMoy + ' m²' },
      { label: 'Loyer / m² / mois', value: Math.round(loyerM2).toLocaleString('fr-FR') + ' FCFA' },
      { label: "Taux d'occupation", value: tauxOcc + ' %' },
    ];
  },
  getSectorKPIs(ctx) {
    const nbLogements = num(ctx, 'nbLogements', 20);
    const surfaceMoy = num(ctx, 'surfaceMoyenne', 100);
    const loyerM2 = num(ctx, 'loyerM2MoisLogement', 5000);
    const tauxOcc = num(ctx, 'tauxOccupationLogement', 85);
    const coutConstruction = num(ctx, 'coutConstructionLogement', 15000000);
    const coutTerrain = num(ctx, 'coutTerrainTotal', 50000000);
    const coutVRD = num(ctx, 'coutVRD', 30000000);
    const coutTotal = nbLogements * coutConstruction + coutTerrain + coutVRD;
    const surfaceLouee = nbLogements * surfaceMoy * (tauxOcc / 100);
    const caAnnuel = surfaceLouee * loyerM2 * 12;
    const rendementBrut = coutTotal > 0 ? (caAnnuel / coutTotal) * 100 : 0;
    return [
      { label: 'Rendement brut', value: rendementBrut.toFixed(1) + ' %', unit: '%' },
      { label: 'Loyers annuels', value: Math.round(caAnnuel), unit: 'FCFA' },
      { label: 'Loyer mensuel', value: Math.round(surfaceLouee * loyerM2), unit: 'FCFA' },
      { label: 'Surface louée', value: Math.round(surfaceLouee), unit: 'm²' },
    ];
  },
};
