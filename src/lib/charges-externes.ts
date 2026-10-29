// ============================================================
// Charges externes — postes mensuels + inflation 5 %/an
// ============================================================

export const CE_INFLATION = 0.05;

export interface ChargeExterne {
  id: string;
  label: string;
  monthly: number;    // montant mensuel année 1
}

export interface ChargeExterneResult {
  monthlyByPoste: { label: string; values: number[] }[];
  totalMonthly: number[];
  totalAnnual: number[];
}

function monthlyAt(base: number, year: number): number {
  return base * Math.pow(1 + CE_INFLATION, year - 1);
}

export function computeChargesExternes(
  lines: ChargeExterne[],
  durationYears: number
): ChargeExterneResult {
  const monthlyByPoste = lines.map((l) => ({
    label: l.label,
    values: new Array(durationYears * 12).fill(0),
  }));
  const totalMonthly = new Array(durationYears * 12).fill(0);
  const totalAnnual  = new Array(durationYears).fill(0);

  lines.forEach((line, idx) => {
    for (let y = 1; y <= durationYears; y++) {
      const m = monthlyAt(line.monthly, y);
      for (let k = 0; k < 12; k++) {
        const mi = (y - 1) * 12 + k;
        monthlyByPoste[idx].values[mi] = m;
        totalMonthly[mi] += m;
        totalAnnual[y - 1] += m;
      }
    }
  });

  return { monthlyByPoste, totalMonthly, totalAnnual };
}
