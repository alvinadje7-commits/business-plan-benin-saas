// ============================================================
// Immobilier — LOGEMENTS (vente étalée sur la durée du programme)
// ============================================================
import type { ProductionModel, CostLine } from './types';
import { num } from './types';

export const logementsModel: ProductionModel = {
  computeMonthlyRevenue(ctx) {
    const nMonths = ctx.durationYears * 12;
    const nbLogements = num(ctx, 'nbLogements', 20);
    const prixUnitaire = num(ctx, 'prixUnitaireLogement', 25000000);
    const dureeProg = Math.max(1, Math.round(num(ctx, 'dureeProgramme', 24)));
    const caTotal = nbLogements * prixUnitaire;
    const venduParMois = caTotal / dureeProg;
    return Array.from({ length: nMonths }, (_, i) => (i < dureeProg ? venduParMois : 0));
  },
  computeMonthlyVariableCosts(ctx): CostLine[] {
    const nMonths = ctx.durationYears * 12;
    const nbLogements = num(ctx, 'nbLogements', 20);
    const coutConstructionLogement = num(ctx, 'coutConstructionLogement', 15000000);
    const coutTerrain = num(ctx, 'coutTerrainTotal', 50000000);
    const coutVRD = num(ctx, 'coutVRD', 30000000);
    const dureeProg = Math.max(1, Math.round(num(ctx, 'dureeProgramme', 24)));
    const coutTotal = nbLogements * coutConstructionLogement + coutTerrain + coutVRD;
    const coutParMois = coutTotal / dureeProg;
    return [
      {
        key: 'construction',
        label: 'Construction + VRD + terrain (logements)',
        values: Array.from({ length: nMonths }, (_, i) => (i < dureeProg ? coutParMois : 0)),
      },
    ];
  },
  computeMonthlyQuantities(ctx) {
    const nMonths = ctx.durationYears * 12;
    const nbLogements = num(ctx, 'nbLogements', 20);
    const dureeProg = Math.max(1, Math.round(num(ctx, 'dureeProgramme', 24)));
    const vendusParMois = nbLogements / dureeProg;
    return {
      'Logements vendus': Array.from({ length: nMonths }, (_, i) => (i < dureeProg ? vendusParMois : 0)),
    };
  },
  getTechnicalSheet(ctx) {
    const nbLogements = num(ctx, 'nbLogements', 20);
    const prixUnitaire = num(ctx, 'prixUnitaireLogement', 25000000);
    const dureeProg = Math.max(1, Math.round(num(ctx, 'dureeProgramme', 24)));
    const surface = num(ctx, 'surfaceMoyenne', 100);
    return [
      { label: 'Nombre de logements', value: String(nbLogements) },
      { label: 'Surface moyenne', value: surface + ' m²' },
      { label: 'Prix vente / logement', value: Math.round(prixUnitaire).toLocaleString('fr-FR') + ' FCFA' },
      { label: 'Durée du programme', value: dureeProg + ' mois' },
    ];
  },
  getSectorKPIs(ctx) {
    const nbLogements = num(ctx, 'nbLogements', 20);
    const prixUnitaire = num(ctx, 'prixUnitaireLogement', 25000000);
    const caTotal = nbLogements * prixUnitaire;
    const coutConstruction = num(ctx, 'coutConstructionLogement', 15000000);
    const coutTerrain = num(ctx, 'coutTerrainTotal', 50000000);
    const coutVRD = num(ctx, 'coutVRD', 30000000);
    const coutTotal = nbLogements * coutConstruction + coutTerrain + coutVRD;
    const margeBrutePct = caTotal > 0 ? ((caTotal - coutTotal) / caTotal) * 100 : 0;
    return [
      { label: 'Marge brute', value: margeBrutePct.toFixed(1) + ' %', unit: '%' },
      { label: 'CA programme', value: Math.round(caTotal), unit: 'FCFA' },
      { label: 'Coût total', value: Math.round(coutTotal), unit: 'FCFA' },
      { label: 'Marge brute (FCFA)', value: Math.round(caTotal - coutTotal), unit: 'FCFA' },
    ];
  },
};
