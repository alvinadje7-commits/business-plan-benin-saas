// ============================================================
// Immobilier — BUREAUX (loyers récurrents sur toute la durée)
// ============================================================
import type { ProductionModel, CostLine } from './types';
import { num } from './types';

export const bureauxModel: ProductionModel = {
  computeMonthlyRevenue(ctx) {
    const nMonths = ctx.durationYears * 12;
    const nbBureaux = num(ctx, 'nbBureaux', 10);
    const surface = num(ctx, 'surfaceBureauMoyenne', 60);
    const loyerM2 = num(ctx, 'loyerM2Mois', 8000);
    const tauxOccupation = num(ctx, 'tauxOccupation', 75) / 100;
    const surfaceLouee = nbBureaux * surface * tauxOccupation;
    const loyerMensuel = surfaceLouee * loyerM2;
    return new Array(nMonths).fill(loyerMensuel);
  },
  computeMonthlyVariableCosts(ctx): CostLine[] {
    const nMonths = ctx.durationYears * 12;
    const revenue = this.computeMonthlyRevenue(ctx);
    const taux = 0.05;
    return [
      {
        key: 'maintenance',
        label: 'Maintenance immeuble (5% CA)',
        values: revenue.map((r) => r * taux),
      },
    ];
  },
  computeMonthlyQuantities(ctx) {
    const nMonths = ctx.durationYears * 12;
    const nbBureaux = num(ctx, 'nbBureaux', 10);
    const surface = num(ctx, 'surfaceBureauMoyenne', 60);
    const tauxOccupation = num(ctx, 'tauxOccupation', 75) / 100;
    const surfaceLouee = nbBureaux * surface * tauxOccupation;
    return { 'Surface louée (m²)': new Array(nMonths).fill(surfaceLouee) };
  },
  getTechnicalSheet(ctx) {
    const nbBureaux = num(ctx, 'nbBureaux', 10);
    const surface = num(ctx, 'surfaceBureauMoyenne', 60);
    const loyerM2 = num(ctx, 'loyerM2Mois', 8000);
    const tauxOccupation = num(ctx, 'tauxOccupation', 75);
    return [
      { label: 'Nombre de bureaux', value: String(nbBureaux) },
      { label: 'Surface moyenne', value: surface + ' m²' },
      { label: 'Loyer / m² / mois', value: Math.round(loyerM2).toLocaleString('fr-FR') + ' FCFA' },
      { label: "Taux d'occupation", value: tauxOccupation + ' %' },
    ];
  },
  getSectorKPIs(ctx) {
    const nbBureaux = num(ctx, 'nbBureaux', 10);
    const surface = num(ctx, 'surfaceBureauMoyenne', 60);
    const loyerM2 = num(ctx, 'loyerM2Mois', 8000);
    const tauxOcc = num(ctx, 'tauxOccupation', 75);
    const coutM2 = num(ctx, 'coutConstructionBureauM2', 180000);
    const coutTerrain = num(ctx, 'coutTerrainTotal', 50000000);
    const surfaceTotale = nbBureaux * surface;
    const loyerMensuel = surfaceTotale * (tauxOcc / 100) * loyerM2;
    const invest = surfaceTotale * coutM2 + coutTerrain;
    const rendementBrut = invest > 0 ? ((loyerMensuel * 12) / invest) * 100 : 0;
    return [
      { label: 'Rendement brut', value: rendementBrut.toFixed(1) + ' %', unit: '%' },
      { label: "Taux d'occupation", value: tauxOcc + ' %', unit: '%' },
      { label: 'Loyer mensuel', value: Math.round(loyerMensuel), unit: 'FCFA' },
      { label: 'Surface totale', value: Math.round(surfaceTotale), unit: 'm²' },
    ];
  },
};
