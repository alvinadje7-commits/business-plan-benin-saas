// ============================================================
// Pattern A — Multi-bandes / cycles décalés
// Aviculture, Élevage autre, Agro-industrie, Anacarde, Transformation
//
// Logique fidèle au modèle SCSA :
//  - N lignes de production parallèles (bandes)
//  - Espacement entre lancements = lineSpacingMonths (6 mois typique)
//  - Chaque bande parcourt N phases (Poussins → Poulettes → Ponte → Reformes)
//  - Mortalité cumulée par phase
//  - Production d'œufs seulement en phase Ponte
//  - Poulets reformés seulement en phase Reformes
// ============================================================
import type {
  ProductionContext, ProductionModel, CostLine,
  MonthlyQuantities, TechnicalSheetLine, SectorKPI,
} from './types';
import { num } from './types';

interface BandPhaseConfig {
  name: string;
  startMonth: number;       // 1-indexed dans le cycle
  durationMonths: number;
  alimentKgPerSubject: number;
  phytoKgPerSubject: number;
  fientesKgPerSubject: number;
  mortalityRate: number;    // cumulée sur la phase
  ponteRate: number;        // 0 si pas de ponte
}

interface BatchConfig {
  nbLines: number;
  lineSpacingMonths: number;
  cycleLengthMonths: number;
  lineInitialQuantity: number[];
  phases: BandPhaseConfig[];
  prixPlateau: number;
  prixPoulet: number;
  prixFientesSac: number;
  coutPlateauVide: number;
  coutSacFientes: number;
  coutAlimentKg: number;
  coutPhytoKg: number;
  nbOeufsParPlateau: number;
  tauxCasse: number;
}

const DEFAULT_PHASES: BandPhaseConfig[] = [
  { name: 'Poussins',  startMonth: 1,  durationMonths: 2,  alimentKgPerSubject: 0.5, phytoKgPerSubject: 0.001,  fientesKgPerSubject: 0.1667, mortalityRate: 0.02,  ponteRate: 0 },
  { name: 'Poulettes', startMonth: 3,  durationMonths: 3,  alimentKgPerSubject: 0.8, phytoKgPerSubject: 0.0016, fientesKgPerSubject: 0.2667, mortalityRate: 0.015, ponteRate: 0 },
  { name: 'Ponte',     startMonth: 6,  durationMonths: 12, alimentKgPerSubject: 3.3, phytoKgPerSubject: 0.0066, fientesKgPerSubject: 1.1,    mortalityRate: 0.01,  ponteRate: 0.85 },
  { name: 'Reformes',  startMonth: 18, durationMonths: 1,  alimentKgPerSubject: 3.3, phytoKgPerSubject: 0.0066, fientesKgPerSubject: 1.1,    mortalityRate: 0.005, ponteRate: 0 },
];

function readConfig(ctx: ProductionContext): BatchConfig {
  const nbLines = Math.max(1, Math.round(num(ctx, 'nbBatiments', 1)));
  const q1 = num(ctx, 'capaciteBatiment1', num(ctx, 'quantiteInitiale', 1000));
  const q2 = num(ctx, 'capaciteBatiment2', q1);
  const q3 = num(ctx, 'capaciteBatiment3', q2);
  const allQ = [q1, q2, q3];
  const lineInitialQuantity = allQ.slice(0, nbLines);
  while (lineInitialQuantity.length < nbLines) lineInitialQuantity.push(q1);

  return {
    nbLines,
    lineSpacingMonths: Math.max(1, Math.round(num(ctx, 'frequenceLancement', 6))),
    cycleLengthMonths: 18,
    lineInitialQuantity,
    phases: DEFAULT_PHASES,
    prixPlateau: num(ctx, 'prixPlateauOeuf', 2000),
    prixPoulet: num(ctx, 'prixPouletReforme', 2500),
    prixFientesSac: num(ctx, 'prixFientes', 1000),
    coutPlateauVide: num(ctx, 'coutPlateauVide', 55),
    coutSacFientes: num(ctx, 'coutSacFientes', 40),
    coutAlimentKg: num(ctx, 'coutAlimentKg', 397),
    coutPhytoKg: num(ctx, 'coutPhytoKg', 5500),
    nbOeufsParPlateau: 30,
    tauxCasse: num(ctx, 'tauxCasseOeufs', 0.01),
  };
}

interface BandProduction {
  eggsMonthly: number[];
  pouletsMonthly: number[];
  fientesKgMonthly: number[];
  alimentKgMonthly: number[];
  phytoKgMonthly: number[];
  aliveMonthly: number[];
}

