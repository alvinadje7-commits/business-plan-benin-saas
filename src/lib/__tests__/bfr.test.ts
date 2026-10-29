import { describe, it, expect } from 'vitest';
import { computeBFR, totalVariationBFR } from '../bfr';

describe('BFR', () => {
  it('TVA 1.18 uniquement sur créances + dettes fournisseurs', () => {
    const r = computeBFR({
      chiffreAffaires: [120_000_000], chargesVariables: [60_000_000],
      delaiClientsJours: 30, delaiFournisseursJours: 0,
    });
    expect(r.lines[0].creancesClients).toBeCloseTo(11_800_000, 0);
    expect(r.lines[0].stocks).toBeCloseTo(5_000_000, 0);
    expect(r.lines[0].dettesFournisseurs).toBe(0);
    expect(r.lines[0].bfr).toBeCloseTo(16_800_000, 0);
  });
  it('Variation = delta BFR', () => {
    const r = computeBFR({
      chiffreAffaires: [100, 150, 200], chargesVariables: [50, 75, 100],
      delaiClientsJours: 30, delaiFournisseursJours: 30,
    });
    expect(r.variation[1]).toBeCloseTo(r.bfr[1] - r.bfr[0], 6);
  });
  it('Somme variations = BFR final', () => {
    const r = computeBFR({
      chiffreAffaires: [100, 150, 200], chargesVariables: [50, 75, 100],
      delaiClientsJours: 30, delaiFournisseursJours: 15,
    });
    expect(totalVariationBFR(r)).toBeCloseTo(r.bfr[r.bfr.length - 1], 6);
  });
});
