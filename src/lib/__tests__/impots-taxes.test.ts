import { describe, it, expect } from 'vitest';
import { getTaxRate, computeImpotsTaxes } from '../impots-taxes';

describe('Impôts & taxes', () => {
  it('taux par secteur', () => {
    expect(getTaxRate('aviculture')).toBe(0);
    expect(getTaxRate('agriculture')).toBe(0);
    expect(getTaxRate('agro-industrie')).toBe(0.25);
    expect(getTaxRate('commerce')).toBe(0.30);
  });
  it('impôt = résultat × taux si > 0', () => {
    const r = computeImpotsTaxes({
      lines: [], sectorCode: 'commerce',
      resultatAvantImpot: [1000, -500, 2000], durationYears: 3,
    });
    expect(r.impotResultatAnnuel).toEqual([300, 0, 600]);
  });
});
