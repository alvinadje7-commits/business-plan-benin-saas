import { describe, it, expect } from 'vitest';
import { computeRentabilite } from '../rentabilite';

describe('Rentabilité', () => {
  it('VAN positive si CF > I0', () => {
    const r = computeRentabilite({ initialCost: 100, cashFlows: [30,30,30,30,30], discountRate: 0.06 });
    expect(r.van).toBeGreaterThan(0);
  });
  it('VAN à TRI ≈ 0', () => {
    const r = computeRentabilite({ initialCost: 100, cashFlows: [30,30,30,30,30], discountRate: 0.06 });
    expect(r.tri).not.toBeNull();
    const v = -100 + [30,30,30,30,30].reduce((s,cf,t) => s + cf/Math.pow(1+r.tri!,t+1), 0);
    expect(Math.abs(v)).toBeLessThan(1e-3);
  });
  it('IP > 1 quand VAN > 0', () => {
    const r = computeRentabilite({ initialCost: 100, cashFlows: [30,30,30,30,30], discountRate: 0.06 });
    expect(r.ip).toBeGreaterThan(1);
  });
  it('DR interpolé', () => {
    const r = computeRentabilite({ initialCost: 100, cashFlows: [40,40,40,40], discountRate: 0 });
    expect(r.dr).toBeCloseTo(2.5, 5);
    expect(r.drString).toBe('2 ans 6 mois');
  });
  it('DR null si jamais récupéré', () => {
    const r = computeRentabilite({ initialCost: 1000, cashFlows: [10,10,10], discountRate: 0.10 });
    expect(r.dr).toBeNull();
    expect(r.drString).toBe('Non récupéré');
  });
});
