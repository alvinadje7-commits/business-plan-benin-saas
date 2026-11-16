import { describe, it, expect } from 'vitest';
import { computeFinancialResult } from '../financial-statements-engine';
import { DEFAULT_HYPOTHESES, DEFAULT_FINANCEMENT } from '../../types/project';
import type { Investment } from '../../types/project';

describe('Bloc D — Réconciliation production ↔ financier', () => {
  const h = { ...DEFAULT_HYPOTHESES, caMensuel: 10_000_000, pctAchats: 55 };
  const inv: Investment[] = [];
  const fin = DEFAULT_FINANCEMENT;

  it('sans productionData → utilise CA lissé (h.caMensuel × 12)', () => {
    const r = computeFinancialResult(h, inv, fin, 'autres', 0.06, 3);
    expect(r.cr[0].ca).toBeCloseTo(120_000_000, -2);
    expect(r.cr[0].achats).toBeCloseTo(66_000_000, -2);
  });

  it('avec productionData → utilise les vrais flux mensuels (année 1)', () => {
    // 6 mois à 20M + 6 mois à 5M = 150M
    const monthlyRevenue = new Array(36).fill(0).map((_, i) => (i % 2 === 0 ? 20_000_000 : 5_000_000));
    const monthlyCV = new Array(36).fill(5_000_000);
    const r = computeFinancialResult(h, inv, fin, 'autres', 0.06, 3, { monthlyRevenue, monthlyCV });
    expect(r.cr[0].ca).toBeCloseTo(150_000_000, -2);
    expect(r.cr[0].achats).toBeCloseTo(60_000_000, -2);
  });

  it('avec productionData → différentes années reflètent différents flux', () => {
    // Année 1 = 12 × 10M = 120M, Année 2 = 12 × 15M = 180M, Année 3 = 12 × 20M = 240M
    const monthlyRevenue = [
      ...new Array(12).fill(10_000_000),
      ...new Array(12).fill(15_000_000),
      ...new Array(12).fill(20_000_000),
    ];
    const monthlyCV = new Array(36).fill(5_000_000);
    const r = computeFinancialResult(h, inv, fin, 'autres', 0.06, 3, { monthlyRevenue, monthlyCV });
    expect(r.cr[0].ca).toBeCloseTo(120_000_000, -2);
    expect(r.cr[1].ca).toBeCloseTo(180_000_000, -2);
    expect(r.cr[2].ca).toBeCloseTo(240_000_000, -2);
  });

  it('productionData incomplète → annualisation', () => {
    // Seulement 6 mois fournis pour l'année 1
    const monthlyRevenue = new Array(6).fill(10_000_000);
    const monthlyCV = new Array(6).fill(4_000_000);
    const r = computeFinancialResult(h, inv, fin, 'autres', 0.06, 1, { monthlyRevenue, monthlyCV });
    // 6 mois × 10M annualisé = 120M
    expect(r.cr[0].ca).toBeCloseTo(120_000_000, -2);
    expect(r.cr[0].achats).toBeCloseTo(48_000_000, -2);
  });
});
