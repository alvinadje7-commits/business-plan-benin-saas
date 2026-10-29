import type { Financement, LoanYear } from '../types/project';

/**
 * Calcule le tableau d'amortissement d'un emprunt sur N années.
 * - Différé : mois sans rembourser le capital (intérêts payés).
 * - Amortissement constant du capital sur la période restante.
 */
export function computeLoanSchedule(f: Financement): LoanYear[] {
  const i = f.empruntTaux / 100 / 12;
  const totalMois = f.empruntDuree * 12;
  const moisAmort = Math.max(1, totalMois - f.empruntDiffere);
  const capitalMensuel = f.empruntMontant / moisAmort;

  let capitalRestant = f.empruntMontant;
  const schedule: LoanYear[] = [];

  for (let a = 1; a <= f.empruntDuree; a++) {
    let interets = 0;
    let amortissement = 0;
    const capitalDebut = capitalRestant;

    for (let m = 1; m <= 12; m++) {
      const moisGlobal = (a - 1) * 12 + m;
      if (moisGlobal > totalMois) break;

      interets += capitalRestant * i;

      if (moisGlobal > f.empruntDiffere) {
        const am = Math.min(capitalMensuel, capitalRestant);
        amortissement += am;
        capitalRestant -= am;
      }
    }

    schedule.push({
      annee: a,
      capitalDebut,
      interets,
      amortissement,
      annuite: interets + amortissement,
      capitalFin: capitalRestant,
    });
  }

  return schedule;
}

export interface DSCRYear {
  annee: number;
  caf: number;
  annuite: number;
  dscr: number;
  ok: boolean;
}

/**
 * Calcule la CAF et le DSCR pour chaque année de l'emprunt.
 * CAF = RN + Dotations, avec RN = (RE − Intérêts) × (1 − IS) si positif.
 */
export function computeDSCR(
  schedule: LoanYear[],
  resultatExploitation: number,
  dotations: number,
  tauxIS = 0.30,
): DSCRYear[] {
  return schedule.map((y) => {
    const rai = resultatExploitation - y.interets;
    const is = rai > 0 ? rai * tauxIS : 0;
    const rn = rai - is;
    const caf = rn + dotations;
    const dscr = y.annuite > 0 ? caf / y.annuite : 0;
    return {
      annee: y.annee,
      caf,
      annuite: y.annuite,
      dscr,
      ok: dscr >= 1.2,
    };
  });
}

export function fmtFCFA(n: number): string {
  return Math.round(n).toLocaleString('fr-FR');
}
