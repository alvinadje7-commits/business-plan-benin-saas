import { describe, it, expect } from 'vitest';
import { applyScenario, applyScenarioMonthly } from '../scenario';

describe('Scénarios', () => {
  const ca = [100, 200], cv = [50, 100], cf = [10, 10];
  it('Optimiste ×1.00, CF inchangés', () => {
    const r = applyScenario(ca, cv, cf, 'OPTIMISTE');
    expect(r.chiffreAffaires).toEqual([100, 200]);
    expect(r.chargesVariables).toEqual([50, 100]);
    expect(r.chargesFixes).toEqual([10, 10]);
  });
  it('Moyenne ×0.90', () => {
    const r = applyScenario(ca, cv, cf, 'MOYENNE');
    expect(r.chiffreAffaires[0]).toBeCloseTo(90, 6);
    expect(r.chargesFixes).toEqual([10, 10]);
  });
  it('Pessimiste ×0.85', () => {
    const r = applyScenario(ca, cv, cf, 'PESSIMISTE');
    expect(r.chiffreAffaires[0]).toBeCloseTo(85, 6);
    expect(r.chargesFixes).toEqual([10, 10]);
  });
  it('applyScenarioMonthly', () => {
    const r = applyScenarioMonthly([100, 200], [50, 100], 'PESSIMISTE');
    expect(r.coef).toBe(0.85);
    expect(r.chiffreAffaires[0]).toBeCloseTo(85, 6);
  });
});
