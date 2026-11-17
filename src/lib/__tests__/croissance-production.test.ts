// Test — croissance annuelle appliquée aux flux de productionData
import { describe, it, expect } from 'vitest';
import { computeFinancialResult } from '../financial-statements-engine';
import { DEFAULT_HYPOTHESES, DEFAULT_INVESTMENTS, DEFAULT_FINANCEMENT } from '../../types/project';

const sectorCode = 'commerce';

function baseHyp(croissA2: number, croissA3: number) {
  return {
    ...DEFAULT_HYPOTHESES,
    caMensuel: 10_000_000,
    pctAchats: 55,
    saisonnalite: Array(12).fill(1),
    croissanceA2: croissA2,
    croissanceA3: croissA3,
  };
}

describe('Croissance annuelle sur productionData', () => {
  it('croissance 0 → CA identique A1/A2/A3', () => {
    const h = baseHyp(0, 0);
    const monthlyRevenue = new Array(36).fill(10_000_000);
    const monthlyCV = new Array(36).fill(5_000_000);
    const r = computeFinancialResult(h, DEFAULT_INVESTMENTS, DEFAULT_FINANCEMENT, sectorCode, 0.06, 3, { monthlyRevenue, monthlyCV });
    expect(r.cr[0].ca).toBeCloseTo(120_000_000, -2);
    expect(r.cr[1].ca).toBeCloseTo(120_000_000, -2);
    expect(r.cr[2].ca).toBeCloseTo(120_000_000, -2);
  });

  it('croissance A2 = 5%, A3 = 5% → CA A2 +5%, A3 +10.25%', () => {
    const h = baseHyp(5, 5);
    const monthlyRevenue = new Array(36).fill(10_000_000);
    const monthlyCV = new Array(36).fill(5_000_000);
    const r = computeFinancialResult(h, DEFAULT_INVESTMENTS, DEFAULT_FINANCEMENT, sectorCode, 0.06, 3, { monthlyRevenue, monthlyCV });
    expect(r.cr[0].ca).toBeCloseTo(120_000_000, -2);          // A1 : pas de croissance
    expect(r.cr[1].ca).toBeCloseTo(120_000_000 * 1.05, -2);   // A2 : +5%
    expect(r.cr[2].ca).toBeCloseTo(120_000_000 * 1.05 * 1.05, -2); // A3 : +10.25%
  });

  it('saisonnalité + croissance combinées', () => {
    const h = { ...baseHyp(10, 10), saisonnalite: [0.5, 0.5, 0.7, 1.0, 1.2, 1.4, 1.5, 1.4, 1.2, 1.0, 0.8, 0.8] };
    const monthlyRevenue = new Array(36).fill(10_000_000);
    const monthlyCV = new Array(36).fill(5_000_000);
    const r = computeFinancialResult(h, DEFAULT_INVESTMENTS, DEFAULT_FINANCEMENT, sectorCode, 0.06, 3, { monthlyRevenue, monthlyCV });
    // A1 : somme(saison) = 12 → 120M ; A2 : ×1.10 = 132M
    expect(r.cr[0].ca).toBeCloseTo(120_000_000, -2);
    expect(r.cr[1].ca).toBeCloseTo(132_000_000, -2);
  });
});
