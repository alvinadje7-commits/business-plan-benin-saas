// ============================================================
// Immobilier — HÔTEL (hébergement + resto + piscine + salle réunion)
// ============================================================
import type { ProductionModel, CostLine } from './types';
import { num } from './types';

export const hotelModel: ProductionModel = {
  computeMonthlyRevenue(ctx) {
    const nMonths = ctx.durationYears * 12;
    const nbChambres = num(ctx, 'nbChambres', 30);
    const prixNuitee = num(ctx, 'prixNuiteeMoyen', 35000);
    const tauxOcc = num(ctx, 'tauxOccupationMoyen', 65) / 100;
    const avecResto = num(ctx, 'avecRestaurant', 1) === 1;
    const avecPiscine = num(ctx, 'avecPiscine', 1) === 1;
    const avecSalle = num(ctx, 'avecSalleReunion', 0) === 1;
    const nuits = nbChambres * 30 * tauxOcc;
    const caHeb = nuits * prixNuitee;
    const caResto = avecResto ? num(ctx, 'nbCouvertsMoyen', 60) * 30 * num(ctx, 'ticketMoyenRestaurant', 8000) : 0;
    const caPiscine = avecPiscine ? num(ctx, 'entreesPiscineJour', 20) * 30 * num(ctx, 'prixEntreePiscine', 3000) : 0;
    const caSalle = avecSalle ? num(ctx, 'nbSallesReunion', 2) * 30 * 0.4 * num(ctx, 'tarifJourSalleReunion', 150000) : 0;
    const total = caHeb + caResto + caPiscine + caSalle;
    return new Array(nMonths).fill(total);
  },
  computeMonthlyVariableCosts(ctx): CostLine[] {
    const nMonths = ctx.durationYears * 12;
    const nbChambres = num(ctx, 'nbChambres', 30);
    const tauxOcc = num(ctx, 'tauxOccupationMoyen', 65) / 100;
    const nuits = nbChambres * 30 * tauxOcc;
    const coutExploit = nuits * num(ctx, 'coutExploitationChambreNuit', 8000);
    const avecResto = num(ctx, 'avecRestaurant', 1) === 1;
    const caResto = avecResto ? num(ctx, 'nbCouvertsMoyen', 60) * 30 * num(ctx, 'ticketMoyenRestaurant', 8000) : 0;
    const coutMatiereResto = caResto * (num(ctx, 'coutMatiereRestaurantPct', 35) / 100);
    return [
      { key: 'exploitHeb', label: "Exploitation hébergement", values: new Array(nMonths).fill(coutExploit) },
      { key: 'matiereResto', label: 'Matière restaurant', values: new Array(nMonths).fill(coutMatiereResto) },
    ];
  },
  computeMonthlyQuantities(ctx) {
    const nMonths = ctx.durationYears * 12;
    const nbChambres = num(ctx, 'nbChambres', 30);
    const tauxOcc = num(ctx, 'tauxOccupationMoyen', 65) / 100;
    const nuits = nbChambres * 30 * tauxOcc;
    return {
      'Nuits vendues / mois': new Array(nMonths).fill(nuits),
    };
  },
  getTechnicalSheet(ctx) {
    const nbChambres = num(ctx, 'nbChambres', 30);
    const prixNuitee = num(ctx, 'prixNuiteeMoyen', 35000);
    const tauxOcc = num(ctx, 'tauxOccupationMoyen', 65);
    const revPar = prixNuitee * (tauxOcc / 100);
    return [
      { label: 'Nombre de chambres', value: String(nbChambres) },
      { label: 'Prix moyen / nuitée', value: Math.round(prixNuitee).toLocaleString('fr-FR') + ' FCFA' },
      { label: "Taux d'occupation", value: tauxOcc + ' %' },
      { label: 'RevPAR', value: Math.round(revPar).toLocaleString('fr-FR') + ' FCFA' },
    ];
  },
  getSectorKPIs(ctx) {
    const nbChambres = num(ctx, 'nbChambres', 30);
    const prixNuitee = num(ctx, 'prixNuiteeMoyen', 35000);
    const tauxOcc = num(ctx, 'tauxOccupationMoyen', 65);
    const revPar = prixNuitee * (tauxOcc / 100);
    const avecResto = num(ctx, 'avecRestaurant', 1) === 1;
    const avecPiscine = num(ctx, 'avecPiscine', 1) === 1;
    const avecSalle = num(ctx, 'avecSalleReunion', 0) === 1;
    const caHebMois = nbChambres * 30 * (tauxOcc / 100) * prixNuitee;
    const caRestoMois = avecResto ? num(ctx, 'nbCouvertsMoyen', 60) * 30 * num(ctx, 'ticketMoyenRestaurant', 8000) : 0;
    const caPiscineMois = avecPiscine ? num(ctx, 'entreesPiscineJour', 20) * 30 * num(ctx, 'prixEntreePiscine', 3000) : 0;
    const caSalleMois = avecSalle ? num(ctx, 'nbSallesReunion', 2) * 30 * 0.4 * num(ctx, 'tarifJourSalleReunion', 150000) : 0;
    const caTotal = caHebMois + caRestoMois + caPiscineMois + caSalleMois;
    const partAnnexes = caTotal > 0 ? ((caTotal - caHebMois) / caTotal) * 100 : 0;
    return [
      { label: 'RevPAR', value: Math.round(revPar), unit: 'FCFA' },
      { label: "Taux d'occupation", value: tauxOcc + ' %', unit: '%' },
      { label: 'CA mensuel total', value: Math.round(caTotal), unit: 'FCFA' },
      { label: 'Part annexes', value: partAnnexes.toFixed(0) + ' %', unit: '%' },
    ];
  },
};
