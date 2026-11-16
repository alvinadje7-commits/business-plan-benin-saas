// ============================================================
// Aviculture — POULE PONDEUSE
// Cycle 18 sem croissance + 60 sem ponte + 1 mois réforme
// Lit les champs pondeuse (tauxPonteMoyen, prixPlateau30, etc.)
// ============================================================
import type {
  ProductionContext, ProductionModel, CostLine, MonthlyQuantities,
  TechnicalSheetLine, SectorKPI,
} from './types';
import { num } from './types';

interface PondeuseConfig {
  effectif: number;
  dureeCroissanceSem: number;
  dureePonteSem: number;
  tauxPonteMoyen: number;
  prixPlateau30: number;
  prixReformeKg: number;
  consoAlimentJourG: number;
  coutPlateauxParPoule: number;
  tauxCasseePct: number;
  mortalite: number;
  prixAlim: number;
  vaccins: number;
  autorisationSanitaire: number;
}

function readConfig(ctx: ProductionContext): PondeuseConfig {
  return {
    effectif: num(ctx, 'effectif', 5000),
    dureeCroissanceSem: num(ctx, 'dureeCroissanceSem', 18),
    dureePonteSem: num(ctx, 'dureePonteSem', 60),
    tauxPonteMoyen: num(ctx, 'tauxPonteMoyen', 80) / 100,
    prixPlateau30: num(ctx, 'prixPlateau30', 2200),
    prixReformeKg: num(ctx, 'prixReformeKg', 2000),
    consoAlimentJourG: num(ctx, 'consoAlimentJourG', 115),
    coutPlateauxParPoule: num(ctx, 'coutPlateauxParPoule', 120),
    tauxCasseePct: num(ctx, 'tauxCasseePct', 3) / 100,
    mortalite: num(ctx, 'mortalite', 5) / 100,
    prixAlim: num(ctx, 'prixAlim', 400),
    vaccins: num(ctx, 'vaccins', 150),
    autorisationSanitaire: num(ctx, 'autorisationSanitaire', 100000),
  };
}

interface Monthly {
  eggs: number[];
  plateaux: number[];
  reformes: number[];
  alimentKg: number[];
  poulettesBought: number[];
  vaccinsCost: number[];
  plateauxCost: number[];
  alive: number[];
}

function computeMonthly(cfg: PondeuseConfig, totalMonths: number): Monthly {
  const r: Monthly = {
    eggs: new Array(totalMonths).fill(0),
    plateaux: new Array(totalMonths).fill(0),
    reformes: new Array(totalMonths).fill(0),
    alimentKg: new Array(totalMonths).fill(0),
    poulettesBought: new Array(totalMonths).fill(0),
    vaccinsCost: new Array(totalMonths).fill(0),
    plateauxCost: new Array(totalMonths).fill(0),
    alive: new Array(totalMonths).fill(0),
  };

  const croissanceMonths = Math.max(1, Math.round(cfg.dureeCroissanceSem / 4.33));
  const ponteMonths = Math.max(1, Math.round(cfg.dureePonteSem / 4.33));
  const cycleMonths = croissanceMonths + ponteMonths + 1;

  const monthlyMortality = 1 - Math.pow(1 - cfg.mortalite, 1 / cycleMonths);

  for (let cycleStart = 0; cycleStart < totalMonths; cycleStart += cycleMonths) {
    if (cycleStart < totalMonths) {
      r.poulettesBought[cycleStart] += cfg.effectif;
      r.vaccinsCost[cycleStart] += cfg.effectif * cfg.vaccins;
    }
    let alive = cfg.effectif;
    // Croissance
    for (let m = 0; m < croissanceMonths; m++) {
      const abs = cycleStart + m;
      if (abs >= totalMonths) break;
      r.alive[abs] += alive;
      r.alimentKg[abs] += alive * (cfg.consoAlimentJourG / 1000 * 0.55 * 30);
      alive *= (1 - monthlyMortality);
    }
    // Ponte
    for (let m = 0; m < ponteMonths; m++) {
      const abs = cycleStart + croissanceMonths + m;
      if (abs >= totalMonths) break;
      r.alive[abs] += alive;
      r.alimentKg[abs] += alive * (cfg.consoAlimentJourG / 1000 * 30);
      const eggs = alive * cfg.tauxPonteMoyen * 30 * (1 - cfg.tauxCasseePct);
      r.eggs[abs] += eggs;
      r.plateaux[abs] += eggs / 30;
      r.plateauxCost[abs] += alive * (cfg.coutPlateauxParPoule / ponteMonths);
      alive *= (1 - monthlyMortality);
    }
    // Réforme
    const reformeAbs = cycleStart + croissanceMonths + ponteMonths;
    if (reformeAbs < totalMonths) {
      r.reformes[reformeAbs] += alive;
    }
  }
  return r;
}

