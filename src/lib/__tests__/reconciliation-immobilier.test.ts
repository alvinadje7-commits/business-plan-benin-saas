// ============================================================
// Test réconciliation — modèles immobilier
// ============================================================
import { describe, it, expect } from 'vitest';
import { logementsModel } from '../production/immobilier-logements-model';
import { bureauxModel } from '../production/immobilier-bureaux-model';
import { hotelModel } from '../production/immobilier-hotel-model';
import { logementsBureauxModel } from '../production/immobilier-logements-bureaux-model';
import { complexeModel } from '../production/immobilier-complexe-model';
import type { ProductionContext } from '../production/types';

const ctxLogements: ProductionContext = {
  sectorCode: 'immobilier',
  durationYears: 7,
  sectorValues: {
    nbLogements: 20,
    prixUnitaireLogement: 25000000,
    dureeProgramme: 24,
    surfaceMoyenne: 100,
    coutConstructionLogement: 15000000,
    coutTerrainTotal: 50000000,
    coutVRD: 30000000,
  },
};

describe('Immobilier — logements', () => {
  it('CA total cumulé = nbLogements × prixUnitaire', () => {
    const revenue = logementsModel.computeMonthlyRevenue(ctxLogements);
    const total = revenue.reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(20 * 25000000, 0);
  });

  it('CA = 0 après la durée du programme', () => {
    const revenue = logementsModel.computeMonthlyRevenue(ctxLogements);
    expect(revenue[23]).toBeGreaterThan(0);
    expect(revenue[24]).toBe(0);
    expect(revenue[83]).toBe(0);
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
        prixUnitaireLogement: 22000000,
        dureeProgramme: 24,
        nbBureaux: 6,
        surfaceBureauMoyenne: 50,
        loyerM2MoisBureau: 8000,
        tauxOccupationBureau: 75,
      },
    };
    const rev = logementsBureauxModel.computeMonthlyRevenue(ctx);
    const totalLog = 15 * 22000000;
    const loyerBurMois = 6 * 50 * 0.75 * 8000;
    // Mois 1 : logement étalé + loyer bureau
    expect(rev[0]).toBeCloseTo(totalLog / 24 + loyerBurMois, 0);
    // Mois 30 (> 24) : plus de logement, seulement loyer
    expect(rev[30]).toBeCloseTo(loyerBurMois, 0);
  });
});

describe('Immobilier — complexe', () => {
  it('logements seuls = équivalent modèle logements', () => {
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
        prixUnitaireLogement: 22000000,
        dureeProgramme: 24,
      },
    };
    const rev = complexeModel.computeMonthlyRevenue(ctx);
    const total = rev.reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(15 * 22000000, 0);
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
        prixUnitaireLogement: 22000000,
        dureeProgramme: 24,
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
    const attenduMois1 =
      (15 * 22000000) / 24 +   // logement étalé
      6 * 50 * 0.75 * 8000 +   // bureaux
      30 * 30 * 0.65 * 35000 + // hôtel
      60 * 30 * 8000 +         // resto
      3 * 800000;              // fête
    expect(rev[0]).toBeCloseTo(attenduMois1, 0);
  });
});
