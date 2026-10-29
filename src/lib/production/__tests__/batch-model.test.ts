import { describe, it, expect } from 'vitest';
import { batchModel } from '../batch-model';

const ctx = {
  sectorCode: 'aviculture',
  sectorValues: {
    nbBatiments: 1,
    capaciteBatiment1: 10_000,
    frequenceLancement: 6,
    prixPlateauOeuf: 2000,
    prixPouletReforme: 2500,
    prixFientes: 1000,
    coutPlateauVide: 55,
    coutSacFientes: 40,
    coutAlimentKg: 397,
    coutPhytoKg: 5500,
    tauxCasseOeufs: 0.01,
  },
  durationYears: 3,
};

describe('batch-model (Aviculture)', () => {
  it('produit 36 mois de séries', () => {
    expect(batchModel.computeMonthlyRevenue(ctx).length).toBe(36);
    expect(batchModel.computeMonthlyVariableCosts(ctx)[0].values.length).toBe(36);
  });

  it('0 œuf les 5 premiers mois (phase poussins + poulettes)', () => {
    const q = batchModel.computeMonthlyQuantities(ctx);
    const eggs = q['Plateaux d\'œufs'];
    for (let m = 0; m < 5; m++) expect(eggs[m]).toBe(0);
  });

  it('œufs > 0 à partir du mois 6 (phase ponte)', () => {
    const q = batchModel.computeMonthlyQuantities(ctx);
    const eggs = q['Plateaux d\'œufs'];
    expect(eggs[5]).toBeGreaterThan(0);
  });

  it('poulets reformés > 0 au mois 18 (fin cycle)', () => {
    const q = batchModel.computeMonthlyQuantities(ctx);
    expect(q['Poulets reformés'][17]).toBeGreaterThan(0);
  });

  it('sujets vivants diminue avec la mortalité', () => {
    const q = batchModel.computeMonthlyQuantities(ctx);
    const alive = q['Sujets vivants'];
    expect(alive[0]).toBe(10_000);
    expect(alive[17]).toBeLessThan(10_000);
    expect(alive[17]).toBeGreaterThan(9_000);
  });

  it('CA > 0 et coûts > 0', () => {
    const rev = batchModel.computeMonthlyRevenue(ctx);
    const costs = batchModel.computeMonthlyVariableCosts(ctx);
    expect(rev.reduce((s, v) => s + v, 0)).toBeGreaterThan(0);
    expect(costs.reduce((s, c) => s + c.values.reduce((a, b) => a + b, 0), 0)).toBeGreaterThan(0);
  });

  it('3 lignes de production décalées → production > 1 ligne', () => {
    const ctx3 = { ...ctx, sectorValues: { ...ctx.sectorValues, nbBatiments: 3, capaciteBatiment2: 8_000, capaciteBatiment3: 6_000 } };
    const q1 = batchModel.computeMonthlyQuantities(ctx);
    const q3 = batchModel.computeMonthlyQuantities(ctx3);
    const sum1 = q1['Plateaux d\'œufs'].reduce((s, v) => s + v, 0);
    const sum3 = q3['Plateaux d\'œufs'].reduce((s, v) => s + v, 0);
    expect(sum3).toBeGreaterThan(sum1);
  });

  it('getSectorKPIs retourne des valeurs numériques', () => {
    const kpis = batchModel.getSectorKPIs(ctx);
    expect(kpis.length).toBeGreaterThan(0);
    for (const k of kpis) expect(typeof k.value).toBe('number');
  });
});
