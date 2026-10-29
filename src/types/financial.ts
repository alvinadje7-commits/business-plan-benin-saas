// ============================================================
// Types financiers enrichis — Sprint 1
// ============================================================

export type Scenario = 'OPTIMISTE' | 'MOYENNE' | 'PESSIMISTE';

export const SCENARIO_COEFS: Record<Scenario, number> = {
  OPTIMISTE: 1.00,
  MOYENNE: 0.90,
  PESSIMISTE: 0.85,
};

export type NatureInvestissement =
  | 'IMMOBILISATION_INCORPORELLE'
  | 'TERRAIN'
  | 'BATIMENTS'
  | 'MATERIELS'
  | 'TRANSPORT'
  | 'MOBILIERS'
  | 'OUTILLAGES';

export type Affectation = 'FP_R' | 'FP_AR' | 'EMPRUNT' | 'SUBVENTION';

export type RealizationStatus = 'REALISE' | 'A_REALISER';

export interface InvestmentLine {
  id: string;
  designation: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  affectation: Affectation;
  nature: NatureInvestissement;
  realizationStatus: RealizationStatus;
  year: number;                 // 0..N
  amortizationYears: number;    // 0 pour terrain
  vncOverride?: number;
}

export interface AmortizationLineDetail {
  line: InvestmentLine;
  dotations: number[];          // length = durationYears
  balances: number[];           // length = durationYears
  vnc: number;
}

export interface AmortizationCategoryResult {
  lines: AmortizationLineDetail[];
  totalDotation: number[];
  totalVNC: number[];
  totalVRNI: number;
}

export interface AmortizationResult {
  realized: AmortizationCategoryResult;
  toRealize: AmortizationCategoryResult;
  synth: AmortizationCategoryResult;
}

export type Periodicity =
  | 'MENSUALITE'
  | 'TRIMESTRIALITE'
  | 'SEMESTRIALITE'
  | 'ANNUITE';

export interface LoanConfig {
  id: string;
  label: string;
  capital: number;
  rate: number;                 // annuel, ex 0.035
  taf: number;                  // taux assurance frais annuel, ex 0.02
  maturityYears: number;
  periodicity: Periodicity;
  deferralMonths: number;
  startYear: number;            // 1..N
}

export interface ExistingCredit {
  id: string;
  label: string;
  remainingCapital: number;
  rate: number;
  remainingMonths: number;
  startMonth?: number;          // mois depuis début projet (défaut 1)
}

export interface LoanInstallment {
  monthIndex: number;
  year: number;
  openingBalance: number;
  interest: number;
  taf: number;
  principal: number;
  totalPayment: number;
  closingBalance: number;
}

export interface LoanAnnualAggregate {
  year: number;
  interest: number;
  taf: number;
  principal: number;
  totalPayment: number;
  closingBalance: number;
}

export interface LoanResult {
  config: { id: string; label: string };
  installments: LoanInstallment[];
  annual: LoanAnnualAggregate[];
  totalInterest: number;
  totalTAF: number;
  totalPayment: number;
}

// Helpers
export function applyScenario(value: number, scenario: Scenario): number {
  return value * SCENARIO_COEFS[scenario];
}

export function getTaxRate(sectorCode: string): number {
  const c = sectorCode.toLowerCase();
  if (c === 'aviculture' || c === 'elevage' || c === 'elevage-autre' || c === 'agriculture') {
    return 0;
  }
  if (c === 'agro-industrie' || c === 'transformation-agro' || c === 'anacarde') {
    return 0.25;
  }
  return 0.30;
}
