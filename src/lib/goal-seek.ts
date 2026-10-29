import type { Hypotheses, Investment, Financement } from '../types/project';
import { computeTRIOnly } from './financial-statements-engine';

export type LeverKey = 'caMensuel' | 'investTotal' | 'pctAchats' | 'masseSalariale' | 'emprunt';

export type Verdict = 'deja_atteint' | 'realiste' | 'agressif' | 'difficile' | 'impossible';

export interface LeverResult {
  key: LeverKey;
  label: string;
  description: string;
  unit: 'FCFA' | '%';
  currentValue: number;
  requiredValue: number | null;
  gapPercent: number;
  verdict: Verdict;
}

interface SolveInput {
  targetTRI: number;
  min: number;
  max: number;
  evaluate: (x: number) => number;
}

/** Résolution par bisection (25 itérations max, tolérance 0,05 pt) */
function solveBisection(input: SolveInput): number | null {
  const fMin = input.evaluate(input.min) - input.targetTRI;
  const fMax = input.evaluate(input.max) - input.targetTRI;
  if (fMin * fMax > 0) return null;
  let lo = input.min, hi = input.max, fLo = fMin;
  for (let i = 0; i < 25; i++) {
    const mid = (lo + hi) / 2;
    const fMid = input.evaluate(mid) - input.targetTRI;
    if (Math.abs(fMid) < 0.05) return mid;
    if (fLo * fMid <= 0) { hi = mid; } else { lo = mid; fLo = fMid; }
  }
  return (lo + hi) / 2;
}

function verdictFromGap(gapPercent: number): Verdict {
  const abs = Math.abs(gapPercent);
  if (abs < 10) return 'realiste';
  if (abs < 25) return 'agressif';
  if (abs < 50) return 'difficile';
  return 'impossible';
}

export function computeLevers(
  targetTRI: number,
  currentTRI: number,
  h: Hypotheses,
  inv: Investment[],
  fin: Financement,
  sectorCode: string,
  tauxActu: number,
  horizon: number,
): LeverResult[] {
  const results: LeverResult[] = [];
  const alreadyReached = currentTRI >= targetTRI - 0.01;
  const triFor = (h2: Hypotheses, inv2: Investment[], fin2: Financement) =>
    computeTRIOnly(h2, inv2, fin2, sectorCode, tauxActu, horizon);

  // 1. CA mensuel
  {
    const current = h.caMensuel;
    const required = alreadyReached ? current : solveBisection({
      targetTRI, min: Math.max(1000, current * 0.5), max: current * 3,
      evaluate: (x) => triFor({ ...h, caMensuel: x }, inv, fin),
    });
    const gapPercent = required !== null && current > 0 ? ((required - current) / current) * 100 : 0;
    results.push({
      key: 'caMensuel', label: "Chiffre d'affaires mensuel",
      description: 'Prix de vente × volumes. Levier commercial.',
      unit: 'FCFA', currentValue: current, requiredValue: required, gapPercent,
      verdict: alreadyReached ? 'deja_atteint' : (required === null ? 'impossible' : verdictFromGap(gapPercent)),
    });
  }

  // 2. Investissement total
  {
    const current = inv.reduce((s, i) => s + i.cost, 0);
    const required = alreadyReached ? current : solveBisection({
      targetTRI, min: current * 0.5, max: current * 1.5,
      evaluate: (x) => {
        const factor = current > 0 ? x / current : 1;
        const inv2 = inv.map((i) => ({ ...i, cost: Math.round(i.cost * factor) }));
        return triFor(h, inv2, fin);
      },
    });
    const gapPercent = required !== null && current > 0 ? ((required - current) / current) * 100 : 0;
    results.push({
      key: 'investTotal', label: 'Investissement total',
      description: 'Négociation devis, phasage. Ajuste tous les postes au prorata.',
      unit: 'FCFA', currentValue: current, requiredValue: required, gapPercent,
      verdict: alreadyReached ? 'deja_atteint' : (required === null ? 'impossible' : verdictFromGap(gapPercent)),
    });
  }

  // 3. % charges variables
  {
    const current = h.pctAchats;
    const required = alreadyReached ? current : solveBisection({
      targetTRI, min: 30, max: Math.min(85, Math.max(current * 1.5, 70)),
      evaluate: (x) => triFor({ ...h, pctAchats: x }, inv, fin),
    });
    const gapPercent = required !== null && current > 0 ? ((required - current) / current) * 100 : 0;
    results.push({
      key: 'pctAchats', label: 'Charges variables (% CA)',
      description: 'Efficacité opérationnelle, négociation fournisseurs.',
      unit: '%', currentValue: current, requiredValue: required, gapPercent,
      verdict: alreadyReached ? 'deja_atteint' : (required === null ? 'impossible' : verdictFromGap(gapPercent)),
    });
  }

  // 4. Masse salariale
  {
    const current = h.masseSalariale;
    const required = alreadyReached ? current : solveBisection({
      targetTRI, min: current * 0.7, max: current * 1.5,
      evaluate: (x) => triFor({ ...h, masseSalariale: x }, inv, fin),
    });
    const gapPercent = required !== null && current > 0 ? ((required - current) / current) * 100 : 0;
    results.push({
      key: 'masseSalariale', label: 'Masse salariale annuelle',
      description: 'Optimisation équipe, automatisation, externalisation.',
      unit: 'FCFA', currentValue: current, requiredValue: required, gapPercent,
      verdict: alreadyReached ? 'deja_atteint' : (required === null ? 'impossible' : verdictFromGap(gapPercent)),
    });
  }

  // 5. Emprunt
  {
    const current = fin.empruntMontant;
    const investTotal = inv.reduce((s, i) => s + i.cost, 0);
    const required = alreadyReached ? current : solveBisection({
      targetTRI, min: 0, max: Math.round(investTotal * 0.9),
      evaluate: (x) => triFor(h, inv, { ...fin, empruntMontant: x }),
    });
    const gapPercent = required !== null && current > 0 ? ((required - current) / current) * 100 : 0;
    results.push({
      key: 'emprunt', label: "Montant de l'emprunt",
      description: 'Effet de levier (plus de dette = TRI amplifié, risque accru).',
      unit: 'FCFA', currentValue: current, requiredValue: required, gapPercent,
      verdict: alreadyReached ? 'deja_atteint' : (required === null ? 'impossible' : verdictFromGap(gapPercent)),
    });
  }

  return results;
}
