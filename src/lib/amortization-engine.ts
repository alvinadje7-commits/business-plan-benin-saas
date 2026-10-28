import type { Investment, AmortizationLine } from '../types/project';

/**
 * Calcule le plan d'amortissement d'une immobilisation sur N années.
 * Renvoie un tableau de dotations (index 0 = Année 1).
 *
 * - Linéaire : dotation = coût / durée
 * - Dégressif (SYSCOHADA) : taux = (1/n) × coefficient, avec bascule
 *   automatique en linéaire quand l'annuité linéaire devient supérieure.
 *   Coefficients usuels : 1.5 (3-4 ans), 2.0 (5-6 ans), 2.5 (>6 ans).
 */
export function computeInvestmentAmortization(inv: Investment, maxYears = 3): number[] {
  const result: number[] = [];
  const n = Math.max(1, Math.floor(inv.duration));
  let vnc = inv.cost;

  for (let y = 1; y <= maxYears; y++) {
    if (y > n || vnc <= 0) {
      result.push(0);
      continue;
    }

    let dotation: number;
    if (inv.mode === 'Linéaire') {
      dotation = inv.cost / n;
    } else {
      let coeff = 1.5;
      if (n >= 5 && n <= 6) coeff = 2;
      else if (n > 6) coeff = 2.5;
      const rate = (1 / n) * coeff;
      const remainingYears = n - y + 1;
      const annuiteDeg = vnc * rate;
      const annuiteLin = vnc / remainingYears;
      dotation = Math.max(annuiteDeg, annuiteLin);
    }

    dotation = Math.min(dotation, vnc);
    result.push(dotation);
    vnc -= dotation;
  }
  return result;
}

/**
 * Calcule le plan complet pour toutes les immobilisations.
 * @param years  Nombre d'années à afficher (3 par défaut, comme la maquette)
 */
export function computeAmortizationTable(investments: Investment[], years = 3): AmortizationLine[] {
  return investments.map((inv) => {
    const dotations = computeInvestmentAmortization(inv, years);
    const totalDotations = dotations.reduce((s, d) => s + d, 0);
    const vnc = inv.cost - totalDotations;
    return { inv, dotations, totalDotations, vnc };
  });
}

export function totalByYear(lines: AmortizationLine[], yearIndex: number): number {
  return lines.reduce((s, l) => s + (l.dotations[yearIndex] ?? 0), 0);
}

export function totalInvestments(investments: Investment[]): number {
  return investments.reduce((s, i) => s + i.cost, 0);
}

export function totalVNC(lines: AmortizationLine[]): number {
  return lines.reduce((s, l) => s + l.vnc, 0);
}

export function fmtFCFA(n: number): string {
  return Math.round(n).toLocaleString('fr-FR');
}