export const pondeuseModel: ProductionModel = {
  computeMonthlyRevenue(ctx) {
    const cfg = readConfig(ctx);
    const m = computeMonthly(cfg, ctx.durationYears * 12);
    const out: number[] = [];
    for (let i = 0; i < m.plateaux.length; i++) {
      out.push(m.plateaux[i] * cfg.prixPlateau30 + m.reformes[i] * 2.0 * cfg.prixReformeKg);
    }
    return out;
  },
  computeMonthlyVariableCosts(ctx): CostLine[] {
    const cfg = readConfig(ctx);
    const m = computeMonthly(cfg, ctx.durationYears * 12);
    return [
      { key: 'poulettes', label: 'Poulettes',              values: m.poulettesBought.map((n) => n * 4500) },
      { key: 'aliments',  label: 'Aliments ponte',         values: m.alimentKg.map((kg) => kg * cfg.prixAlim) },
      { key: 'vaccins',   label: 'Vaccins & vétérinaires', values: m.vaccinsCost },
      { key: 'plateaux',  label: 'Plateaux & alvéoles',    values: m.plateauxCost },
    ];
  },
  computeMonthlyQuantities(ctx): MonthlyQuantities {
    const m = computeMonthly(readConfig(ctx), ctx.durationYears * 12);
    return {
      "Plateaux d'œufs": m.plateaux,
      'Poulets réformés': m.reformes,
      'Aliments (kg)': m.alimentKg,
      'Sujets vivants': m.alive,
    };
  },
  getTechnicalSheet(ctx): TechnicalSheetLine[] {
    const cfg = readConfig(ctx);
    return [
      { label: 'Durée croissance',   value: `${cfg.dureeCroissanceSem} sem` },
      { label: 'Durée ponte',        value: `${cfg.dureePonteSem} sem` },
      { label: 'Taux de ponte',      value: `${(cfg.tauxPonteMoyen * 100).toFixed(0)} %` },
      { label: 'Effectif',           value: `${cfg.effectif}` },
      { label: 'Prix plateau 30',    value: `${cfg.prixPlateau30} FCFA` },
      { label: 'Prix réforme / kg',  value: `${cfg.prixReformeKg} FCFA` },
      { label: 'Conso aliment',      value: `${cfg.consoAlimentJourG} g/j` },
      { label: 'Œufs cassés',        value: `${(cfg.tauxCasseePct * 100).toFixed(1)} %` },
    ];
  },
  getSectorKPIs(ctx): SectorKPI[] {
    const cfg = readConfig(ctx);
    const oeufsParPoule = cfg.dureePonteSem * 7 * cfg.tauxPonteMoyen;
    const caOeufsParPoule = (oeufsParPoule / 30) * cfg.prixPlateau30;
    return [
      { label: 'Taux de ponte',    value: (cfg.tauxPonteMoyen * 100).toFixed(0), unit: '%', hint: 'moyen' },
      { label: 'Œufs / poule / an', value: Math.round(oeufsParPoule), unit: 'œufs', hint: 'sur cycle' },
      { label: 'CA œufs / poule',  value: Math.round(caOeufsParPoule), unit: 'FCFA' },
      { label: 'Œufs cassés',      value: (cfg.tauxCasseePct * 100).toFixed(1), unit: '%' },
    ];
  },
};
