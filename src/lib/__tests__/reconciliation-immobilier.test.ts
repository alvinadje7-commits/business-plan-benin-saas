// ============================================================
// Test réconciliation — modèles immobilier (mode locatif)
// ============================================================
import { describe, it, expect } from 'vitest';
import { logementsModel } from '../production/immobilier-logements-model';
import { bureauxModel } from '../production/immobilier-bureaux-model';
import { hotelModel } from '../production/immobilier-hotel-model';
import { logementsBureauxModel } from '../production/immobilier-logements-bureaux-model';
import { complexeModel } from '../production/immobilier-complexe-model';
import type { ProductionContext } from '../production/types';

describe('Immobilier — logements (locatif)', () => {
  it('loyers constants sur toute la durée', () => {
    const ctx: ProductionContext = {
      sectorCode: 'immobilier',
      durationYears: 7,
      sectorValues: {
        nbLogements: 20,
        surfaceMoyenne: 100,
        loyerM2MoisLogement: 5000,
        tauxOccupationLogement: 85,
      },
    };
    const revenue = logementsModel.computeMonthlyRevenue(ctx);
    const attendu = 20 * 100 * 0.85 * 5000;
    expect(revenue[0]).toBeCloseTo(attendu, 0);
    expect(revenue[83]).toBeCloseTo(attendu, 0);
  });

  it('CA total cumulé = loyer mensuel × nb mois', () => {
    const ctx: ProductionContext = {
      sectorCode: 'immobilier',
      durationYears: 7,
      sectorValues: {
        nbLogements: 20,
        surfaceMoyenne: 100,
        loyerM2MoisLogement: 5000,
        tauxOccupationLogement: 85,
      },
    };
    const revenue = logementsModel.computeMonthlyRevenue(ctx);
    const total = revenue.reduce((a, b) => a + b, 0);
    const attenduMensuel = 20 * 100 * 0.85 * 5000;
    expect(total).toBeCloseTo(attenduMensuel * 84, 0);
  });
});

describe('Immobilier — bureaux', () => {
  it('loyers constants sur toute la durée', () => {
    const ctx: ProductionContext = {
      sectorCode: 'immobilier',
      durationYears: 7,
      sectorValues: {
        nbBureaux: 10,
        surfaceBureauMoyenne: 60,
        loyerM2Mois: 8000,
        tauxOccupation: 75,
      },
    };
    const revenue = bureauxModel.computeMonthlyRevenue(ctx);
    const attendu = 10 * 60 * 0.75 * 8000;
    expect(revenue[0]).toBeCloseTo(attendu, 0);
    expect(revenue[83]).toBeCloseTo(attendu, 0);
  });
});

describe('Immobilier — hôtel', () => {
  it('hébergement 65% occupation', () => {
    const ctx: ProductionContext = {
      sectorCode: 'immobilier',
      durationYears: 7,
      sectorValues: {
        nbChambres: 30,
        prixNuiteeMoyen: 35000,
        tauxOccupationMoyen: 65,
        avecRestaurant: 0,
        avecPiscine: 0,
        avecSalleReunion: 0,
      },
    };
    const revenue = hotelModel.computeMonthlyRevenue(ctx);
    const attendu = 30 * 30 * 0.65 * 35000;
    expect(revenue[0]).toBeCloseTo(attendu, 0);
  });

  it('hébergement + resto + piscine', () => {
    const ctx: ProductionContext = {
      sectorCode: 'immobilier',
      durationYears: 7,
      sectorValues: {
        nbChambres: 30,
        prixNuiteeMoyen: 35000,
        tauxOccupationMoyen: 65,
        avecRestaurant: 1,
        nbCouvertsMoyen: 60,
        ticketMoyenRestaurant: 8000,
        avecPiscine: 1,
        entreesPiscineJour: 20,
        prixEntreePiscine: 3000,
        avecSalleReunion: 0,
      },
    };
    const revenue = hotelModel.computeMonthlyRevenue(ctx);
    const heb = 30 * 30 * 0.65 * 35000;
    const resto = 60 * 30 * 8000;
    const pisc = 20 * 30 * 3000;
    expect(revenue[0]).toBeCloseTo(heb + resto + pisc, 0);
  });
});

describe('Immobilier — logements_bureaux', () => {
  it('composition = somme des 2 modèles', () => {
    const ctx: ProductionContext = {
      sectorCode: 'immobilier',
      durationYears: 7,
      sectorValues: {
        nbLogements: 15,
        surfaceMoyenne: 90,
        loyerM2MoisLogement: 5000,
        tauxOccupationLogement: 85,
        nbBureaux: 6,
        surfaceBureauMoyenne: 50,
        loyerM2MoisBureau: 8000,
        tauxOccupationBureau: 75,
      },
    };
    const rev = logementsBureauxModel.computeMonthlyRevenue(ctx);
    const loyerLog = 15 * 90 * 0.85 * 5000;
    const loyerBur = 6 * 50 * 0.75 * 8000;
    expect(rev[0]).toBeCloseTo(loyerLog + loyerBur, 0);
    expect(rev[83]).toBeCloseTo(loyerLog + loyerBur, 0);
  });
});

describe('Immobilier — complexe', () => {
  it('logements seuls = équivalent modèle logements (location)', () => {
    const ctx: ProductionContext = {
      sectorCode: 'immobilier',
      durationYears: 7,
      sectorValues: {
        activeLogements: 1,
        activeBureaux: 0,
        activeHotel: 0,
        activeRestaurant: 0,
        activePiscine: 0,
        activeSalleFete: 0,
        activeSalleReunion: 0,
        nbLogements: 15,
        surfaceMoyenne: 90,
        loyerM2MoisLogement: 5000,
        tauxOccupationLogement: 85,
      },
    };
    const rev = complexeModel.computeMonthlyRevenue(ctx);
    const attendu = 15 * 90 * 0.85 * 5000;
    expect(rev[0]).toBeCloseTo(attendu, 0);
    expect(rev[83]).toBeCloseTo(attendu, 0);
  });

  it('multi-composants = somme des CA actifs', () => {
    const ctx: ProductionContext = {
      sectorCode: 'immobilier',
      durationYears: 7,
      sectorValues: {
        activeLogements: 1,
        activeBureaux: 1,
        activeHotel: 1,
        activeRestaurant: 1,
        activePiscine: 0,
        activeSalleFete: 1,
        activeSalleReunion: 0,
        nbLogements: 15,
        surfaceMoyenne: 90,
        loyerM2MoisLogement: 5000,
        tauxOccupationLogement: 85,
        nbBureaux: 6,
        surfaceBureauMoyenne: 50,
        loyerM2MoisBureau: 8000,
        tauxOccupationBureau: 75,
        nbChambres: 30,
        prixNuiteeMoyen: 35000,
        tauxOccupationMoyen: 65,
        nbCouvertsMoyen: 60,
        ticketMoyenRestaurant: 8000,
        nbEvenementsMois: 3,
        prixMoyenEvenement: 800000,
      },
    };
    const rev = complexeModel.computeMonthlyRevenue(ctx);
    const attenduMois =
      15 * 90 * 0.85 * 5000 +
      6 * 50 * 0.75 * 8000 +
      30 * 30 * 0.65 * 35000 +
      60 * 30 * 8000 +
      3 * 800000;
    expect(rev[0]).toBeCloseTo(attenduMois, 0);
    expect(rev[83]).toBeCloseTo(attenduMois, 0);
  });
});
