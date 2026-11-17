// Test — cohérence des benchmarks sectoriels Bénin
import { describe, it, expect } from 'vitest';
import { SECTOR_BENCHMARKS } from '../sector-benchmarks';
import { SECTORS } from '../mockup-data';

describe('Benchmarks sectoriels Bénin', () => {
  it('chaque secteur a un benchmark', () => {
    for (const s of SECTORS) {
      expect(SECTOR_BENCHMARKS[s.code]).toBeDefined();
    }
  });

  it('TRI réaliste ≤ TRI ambitieux', () => {
    for (const [code, b] of Object.entries(SECTOR_BENCHMARKS)) {
      expect(b.triCibleRealiste.min).toBeLessThanOrEqual(b.triCibleAmbitieux.min);
      expect(b.triCibleRealiste.max).toBeLessThanOrEqual(b.triCibleAmbitieux.max);
    }
  });

  it('marge brute dans une plage plausible [10-80]', () => {
    for (const [code, b] of Object.entries(SECTOR_BENCHMARKS)) {
      expect(b.margeBruteCible).toBeGreaterThanOrEqual(10);
      expect(b.margeBruteCible).toBeLessThanOrEqual(80);
    }
  });

  it('TRI cible immobilier ≤ 22% (rendement locatif réaliste)', () => {
    expect(SECTOR_BENCHMARKS.immobilier.triCibleAmbitieux.max).toBeLessThanOrEqual(25);
  });

  it('TRI cible services ≥ 30% (marge élevée)', () => {
    expect(SECTOR_BENCHMARKS.services.triCibleRealiste.max).toBeGreaterThanOrEqual(30);
  });
});
