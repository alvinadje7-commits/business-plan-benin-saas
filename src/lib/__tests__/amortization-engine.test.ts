import { describe, it, expect } from 'vitest';
import { computeInvestmentAmortization } from '../amortization-engine';
import type { InvestmentLine } from '../../types/financial';

const mk = (o: Partial<InvestmentLine>): InvestmentLine => ({
  id: 'x', designation: 'x', quantity: 1, unitPrice: 0, amount: 0,
  affectation: 'FP_R', nature: 'MATERIELS', realizationStatus: 'REALISE',
  year: 0, amortizationYears: 0, ...o,
});

describe('amortization', () => {
  it('linéaire simple : 100M sur 5 ans = 20M/an', () => {
    const r = computeInvestmentAmortization(
      [mk({ amount: 100, amortizationYears: 5 })], 7
    );
    expect(r.synth.totalDotation.slice(0, 5)).toEqual([20, 20, 20, 20, 20]);
    expect(r.synth.totalDotation[5]).toBe(0);
  });

  it('terrain : 0 dotation, VNC = valeur initiale', () => {
    const r = computeInvestmentAmortization(
      [mk({ amount: 100, amortizationYears: 0, nature: 'TERRAIN' })], 7
    );
    expect(r.synth.totalDotation).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(r.synth.totalVNC[6]).toBe(100);
  });

  it('split Réalisé / À Réaliser', () => {
    const r = computeInvestmentAmortization(
      [
        mk({ amount: 100, amortizationYears: 5, realizationStatus: 'REALISE' }),
        mk({ amount: 50, amortizationYears: 5, realizationStatus: 'A_REALISER' }),
      ], 7
    );
    expect(r.realized.totalDotation[0]).toBe(20);
    expect(r.toRealize.totalDotation[0]).toBe(10);
    expect(r.synth.totalDotation[0]).toBe(30);
  });
});
