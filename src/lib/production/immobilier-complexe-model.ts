// ============================================================
// Immobilier — COMPLEXE (dispatch sur les 7 activateurs)
// ============================================================
import type { ProductionModel, CostLine } from './types';
import { num } from './types';

export const complexeModel: ProductionModel = {
  computeMonthlyRevenue(ctx) {
    const nMonths = ctx.durationYears * 12;
    const dureeProg = Math.max(1, Math.round(num(ctx, 'dureeProgramme', 24)));

    // Logements (vente étalée)
    const nbLogements = num(ctx, 'nbLogements', 15);
    const prixLog = num(ctx, 'prixUnitaireLogement', 22000000);
    const caLogTotal = num(ctx, 'activeLogements', 1) === 1 ? nbLogements * prixLog : 0;
    const caLogParMois = caLogTotal / dureeProg;

    // Bureaux (loyers récurrents)
    const nbBureaux = num(ctx, 'nbBureaux', 6);
    const surfBur = num(ctx, 'surfaceBureauMoyenne', 50);
    const loyerM2 = num(ctx, 'loyerM2MoisBureau', 8000);
    const occBur = num(ctx, 'tauxOccupationBureau', 75) / 100;
    const caBurMois = num(ctx, 'activeBureaux', 1) === 1 ? nbBureaux * surfBur * occBur * loyerM2 : 0;

    // Hôtel
    const nbChambres = num(ctx, 'nbChambres', 30);
    const prixNuit = num(ctx, 'prixNuiteeMoyen', 35000);
    const occHotel = num(ctx, 'tauxOccupationMoyen', 65) / 100;
    const caHotelMois = num(ctx, 'activeHotel', 0) === 1 ? nbChambres * 30 * occHotel * prixNuit : 0;

    // Restaurant
    const caRestoMois = num(ctx, 'activeRestaurant', 0) === 1
      ? num(ctx, 'nbCouvertsMoyen', 60) * 30 * num(ctx, 'ticketMoyenRestaurant', 8000)
      : 0;

    // Piscine
    const caPiscMois = num(ctx, 'activePiscine', 0) === 1
      ? num(ctx, 'entreesPiscineJour', 20) * 30 * num(ctx, 'prixEntreePiscine', 3000)
      : 0;

    // Salle de fête (forfait événementiel)
    const caFeteMois = num(ctx, 'activeSalleFete', 0) === 1
      ? num(ctx, 'nbEvenementsMois', 3) * num(ctx, 'prixMoyenEvenement', 800000)
      : 0;

    // Salle de réunion
    const caReunionMois = num(ctx, 'activeSalleReunion', 0) === 1
      ? num(ctx, 'nbSallesReunion', 2) * 30 * 0.4 * (num(ctx, 'tauxOccupationSalleReunion', 40) / 100) * num(ctx, 'tarifJourSalleReunion', 150000)
      : 0;

    return Array.from({ length: nMonths }, (_, i) => {
      const logement = i < dureeProg ? caLogParMois : 0;
      return logement + caBurMois + caHotelMois + caRestoMois + caPiscMois + caFeteMois + caReunionMois;
    });
  },
  computeMonthlyVariableCosts(ctx): CostLine[] {
    const nMonths = ctx.durationYears * 12;
    const dureeProg = Math.max(1, Math.round(num(ctx, 'dureeProgramme', 24)));

    // Construction (logements + bureaux + hôtel) répartie sur dureeProg
    const nbLog = num(ctx, 'nbLogements', 15);
    const coutLog = num(ctx, 'coutConstructionLogement', 13000000);
    const surfBur = num(ctx, 'nbBureaux', 6) * num(ctx, 'surfaceBureauMoyenne', 50);
    const coutBurM2 = num(ctx, 'coutConstructionBureauM2', 180000);
    const nbCh = num(ctx, 'nbChambres', 30);
    const coutCh = num(ctx, 'coutConstructionChambre', 12000000);

    const coutConstruction =
      (num(ctx, 'activeLogements', 1) === 1 ? nbLog * coutLog : 0) +
      (num(ctx, 'activeBureaux', 1) === 1 ? surfBur * coutBurM2 : 0) +
      (num(ctx, 'activeHotel', 0) === 1 ? nbCh * coutCh : 0);

    const coutParMois = coutConstruction / dureeProg;
    const constructionValues = Array.from({ length: nMonths }, (_, i) => (i < dureeProg ? coutParMois : 0));

    // Exploitation hôtel + matière restaurant (récurrents)
    const nbChambres = num(ctx, 'nbChambres', 30);
    const occHotel = num(ctx, 'tauxOccupationMoyen', 65) / 100;
    const caHotelMois = num(ctx, 'activeHotel', 0) === 1 ? nbChambres * 30 * occHotel * num(ctx, 'prixNuiteeMoyen', 35000) : 0;
    const coutExploitHotel = num(ctx, 'activeHotel', 0) === 1 ? caHotelMois * 0.20 : 0;

    const caRestoMois = num(ctx, 'activeRestaurant', 0) === 1
      ? num(ctx, 'nbCouvertsMoyen', 60) * 30 * num(ctx, 'ticketMoyenRestaurant', 8000)
      : 0;
    const coutMatiereResto = caRestoMois * (num(ctx, 'coutMatiereRestaurantPct', 35) / 100);

    return [
      { key: 'construction', label: 'Construction (tous composants)', values: constructionValues },
      { key: 'exploitHotel', label: 'Exploitation hôtel', values: new Array(nMonths).fill(coutExploitHotel) },
      { key: 'matiereResto', label: 'Matière restaurant', values: new Array(nMonths).fill(coutMatiereResto) },
    ];
  },
  computeMonthlyQuantities(ctx) {
    const nMonths = ctx.durationYears * 12;
    const dureeProg = Math.max(1, Math.round(num(ctx, 'dureeProgramme', 24)));
    const result: Record<string, number[]> = {};

    if (num(ctx, 'activeLogements', 1) === 1) {
      const vendusParMois = num(ctx, 'nbLogements', 15) / dureeProg;
      result['Logements vendus'] = Array.from({ length: nMonths }, (_, i) => (i < dureeProg ? vendusParMois : 0));
    }
    if (num(ctx, 'activeBureaux', 1) === 1) {
      const surf = num(ctx, 'nbBureaux', 6) * num(ctx, 'surfaceBureauMoyenne', 50) * (num(ctx, 'tauxOccupationBureau', 75) / 100);
      result['Surface bureaux louée (m²)'] = new Array(nMonths).fill(surf);
    }
    if (num(ctx, 'activeHotel', 0) === 1) {
      const nuits = num(ctx, 'nbChambres', 30) * 30 * (num(ctx, 'tauxOccupationMoyen', 65) / 100);
      result['Nuits vendues / mois'] = new Array(nMonths).fill(nuits);
    }

    return result;
  },
  getTechnicalSheet(ctx) {
    const actifs: string[] = [];
    if (num(ctx, 'activeLogements', 1) === 1) actifs.push('Logements');
    if (num(ctx, 'activeBureaux', 1) === 1) actifs.push('Bureaux');
    if (num(ctx, 'activeHotel', 0) === 1) actifs.push('Hôtel');
    if (num(ctx, 'activeRestaurant', 0) === 1) actifs.push('Restaurant');
    if (num(ctx, 'activePiscine', 0) === 1) actifs.push('Piscine');
    if (num(ctx, 'activeSalleFete', 0) === 1) actifs.push('Salle de fête');
    if (num(ctx, 'activeSalleReunion', 0) === 1) actifs.push('Salle de réunion');

    return [
      { label: 'Composants actifs', value: String(actifs.length) + ' / 7' },
      { label: 'Composants', value: actifs.join(', ') || 'Aucun' },
      { label: 'Durée du programme', value: Math.round(num(ctx, 'dureeProgramme', 24)) + ' mois' },
    ];
  },
  getSectorKPIs(ctx) {
    const revenue = this.computeMonthlyRevenue(ctx);
    const caAnnuel = revenue.slice(0, 12).reduce((a, b) => a + b, 0);
    const caTotal = revenue.reduce((a, b) => a + b, 0);
    const activeCount = ['activeLogements', 'activeBureaux', 'activeHotel', 'activeRestaurant', 'activePiscine', 'activeSalleFete', 'activeSalleReunion']
      .filter((k) => num(ctx, k, 0) === 1).length;
    return [
      { label: 'Composants actifs', value: String(activeCount) + ' / 7', unit: '' },
      { label: 'CA annuel (moy.)', value: Math.round(caAnnuel), unit: 'FCFA' },
      { label: 'CA cumulé (durée)', value: Math.round(caTotal), unit: 'FCFA' },
      { label: 'CA mensuel moyen', value: Math.round(caTotal / revenue.length), unit: 'FCFA' },
    ];
  },
};
