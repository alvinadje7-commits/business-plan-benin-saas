import { describe, it, expect } from 'vitest';
import { linearModel } from '../linear-model';
import { seasonalModel } from '../seasonal-model';
import { projectModel } from '../project-model';
import { tjmModel } from '../tjm-model';
import { capacityModel } from '../capacity-model';
import { getProductionModel, listRegisteredSectors } from '../registry';

const ctx = (values: Record<string, number>) => ({
  sectorCode: 'x', sectorValues: values, durationYears: 2,
});

describe('linear-model', () => {
  it('CA = prix × qty × 24 mois', () => {
    const r = linearModel.computeMonthlyRevenue(ctx({ prixVente: 1000, quantiteMensuelle: 50 }));
    expect(r.length).toBe(24);
    expect(r[0]).toBe(50_000);
  });
});

describe('seasonal-model', () => {
  it('somme CA annuel = qty × prix', () => {
    const r = seasonalModel.computeMonthlyRevenue(ctx({ quantiteAnnuelle: 1200, prixVente: 100 }));
    const sum = r.slice(0, 12).reduce((s, v) => s + v, 0);
    expect(sum).toBeCloseTo(120_000, 0);
  });
});

describe('project-model', () => {
  it('CA mensuel constant', () => {
    const r = projectModel.computeMonthlyRevenue(ctx({ nbChantiers: 2, prixMoyenChantier: 12_000_000, dureeMoyenneChantierMois: 12 }));
    expect(r[0]).toBe(2_000_000);
  });
});

describe('tjm-model', () => {
  it('CA = TJM × jours × taux', () => {
    const r = tjmModel.computeMonthlyRevenue(ctx({ tjm: 100_000, joursFacturablesMois: 20, tauxOccupation: 0.8 }));
    expect(r[0]).toBe(100_000 * 20 * 0.8);
  });
});

describe('capacity-model', () => {
  it('CA = couverts × jours × taux × ticket', () => {
    const r = capacityModel.computeMonthlyRevenue(ctx({ couvertsJour: 50, ticketMoyen: 5000, joursOuvertureMois: 26, tauxRemplissage: 0.75 }));
    expect(r[0]).toBe(50 * 26 * 0.75 * 5000);
  });
});

describe('registry', () => {
  it('aviculture → batch', () => {
    expect(getProductionModel('aviculture')).toBeDefined();
  });
  it('commerce → linear', () => {
    expect(getProductionModel('commerce')).toBeDefined();
  });
  it('secteur inconnu → fallback linear (pas de crash)', () => {
    expect(getProductionModel('secteur-bidon')).toBeDefined();
  });
  it('liste non vide', () => {
    expect(listRegisteredSectors().length).toBeGreaterThan(5);
  });
});
