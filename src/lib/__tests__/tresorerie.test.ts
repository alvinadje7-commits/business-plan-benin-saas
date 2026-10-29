import { describe, it, expect } from 'vitest';
import { computeTresorerie, spreadAnnualToMonthly } from '../tresorerie';

const zeros = (n: number) => new Array(n).fill(0);

describe('Trésorerie', () => {
  it('solde final = solde initial + flux net', () => {
    const n = 12;
    const input = {
      durationYears: 1, soldeInitial: 1_000_000,
      caTtcMonthly: [100_000, ...zeros(n - 1)],
      apportsCapital: zeros(n), empruntMT: zeros(n), empruntCT: zeros(n),
      subvention: zeros(n), autresEncaissements: zeros(n),
      delaiClientsJours: 0,
      investissements: zeros(n), achatsVariablesTtcMonthly: zeros(n),
      chargesExternes: zeros(n), salaires: zeros(n), impotsTaxes: zeros(n),
      delaiFournisseursJours: 0,
      remboursementMT: zeros(n), interetsMT: zeros(n), tafMT: zeros(n),
      remboursementCT: zeros(n), interetsCT: zeros(n), tafCT: zeros(n),
      impotResultatAnnuel: [0],
    };
    const r = computeTresorerie(input);
    expect(r.soldeFinal).toBe(1_100_000);
    expect(r.months[0].soldeFin).toBe(1_100_000);
    expect(r.months[11].soldeFin).toBe(1_100_000);
  });

  it('délai clients 30j → encaissement décalé au mois suivant', () => {
    const n = 12;
    const ca = zeros(n); ca[0] = 100_000;
    const input = {
      durationYears: 1, soldeInitial: 0,
      caTtcMonthly: ca, apportsCapital: zeros(n), empruntMT: zeros(n), empruntCT: zeros(n),
      subvention: zeros(n), autresEncaissements: zeros(n), delaiClientsJours: 30,
      investissements: zeros(n), achatsVariablesTtcMonthly: zeros(n),
      chargesExternes: zeros(n), salaires: zeros(n), impotsTaxes: zeros(n),
      delaiFournisseursJours: 0,
      remboursementMT: zeros(n), interetsMT: zeros(n), tafMT: zeros(n),
      remboursementCT: zeros(n), interetsCT: zeros(n), tafCT: zeros(n),
      impotResultatAnnuel: [0],
    };
    const r = computeTresorerie(input);
    expect(r.months[0].encaissements.clients).toBe(0);
    expect(r.months[1].encaissements.clients).toBe(100_000);
  });

  it('impôt résultat payé au mois 12', () => {
    const n = 12;
    const input = {
      durationYears: 1, soldeInitial: 0,
      caTtcMonthly: zeros(n), apportsCapital: zeros(n), empruntMT: zeros(n), empruntCT: zeros(n),
      subvention: zeros(n), autresEncaissements: zeros(n), delaiClientsJours: 0,
      investissements: zeros(n), achatsVariablesTtcMonthly: zeros(n),
      chargesExternes: zeros(n), salaires: zeros(n), impotsTaxes: zeros(n),
      delaiFournisseursJours: 0,
      remboursementMT: zeros(n), interetsMT: zeros(n), tafMT: zeros(n),
      remboursementCT: zeros(n), interetsCT: zeros(n), tafCT: zeros(n),
      impotResultatAnnuel: [500_000],
    };
    const r = computeTresorerie(input);
    expect(r.months[0].decaissements.impotResultat).toBe(0);
    expect(r.months[11].decaissements.impotResultat).toBe(500_000);
  });

  it('spreadAnnualToMonthly', () => {
    const r = spreadAnnualToMonthly([1200, 2400], 2);
    expect(r.length).toBe(24);
    expect(r[0]).toBe(100);
    expect(r[12]).toBe(200);
  });
});
