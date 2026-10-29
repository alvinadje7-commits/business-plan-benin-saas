import { describe, it, expect } from 'vitest';
import { computeLoanSchedule, computeExistingCreditSchedule, computeDSCR } from '../financing-engine';
import type { LoanConfig } from '../../types/financial';

describe('loan schedule', () => {
  it('mensualité : 10M, 3.5%, 5 ans, sans différé', () => {
    const cfg: LoanConfig = {
      id: 'inv', label: 'Invest', capital: 10_000_000,
      rate: 0.035, taf: 0, maturityYears: 5,
      periodicity: 'MENSUALITE', deferralMonths: 0, startYear: 1,
    };
    const r = computeLoanSchedule(cfg, 7);
    expect(r.installments.length).toBe(60);
    expect(r.installments[0].interest).toBeCloseTo(29166.67, 0);
    expect(r.installments[59].closingBalance).toBeCloseTo(0, 0);
  });

  it('différé partiel : intérêts payés, principal = 0', () => {
    const cfg: LoanConfig = {
      id: 'inv', label: 'Invest', capital: 10_000_000,
      rate: 0.05, taf: 0, maturityYears: 5,
      periodicity: 'MENSUALITE', deferralMonths: 12, startYear: 1,
    };
    const r = computeLoanSchedule(cfg, 7);
    // Mois 1..12 : principal = 0
    for (let i = 0; i < 12; i++) {
      expect(r.installments[i].principal).toBe(0);
      expect(r.installments[i].interest).toBeGreaterThan(0);
    }
  });

  it('TAF ajouté aux intérêts', () => {
    const cfg: LoanConfig = {
      id: 'inv', label: 'Invest', capital: 1_000_000,
      rate: 0.05, taf: 0.02, maturityYears: 3,
      periodicity: 'MENSUALITE', deferralMonths: 0, startYear: 1,
    };
    const r = computeLoanSchedule(cfg, 3);
    expect(r.totalTAF).toBeGreaterThan(0);
    expect(r.totalTAF).toBeLessThan(r.totalInterest);
  });

  it('encours existant : soldé à terme', () => {
    const r = computeExistingCreditSchedule(
      { id: 'enc', label: 'Encours', remainingCapital: 5_000_000,
        rate: 0.04, remainingMonths: 24 }, 7
    );
    expect(r.installments.length).toBe(24);
    expect(r.installments[23].closingBalance).toBeCloseTo(0, 0);
  });

  it('DSCR = CAF / service de la dette', () => {
    const dscr = computeDSCR(
      [100, 200],
      { interest: [20, 20], taf: [5, 5], principal: [25, 25] }
    );
    expect(dscr[0]).toBeCloseTo(100 / 50, 5);
    expect(dscr[1]).toBeCloseTo(200 / 50, 5);
  });
});
