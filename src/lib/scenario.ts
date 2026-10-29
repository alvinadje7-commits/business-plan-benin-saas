// ============================================================
// Scénarios — CA et CV uniquement (charges fixes JAMAIS ajustées)
// ============================================================
import type { Scenario } from '../types/financial-v2';
import { SCENARIO_COEFS } from '../types/financial-v2';

export interface ScenarioAdjusted {
  scenario: Scenario;
  coef: number;
  chiffreAffaires: number[];
  chargesVariables: number[];
  chargesFixes: number[];
}

export function applyScenario(
  ca: number[],
  cv: number[],
  cf: number[],
  scenario: Scenario
): ScenarioAdjusted {
  const coef = SCENARIO_COEFS[scenario];
  return {
    scenario,
    coef,
    chiffreAffaires: ca.map((v) => v * coef),
    chargesVariables: cv.map((v) => v * coef),
    chargesFixes: [...cf],
  };
}

export function applyScenarioMonthly(
  ca: number[],
  cv: number[],
  scenario: Scenario
): { chiffreAffaires: number[]; chargesVariables: number[]; coef: number } {
  const coef = SCENARIO_COEFS[scenario];
  return {
    coef,
    chiffreAffaires: ca.map((v) => v * coef),
    chargesVariables: cv.map((v) => v * coef),
  };
}
