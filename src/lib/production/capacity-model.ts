// Pattern F — Couverts / lots (Restauration, Immobilier)
import type { ProductionModel, CostLine } from './types';
import { num } from './types';

export const capacityModel: ProductionModel = {
  computeMonthlyRevenue(ctx) {
    const totalMonths = ctx.durationYears * 12;
    const couverts = num(ctx, 'couvertsJour', num(ctx, 'lotsVendusMois', 0));
    const prix = num(ctx, 'ticketMoyen', num(ctx, 'prixLot', 0));
    const jours = num(ctx, 'joursOuvertureMois', 26);
    const taux = num(ctx, 'tauxRemplissage', 0.75);
    // Si lotsVendusMois est fourni, on utilise directement
    const monthly = couverts > 1000
      ? couverts * prix  // cas "lots"
      : couverts * jours * taux * prix; // cas "couverts"
    return new Array(totalMonths).fill(monthly);
  },
  computeMonthlyVariableCosts(ctx): CostLine[] {
    const totalMonths = ctx.durationYears * 12;
    const taux = num(ctx, 'tauxCoutMatiere', 0.30);
    const revenue = this.computeMonthlyRevenue(ctx);
    return [{ key: 'matieres', label: 'Matières premières', values: revenue.map((r) => r * taux) }];
  },
  computeMonthlyQuantities(ctx) {
    const totalMonths = ctx.durationYears * 12;
    const couverts = num(ctx, 'couvertsJour', num(ctx, 'lotsVendusMois', 0));
    const jours = num(ctx, 'joursOuvertureMois', 26);
    const taux = num(ctx, 'tauxRemplissage', 0.75);
    const monthly = couverts > 1000 ? couverts : couverts * jours * taux;
    return { 'Volume mensuel': new Array(totalMonths).fill(monthly) };
  },
  getTechnicalSheet(ctx) {
    return [
      { label: 'Volume / jour ou lot',   value: `${num(ctx, 'couvertsJour', num(ctx, 'lotsVendusMois', 0))}` },
      { label: 'Prix moyen',              value: `${num(ctx, 'ticketMoyen', num(ctx, 'prixLot', 0))} FCFA` },
      { label: 'Jours ouvrés / mois',     value: `${num(ctx, 'joursOuvertureMois', 26)}` },
      { label: 'Taux de remplissage',     value: `${(num(ctx, 'tauxRemplissage', 0.75) * 100).toFixed(0)} %` },
    ];
  },
  getSectorKPIs(ctx) {
    const revenue = this.computeMonthlyRevenue(ctx);
    const totalCA = revenue.reduce((s, v) => s + v, 0);
    return [
      { label: 'CA mensuel',  value: Math.round(revenue[0] ?? 0), unit: 'FCFA' },
      { label: 'CA cumulé',   value: Math.round(totalCA),        unit: 'FCFA' },
    ];
  },
};
