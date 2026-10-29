// Pattern D — Projet / chantier (BTP)
import type { ProductionModel, CostLine } from './types';
import { num } from './types';

export const projectModel: ProductionModel = {
  computeMonthlyRevenue(ctx) {
    const totalMonths = ctx.durationYears * 12;
    const nbChantiers = num(ctx, 'nbChantiers', 1);
    const prixMoyen = num(ctx, 'prixMoyenChantier', 0);
    const dureeChantier = Math.max(1, Math.round(num(ctx, 'dureeMoyenneChantierMois', 12)));
    // Facturation linéaire répartie sur la durée du chantier
    const perMonth = (prixMoyen / dureeChantier) * nbChantiers;
    return new Array(totalMonths).fill(perMonth);
  },
  computeMonthlyVariableCosts(ctx): CostLine[] {
    const totalMonths = ctx.durationYears * 12;
    const nbChantiers = num(ctx, 'nbChantiers', 1);
    const prixMoyen = num(ctx, 'prixMoyenChantier', 0);
    const marge = num(ctx, 'tauxMargeChantier', 0.20);
    const dureeChantier = Math.max(1, Math.round(num(ctx, 'dureeMoyenneChantierMois', 12)));
    const perMonth = ((prixMoyen * (1 - marge)) / dureeChantier) * nbChantiers;
    return [{ key: 'chantiers', label: 'Matériaux & sous-traitance', values: new Array(totalMonths).fill(perMonth) }];
  },
  computeMonthlyQuantities(ctx) {
    const totalMonths = ctx.durationYears * 12;
    const nbChantiers = num(ctx, 'nbChantiers', 1);
    return { 'Chantiers actifs': new Array(totalMonths).fill(nbChantiers) };
  },
  getTechnicalSheet(ctx) {
    return [
      { label: 'Nombre de chantiers',       value: `${num(ctx, 'nbChantiers', 1)}` },
      { label: 'Prix moyen chantier',       value: `${num(ctx, 'prixMoyenChantier', 0)} FCFA` },
      { label: 'Durée moyenne chantier',    value: `${num(ctx, 'dureeMoyenneChantierMois', 12)} mois` },
      { label: 'Taux de marge',             value: `${(num(ctx, 'tauxMargeChantier', 0.20) * 100).toFixed(1)} %` },
    ];
  },
  getSectorKPIs(ctx) {
    const nb = num(ctx, 'nbChantiers', 1);
    const prix = num(ctx, 'prixMoyenChantier', 0);
    return [
      { label: 'CA par chantier',    value: Math.round(prix), unit: 'FCFA' },
      { label: 'CA total (1 cycle)', value: Math.round(prix * nb), unit: 'FCFA' },
    ];
  },
};
