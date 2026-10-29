import { describe, it, expect } from 'vitest';
import { computeSalaries } from '../charges-salaires';

describe('Charges salariales', () => {
  it('charges sociales 17.4 % + fiscales 4 %', () => {
    const r = computeSalaries([
      { id: 's', poste: 'X', monthly: 100000, socialCharges: 1, fiscalCharges: 1, recruitments: [{ year: 1, count: 1 }] },
    ], 1);
    // monthly = (100000 + 17400 + 4000) × 1 = 121400
    expect(r.totalMonthly[0]).toBeCloseTo(121400, 0);
    expect(r.totalAnnual[0]).toBeCloseTo(121400 * 12, 0);
  });
  it('recrutement échelonné : année 2 a plus de têtes', () => {
    const r = computeSalaries([
      { id: 's', poste: 'X', monthly: 100000, socialCharges: 1, fiscalCharges: 1, recruitments: [{ year: 1, count: 1 }, { year: 2, count: 2 }] },
    ], 2);
    expect(r.annualByPoste[0].values[0]).toBeLessThan(r.annualByPoste[0].values[1]);
  });
});
