// ============================================================
// Tests saisonnalité universelle (computeFinancialResult)
// Vérifie que les 12 coefficients pilotent CR + trésorerie
// ============================================================
import { describe, it, expect } from 'vitest';
import { computeFinancialResult } from '../financial-statements-engine';
import { DEFAULT_HYPOTHESES, DEFAULT_INVESTMENTS, DEFAULT_FINANCEMENT } from '../../types/project';

const sectorCode = 'commerce';
const tauxActu = 0.06;
const duree = 3;

function buildHyp(saison: number[]) {
  return { ...DEFAULT_HYPOTHESES, caMensuel: 10_000_000, pctAchats: 55, saisonnalite: saison };
}

describe('Saisonnalité — neutralité [1,1,...]', () => {
  it('CA annuel = caMensuel × 12', () => {
    const h = buildHyp(Array(12).fill(1));
    const { cr } = computeFinancialResult(h, DEFAULT_INVESTMENTS, DEFAULT_FINANCEMENT, sectorCode, tauxActu, duree);
    expect(cr[0].ca).toBeCloseTo(120_000_000, -2);
  });

  it('Trésorerie : 12 mois identiques', () => {
    const h = buildHyp(Array(12).fill(1));
    const { tresorerie } = computeFinancialResult(h, DEFAULT_INVESTMENTS, DEFAULT_FINANCEMENT, sectorCode, tauxActu, duree);
    const enc0 = tresorerie[0].encaissements;
    for (const t of tresorerie) {
      expect(t.encaissements).toBeCloseTo(enc0, 0);
    }
  });
});

describe('Saisonnalité — moyenne 1 (variations sans effet sur CA annuel)', () => {
  it('CA annuel inchangé si moyenne(saison) = 1', () => {
    const hNeutre = buildHyp(Array(12).fill(1));
    // Saisonnalité forte mais moy = 1 exacte
    const hForte = buildHyp([0.5, 0.5, 0.7, 1.0, 1.2, 1.4, 1.5, 1.4, 1.2, 1.0, 0.8, 0.8]);
    const rNeutre = computeFinancialResult(hNeutre, DEFAULT_INVESTMENTS, DEFAULT_FINANCEMENT, sectorCode, tauxActu, duree);
    const rForte = computeFinancialResult(hForte, DEFAULT_INVESTMENTS, DEFAULT_FINANCEMENT, sectorCode, tauxActu, duree);
    expect(rForte.cr[0].ca).toBeCloseTo(rNeutre.cr[0].ca, -2);
  });

  it('Trésorerie : janvier (0.5) < juillet (1.5)', () => {
    const h = buildHyp([0.5, 0.5, 0.7, 1.0, 1.2, 1.4, 1.5, 1.4, 1.2, 1.0, 0.8, 0.8]);
    const { tresorerie } = computeFinancialResult(h, DEFAULT_INVESTMENTS, DEFAULT_FINANCEMENT, sectorCode, tauxActu, duree);
    expect(tresorerie[0].encaissements).toBeLessThan(tresorerie[6].encaissements);
  });
});

describe('Saisonnalité — moyenne ≠ 1 (impacte le CA annuel)', () => {
  it('[1.2]*12 → CA × 1.2', () => {
    const hNeutre = buildHyp(Array(12).fill(1));
    const hHausse = buildHyp(Array(12).fill(1.2));
    const rN = computeFinancialResult(hNeutre, DEFAULT_INVESTMENTS, DEFAULT_FINANCEMENT, sectorCode, tauxActu, duree);
    const rH = computeFinancialResult(hHausse, DEFAULT_INVESTMENTS, DEFAULT_FINANCEMENT, sectorCode, tauxActu, duree);
    expect(rH.cr[0].ca).toBeCloseTo(rN.cr[0].ca * 1.2, -2);
  });
});
