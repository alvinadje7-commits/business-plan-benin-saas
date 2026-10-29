import { describe, it, expect } from 'vitest';
import { computePlanFinancement } from '../plan-financement';

describe('Plan de financement', () => {
  it('solde = ressources − emplois', () => {
    const r = computePlanFinancement({
      durationYears: 2,
      apportsCapital: [100, 0], emprunts: [50, 0], subventions: [0, 0],
      caf: [30, 60], dettesFiscales: [0, 0],
      investissements: [150, 0], variationBFR: [10, 5],
      remboursements: [20, 20], dividendes: [0, 0],
    });
    expect(r.years[0].solde).toBe((100 + 50 + 30) - (150 + 10 + 20));
    expect(r.years[1].solde).toBe(60 - (5 + 20));
    expect(r.soldeFinal).toBe(r.years[0].solde + r.years[1].solde);
  });
});
