import { describe, it, expect } from 'vitest';
import { computeSchemaFinancement } from '../schema-financement';
import type { InvestmentLine } from '../../types/financial-v2';

const mk = (o: Partial<InvestmentLine>): InvestmentLine => ({
  id: 'x', designation: 'x', quantity: 1, unitPrice: 0, amount: 0,
  affectation: 'FP_R', nature: 'MATERIELS', realizationStatus: 'REALISE',
  year: 0, amortizationYears: 5, ...o,
});

describe('Schéma de financement', () => {
  it('ventile correctement par affectation', () => {
    const inv = [
      mk({ id: 'a', amount: 100, affectation: 'FP_R', nature: 'TERRAIN' }),
      mk({ id: 'b', amount: 50, affectation: 'EMPRUNT', nature: 'MATERIELS' }),
      mk({ id: 'c', amount: 30, affectation: 'SUBVENTION', nature: 'BATIMENTS' }),
    ];
    const r = computeSchemaFinancement(inv, 20);
    expect(r.investTotal.total).toBe(180);
    expect(r.investTotal.fpR).toBe(100);
    expect(r.investTotal.emprunt).toBe(50);
    expect(r.investTotal.subvention).toBe(30);
    expect(r.bfrTotal.emprunt).toBe(20);
    expect(r.grandTotal.total).toBe(200);
  });
});