function computeBandProduction(cfg: BatchConfig, totalMonths: number): BandProduction {
  const r: BandProduction = {
    eggsMonthly: new Array(totalMonths).fill(0),
    pouletsMonthly: new Array(totalMonths).fill(0),
    fientesKgMonthly: new Array(totalMonths).fill(0),
    alimentKgMonthly: new Array(totalMonths).fill(0),
    phytoKgMonthly: new Array(totalMonths).fill(0),
    aliveMonthly: new Array(totalMonths).fill(0),
  };

  for (let line = 0; line < cfg.nbLines; line++) {
    const lineOffset = line * cfg.lineSpacingMonths;
    const initialQty = cfg.lineInitialQuantity[line] ?? 0;
    if (initialQty <= 0) continue;

    for (let cycle = 0; lineOffset + cycle * cfg.cycleLengthMonths < totalMonths; cycle++) {
      const cycleStart = lineOffset + cycle * cfg.cycleLengthMonths;
      let alive = initialQty;

      for (const phase of cfg.phases) {
        const phaseStartAbs = cycleStart + phase.startMonth - 1;
        for (let k = 0; k < phase.durationMonths; k++) {
          const absMonth = phaseStartAbs + k;
          if (absMonth < 0 || absMonth >= totalMonths) continue;

          r.aliveMonthly[absMonth] += alive;
          r.alimentKgMonthly[absMonth] += alive * phase.alimentKgPerSubject;
          r.phytoKgMonthly[absMonth] += alive * phase.phytoKgPerSubject;
          r.fientesKgMonthly[absMonth] += alive * phase.fientesKgPerSubject;

          if (phase.ponteRate > 0) {
            r.eggsMonthly[absMonth] += alive * phase.ponteRate * 30 * (1 - cfg.tauxCasse);
          }
          if (phase.name === 'Reformes') {
            r.pouletsMonthly[absMonth] += alive;
          }
        }
        alive = alive * (1 - phase.mortalityRate);
      }
    }
  }
  return r;
}

function build(): ProductionModel {
  return {
    computeMonthlyRevenue(ctx) {
      const totalMonths = ctx.durationYears * 12;
      const cfg = readConfig(ctx);
      const p = computeBandProduction(cfg, totalMonths);
      const out: number[] = [];
      for (let m = 0; m < totalMonths; m++) {
        const plateaux = p.eggsMonthly[m] / cfg.nbOeufsParPlateau;
        const sacsFientes = p.fientesKgMonthly[m] / 50;
        out.push(
          plateaux * cfg.prixPlateau
          + p.pouletsMonthly[m] * cfg.prixPoulet
          + sacsFientes * cfg.prixFientesSac
        );
      }
      return out;
    },

    computeMonthlyVariableCosts(ctx): CostLine[] {
      const totalMonths = ctx.durationYears * 12;
      const cfg = readConfig(ctx);
      const p = computeBandProduction(cfg, totalMonths);
      const plateaux = p.eggsMonthly.map((e) => e / cfg.nbOeufsParPlateau);
      const sacs = p.fientesKgMonthly.map((kg) => kg / 50);
      return [
        { key: 'aliments',   label: 'Aliments',               values: p.alimentKgMonthly.map((kg) => kg * cfg.coutAlimentKg) },
        { key: 'phyto',      label: 'Produits phytosanitaires', values: p.phytoKgMonthly.map((kg) => kg * cfg.coutPhytoKg) },
        { key: 'plateaux',   label: 'Plateaux vides',          values: plateaux.map((pl) => pl * cfg.coutPlateauVide) },
        { key: 'emballages', label: 'Sacs fientes',            values: sacs.map((s) => s * cfg.coutSacFientes) },
      ];
    },

    computeMonthlyQuantities(ctx): MonthlyQuantities {
      const totalMonths = ctx.durationYears * 12;
      const cfg = readConfig(ctx);
      const p = computeBandProduction(cfg, totalMonths);
      return {
        'Plateaux d\'œufs':     p.eggsMonthly.map((e) => e / cfg.nbOeufsParPlateau),
        'Poulets reformés':     p.pouletsMonthly,
        'Fientes (sacs 50kg)':  p.fientesKgMonthly.map((kg) => kg / 50),
        'Aliments (kg)':        p.alimentKgMonthly,
        'Sujets vivants':       p.aliveMonthly,
      };
    },

    getTechnicalSheet(ctx): TechnicalSheetLine[] {
      const cfg = readConfig(ctx);
      return [
        { label: 'Lignes de production',       value: `${cfg.nbLines}` },
        { label: 'Espacement entre bandes',    value: `${cfg.lineSpacingMonths} mois` },
        { label: 'Durée du cycle',             value: `${cfg.cycleLengthMonths} mois` },
        { label: 'Effectif initial',           value: cfg.lineInitialQuantity.join(' / ') },
        { label: 'Prix plateau d\'œufs',       value: `${cfg.prixPlateau} FCFA` },
        { label: 'Prix poulet reformé',        value: `${cfg.prixPoulet} FCFA` },
        { label: 'Prix sac fientes (50kg)',    value: `${cfg.prixFientesSac} FCFA` },
        { label: 'Coût aliment',               value: `${cfg.coutAlimentKg} FCFA/kg` },
        { label: 'Taux de casse',              value: `${(cfg.tauxCasse * 100).toFixed(2)} %` },
      ];
    },

    getSectorKPIs(ctx): SectorKPI[] {
      const totalMonths = ctx.durationYears * 12;
      const cfg = readConfig(ctx);
      const p = computeBandProduction(cfg, totalMonths);
      const totalEggs = p.eggsMonthly.reduce((s, e) => s + e, 0);
      const totalPlateaux = totalEggs / cfg.nbOeufsParPlateau;
      const totalPoulets = p.pouletsMonthly.reduce((s, v) => s + v, 0);
      return [
        { label: 'Plateaux cumulés',          value: Math.round(totalPlateaux),                   unit: 'plateaux',      hint: 'Sur la durée d\'étude' },
        { label: 'Poulets reformés cumulés',  value: Math.round(totalPoulets),                    unit: 'sujets' },
        { label: 'Production moyenne / mois', value: Math.round(totalPlateaux / totalMonths),     unit: 'plateaux/mois' },
      ];
    },
  };
}

export const batchModel: ProductionModel = build();
