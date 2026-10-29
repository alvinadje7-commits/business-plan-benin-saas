// ============================================================
// Schéma de financement — ventilation par investissement
// et par source (FP_R, FP_AR, Emprunt, Subvention)
// ============================================================
import type { InvestmentLine, NatureInvestissement } from '../types/financial-v2';

export interface AffectationLine {
  lineId: string;
  designation: string;
  nature: NatureInvestissement;
  total: number;
  fpR: number;
  fpAR: number;
  emprunt: number;
  subvention: number;
}

export interface Totals {
  total: number;
  fpR: number;
  fpAR: number;
  emprunt: number;
  subvention: number;
}

export interface SchemaFinancementResult {
  byLine: AffectationLine[];
  byNature: { nature: NatureInvestissement; totals: Totals }[];
  investTotal: Totals;
  bfrTotal: Totals;
  grandTotal: Totals;
  pourcentages: { fpR: number; fpAR: number; emprunt: number; subvention: number };
}

function emptyTotals(): Totals {
  return { total: 0, fpR: 0, fpAR: 0, emprunt: 0, subvention: 0 };
}

function addToTotals(t: Totals, o: Totals) {
  t.total += o.total;
  t.fpR += o.fpR;
  t.fpAR += o.fpAR;
  t.emprunt += o.emprunt;
  t.subvention += o.subvention;
}

export function computeSchemaFinancement(
  investments: InvestmentLine[],
  bfrTotal: number
): SchemaFinancementResult {
  const byLine: AffectationLine[] = investments.map((i) => {
    const t = emptyTotals();
    t.total = i.amount;
    if (i.affectation === 'FP_R') t.fpR = i.amount;
    else if (i.affectation === 'FP_AR') t.fpAR = i.amount;
    else if (i.affectation === 'EMPRUNT') t.emprunt = i.amount;
    else if (i.affectation === 'SUBVENTION') t.subvention = i.amount;
    return {
      lineId: i.id,
      designation: i.designation,
      nature: i.nature,
      total: t.total,
      fpR: t.fpR,
      fpAR: t.fpAR,
      emprunt: t.emprunt,
      subvention: t.subvention,
    };
  });

  const natures = new Map<NatureInvestissement, Totals>();
  for (const l of byLine) {
    const cur = natures.get(l.nature) ?? emptyTotals();
    addToTotals(cur, l);
    natures.set(l.nature, cur);
  }

  const investTotal = emptyTotals();
  for (const l of byLine) addToTotals(investTotal, l);

  // BFR : financé par emprunt CT en général (par défaut ici)
  const bfrT = emptyTotals();
  bfrT.total = bfrTotal;
  bfrT.emprunt = bfrTotal;

  const grandTotal = emptyTotals();
  addToTotals(grandTotal, investTotal);
  addToTotals(grandTotal, bfrT);

  const pct = (v: number) => (grandTotal.total > 0 ? v / grandTotal.total : 0);
  return {
    byLine,
    byNature: Array.from(natures.entries()).map(([nature, totals]) => ({ nature, totals })),
    investTotal,
    bfrTotal: bfrT,
    grandTotal,
    pourcentages: {
      fpR: pct(grandTotal.fpR),
      fpAR: pct(grandTotal.fpAR),
      emprunt: pct(grandTotal.emprunt),
      subvention: pct(grandTotal.subvention),
    },
  };
}
