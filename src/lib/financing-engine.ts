import type {
  LoanConfig,
  ExistingCredit,
  LoanResult,
  LoanInstallment,
  LoanAnnualAggregate,
  Periodicity,
} from '../types/financial';

const PERIODS_PER_YEAR: Record<Periodicity, number> = {
  MENSUALITE: 12,
  TRIMESTRIALITE: 4,
  SEMESTRIALITE: 2,
  ANNUITE: 1,
};

function pmt(rate: number, periods: number, principal: number): number {
  if (periods <= 0) return 0;
  if (rate === 0) return principal / periods;
  return (principal * rate) / (1 - Math.pow(1 + rate, -periods));
}

function aggregateAnnual(
  installments: LoanInstallment[],
  durationYears: number
): LoanAnnualAggregate[] {
  const annual: LoanAnnualAggregate[] = [];
  for (let y = 1; y <= durationYears; y++) {
    const items = installments.filter((i) => i.year === y);
    annual.push({
      year: y,
      interest: items.reduce((s, i) => s + i.interest, 0),
      taf: items.reduce((s, i) => s + i.taf, 0),
      principal: items.reduce((s, i) => s + i.principal, 0),
      totalPayment: items.reduce((s, i) => s + i.totalPayment, 0),
      closingBalance: items[items.length - 1]?.closingBalance ?? 0,
    });
  }
  return annual;
}

function resultFrom(
  installments: LoanInstallment[],
  durationYears: number,
  config: { id: string; label: string }
): LoanResult {
  return {
    config,
    installments,
    annual: aggregateAnnual(installments, durationYears),
    totalInterest: installments.reduce((s, i) => s + i.interest, 0),
    totalTAF: installments.reduce((s, i) => s + i.taf, 0),
    totalPayment: installments.reduce((s, i) => s + i.totalPayment, 0),
  };
}

/**
 * Échéancier d'un emprunt.
 * - Intérêts = encours début × taux / périodes par an
 * - TAF = encours début × TAF / périodes par an
 * - Différé (partial) : intérêts + TAF payés, principal = 0
 * - Après différé : annuité constante (PMT) sur le capital initial
 */
export function computeLoanSchedule(
  config: LoanConfig,
  durationYears: number
): LoanResult {
  const periodsPerYear = PERIODS_PER_YEAR[config.periodicity];
  const monthsPerPeriod = 12 / periodsPerYear;
  const periodRate = config.rate / periodsPerYear;
  const periodTAF = config.taf / periodsPerYear;

  const totalPeriods = Math.round(config.maturityYears * periodsPerYear);
  const deferralPeriods = Math.min(
    Math.floor(config.deferralMonths / monthsPerPeriod),
    totalPeriods
  );
  const amortPeriods = totalPeriods - deferralPeriods;

  const annuity = pmt(periodRate + periodTAF, amortPeriods, config.capital);

  const installments: LoanInstallment[] = [];
  let balance = config.capital;

  for (let p = 0; p < totalPeriods; p++) {
    const openingBalance = balance;
    const interest = openingBalance * periodRate;
    const taf = openingBalance * periodTAF;
    let principal = 0;

    if (p >= deferralPeriods) {
      principal = annuity - interest - taf;
      if (principal < 0) principal = 0;
      if (principal > balance) principal = balance;
    }

    const totalPayment = interest + taf + principal;
    balance -= principal;

    const absMonth = p * monthsPerPeriod + 1;
    const year = Math.min(
      Math.floor((absMonth - 1) / 12) + 1,
      durationYears
    );

    installments.push({
      monthIndex: absMonth,
      year,
      openingBalance,
      interest,
      taf,
      principal,
      totalPayment,
      closingBalance: balance,
    });
  }

  return resultFrom(installments, durationYears, {
    id: config.id,
    label: config.label,
  });
}

/** Échéancier d'un crédit existant (encours) avec annuité constante. */
export function computeExistingCreditSchedule(
  credit: ExistingCredit,
  durationYears: number
): LoanResult {
  const monthlyRate = credit.rate / 12;
  const n = credit.remainingMonths;
  const annuity = pmt(monthlyRate, n, credit.remainingCapital);

  const startMonth = credit.startMonth ?? 1;
  const installments: LoanInstallment[] = [];
  let balance = credit.remainingCapital;

  for (let p = 0; p < n; p++) {
    const interest = balance * monthlyRate;
    const principal = annuity - interest;
    balance -= principal;
    const absMonth = startMonth + p;
    const year = Math.min(Math.floor((absMonth - 1) / 12) + 1, durationYears);

    installments.push({
      monthIndex: absMonth,
      year,
      openingBalance: balance + principal,
      interest,
      taf: 0,
      principal,
      totalPayment: annuity,
      closingBalance: Math.max(0, balance),
    });
  }

  return resultFrom(installments, durationYears, {
    id: credit.id,
    label: credit.label,
  });
}

/**
 * DSCR = CAF / Service de la dette (principal + intérêts + TAF)
 * Retourne un tableau année 1..N.
 */
export function computeDSCR(
  caf: number[],
  debtServices: { interest: number[]; taf: number[]; principal: number[] }
): number[] {
  const n = caf.length;
  const out: number[] = [];
  for (let y = 0; y < n; y++) {
    const service =
      (debtServices.interest[y] ?? 0) +
      (debtServices.taf[y] ?? 0) +
      (debtServices.principal[y] ?? 0);
    out.push(service > 0 ? caf[y] / service : 0);
  }
  return out;
}
