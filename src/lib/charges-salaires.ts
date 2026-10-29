// ============================================================
// Charges salariales — postes + recrutement + inflation 5 %/an
// Charges sociales : 17.4 % du salaire brut
// Charges fiscales : 4 % du salaire brut
// ============================================================

export const SOCIAL_RATE = 0.174;
export const FISCAL_RATE  = 0.04;
export const ANNUAL_INCREASE = 0.05;

export interface Recruitment {
  year: number;       // 1..N
  count: number;
}

export interface SalaryLine {
  id: string;
  poste: string;
  monthly: number;
  socialCharges: number;   // 0 ou 0.174
  fiscalCharges: number;   // 0 ou 0.04
  recruitments: Recruitment[];
}

export interface SalaryYearResult {
  year: number;
  poste: string;
  headcount: number;
  monthlyBrut: number;
  socialCharges: number;
  fiscalCharges: number;
  monthlyTotal: number;
  annualTotal: number;
}

export interface SalaryResult {
  years: SalaryYearResult[];
  monthlyByPoste: { poste: string; values: number[] }[];
  annualByPoste: { poste: string; values: number[] }[];
  totalMonthly: number[];
  totalAnnual: number[];
}

function headcountAt(line: SalaryLine, year: number): number {
  return line.recruitments
    .filter((r) => r.year <= year)
    .reduce((s, r) => s + r.count, 0);
}

function monthlyBrutAt(line: SalaryLine, year: number): number {
  return line.monthly * Math.pow(1 + ANNUAL_INCREASE, year - 1);
}

export function computeSalaries(
  lines: SalaryLine[],
  durationYears: number
): SalaryResult {
  const years: SalaryYearResult[] = [];
  const monthlyByPoste = lines.map((l) => ({ poste: l.poste, values: new Array(durationYears * 12).fill(0) }));
  const annualByPoste  = lines.map((l) => ({ poste: l.poste, values: new Array(durationYears).fill(0) }));
  const totalMonthly = new Array(durationYears * 12).fill(0);
  const totalAnnual  = new Array(durationYears).fill(0);

  lines.forEach((line, idx) => {
    for (let y = 1; y <= durationYears; y++) {
      const hc = headcountAt(line, y);
      if (hc === 0) continue;
      const brut = monthlyBrutAt(line, y);
      const social = line.socialCharges > 0 ? brut * SOCIAL_RATE : 0;
      const fiscal = line.fiscalCharges > 0 ? brut * FISCAL_RATE : 0;
      const monthly = (brut + social + fiscal) * hc;
      const annual = monthly * 12;

      for (let m = 0; m < 12; m++) {
        const mi = (y - 1) * 12 + m;
        monthlyByPoste[idx].values[mi] += monthly;
        totalMonthly[mi] += monthly;
      }
      annualByPoste[idx].values[y - 1] += annual;
      totalAnnual[y - 1] += annual;

      years.push({
        year: y,
        poste: line.poste,
        headcount: hc,
        monthlyBrut: brut,
        socialCharges: social,
        fiscalCharges: fiscal,
        monthlyTotal: monthly,
        annualTotal: annual,
      });
    }
  });

  return { years, monthlyByPoste, annualByPoste, totalMonthly, totalAnnual };
}
