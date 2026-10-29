import { describe, it, expect } from 'vitest';
import { computeChargesExploitation } from '../charges-exploitation';

describe('Golden Test — Aviculture (modèle SCSA_ADPME_IOBIF)', () => {
  // Données mensuelles extraites du CSV Excel (Année 1, Mois 1 à 12)
  const cvMonthly       = [7661093,7661093,7661093,7661093,38598799,12462799,13022014,13022014,13022014,27093026,47102786,30339745];
  const ceMonthly       = [500000,500000,500000,500000,730000,730000,730000,730000,730000,730000,1375000,1375000];
  const salairesMonthly = [610480,610480,610480,610480,962680,962680,962680,962680,962680,962680,962680,962680];
  const taxesMonthly    = [47250,86491,99571,112652,119792,119792,126678,120137,120137,236729,333615,517908];

  const result = computeChargesExploitation({
    cvMonthly,
    ceMonthly,
    salairesMonthly,
    taxesMonthly,
    impotResultatAnnuel: [0], // L'impôt sur le résultat n'est pas inclus dans le TOTAL Excel
    durationYears: 1,
  });

  it('totalCV = 225 307 569 FCFA', () => {
    expect(result.totalCV).toBe(225307569);
  });

  it('totalCE = 9 130 000 FCFA', () => {
    expect(result.totalCE).toBe(9130000);
  });

  it('totalSalaires = 10 143 360 FCFA', () => {
    expect(result.totalSalaires).toBe(10143360);
  });

  it('totalTaxes = 2 040 752 FCFA', () => {
    expect(result.totalTaxes).toBe(2040752);
  });

  it('TOTAL GÉNÉRAL = 246 621 681 FCFA', () => {
    expect(result.totalGeneral).toBe(246621681);
  });

  it('cohérence : CV + CE + Salaires + Taxes = TOTAL', () => {
    expect(result.totalCV + result.totalCE + result.totalSalaires + result.totalTaxes).toBe(246621681);
  });
});
