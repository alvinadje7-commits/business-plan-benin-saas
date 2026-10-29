import type {
  InvestmentLine,
  AmortizationResult,
  AmortizationLineDetail,
  AmortizationCategoryResult,
} from '../types/financial';

function computeDetail(
  line: InvestmentLine,
  durationYears: number
): AmortizationLineDetail {
  const dotations: number[] = new Array(durationYears).fill(0);
  const balances: number[] = new Array(durationYears).fill(0);

  if (line.amortizationYears <= 0) {
    // Terrain : pas d'amortissement
    for (let y = 0; y < durationYears; y++) balances[y] = line.amount;
  } else {
    const dotation = line.amount / line.amortizationYears;
    let cumul = 0;
    for (let y = 0; y < durationYears; y++) {
      if (y >= line.year && y < line.year + line.amortizationYears) {
        dotations[y] = dotation;
        cumul += dotation;
      }
      balances[y] = Math.max(0, line.amount - cumul);
    }
  }

  const finalVNC =
    line.vncOverride ??
    (line.amortizationYears <= 0
      ? line.amount
      : Math.max(0, line.amount - line.amortizationYears * (line.amount / line.amortizationYears)));

  return { line, dotations, balances, vnc: finalVNC };
}

function emptyCategory(durationYears: number): AmortizationCategoryResult {
  return {
    lines: [],
    totalDotation: new Array(durationYears).fill(0),
    totalVNC: new Array(durationYears).fill(0),
    totalVRNI: 0,
  };
}

function aggregateCategory(
  lines: InvestmentLine[],
  durationYears: number
): AmortizationCategoryResult {
  const result = emptyCategory(durationYears);
  for (const inv of lines) {
    const detail = computeDetail(inv, durationYears);
    result.lines.push(detail);
    for (let y = 0; y < durationYears; y++) {
      result.totalDotation[y] += detail.dotations[y];
      result.totalVNC[y] += detail.balances[y];
    }
    result.totalVRNI += detail.vnc;
  }
  return result;
}

/**
 * Calcule l'amortissement en séparant :
 *  - les investissements déjà réalisés (parc existant)
 *  - les investissements à réaliser
 *  - la synthèse (somme des deux)
 */
export function computeInvestmentAmortization(
  investments: InvestmentLine[],
  durationYears: number
): AmortizationResult {
  const realized = aggregateCategory(
    investments.filter((i) => i.realizationStatus === 'REALISE'),
    durationYears
  );
  const toRealize = aggregateCategory(
    investments.filter((i) => i.realizationStatus === 'A_REALISER'),
    durationYears
  );
  const synth = aggregateCategory(investments, durationYears);
  return { realized, toRealize, synth };
}

// ---------- Helpers backward-compat ----------

export function totalInvestments(investments: InvestmentLine[]): number {
  return investments.reduce((s, i) => s + i.amount, 0);
}

export function totalVNC(investments: InvestmentLine[], durationYears: number): number {
  return investments.reduce(
    (s, i) => s + computeDetail(i, durationYears).vnc,
    0
  );
}

export function totalByYear(
  investments: InvestmentLine[],
  durationYears: number
): { dotations: number[]; vnc: number[] } {
  const r = aggregateCategory(investments, durationYears);
  return { dotations: r.totalDotation, vnc: r.totalVNC };
}
