// ============================================================
// Aviculture — POULE DE CHAIR
// 6 cycles courts (45 jours + vide sanitaire), ventes régulières
// ============================================================
import type {
  ProductionContext, ProductionModel, CostLine, MonthlyQuantities,
  TechnicalSheetLine, SectorKPI,
} from './types';
import { num } from './types';

interface ChairConfig {
  effectif: number;
  cycles: number;
  dureeCycle: number;
  mortalite: number;
  tauxConversion: number;
  consoAlim: number;
  prixAlim: number;
  vaccins: number;
  prixKgVif: number;
  prixKgCarcasse: number;
  partVenteDirecte: number;
  pertesInvendus: number;
  prixPoussin: number;
  litiere: number;
  chauffage: number;
  eau: number;
  emballage: number;
  autorisationSanitaire: number;
}

function readConfig(ctx: ProductionContext): ChairConfig {
  return {
    effectif: num(ctx, 'effectif', 5000),
    cycles: Math.max(1, Math.min(12, Math.round(num(ctx, 'cycles', 6)))),
    dureeCycle: num(ctx, 'dureeCycle', 45),
    mortalite: num(ctx, 'mortalite', 5) / 100,
    tauxConversion: num(ctx, 'tauxConversion', 1.8),
    consoAlim: num(ctx, 'consoAlim', 4.5),
    prixAlim: num(ctx, 'prixAlim', 400),
    vaccins: num(ctx, 'vaccins', 150),
    prixKgVif: num(ctx, 'prixKgVif', 2500),
    prixKgCarcasse: num(ctx, 'prixKgCarcasse', 3500),
    partVenteDirecte: num(ctx, 'partVenteDirecte', 60) / 100,
    pertesInvendus: num(ctx, 'pertesInvendus', 3) / 100,
    prixPoussin: num(ctx, 'prixPoussin', 700),
    litiere: num(ctx, 'litiere', 50000),
    chauffage: num(ctx, 'chauffage', 80000),
    eau: num(ctx, 'eau', 30000),
    emballage: num(ctx, 'emballageTransport', 40000),
    autorisationSanitaire: num(ctx, 'autorisationSanitaire', 100000),
  };
}

interface Monthly {
  sales: number[];
  revenue: number[];
  poussins: number[];
  alimentKg: number[];
  vaccinsCost: number[];
  litiereCost: number[];
  chauffageCost: number[];
  eauCost: number[];
  emballageCost: number[];
  alive: number[];
}

function computeMonthly(cfg: ChairConfig, totalMonths: number): Monthly {
  const r: Monthly = {
    sales: new Array(totalMonths).fill(0),
    revenue: new Array(totalMonths).fill(0),
    poussins: new Array(totalMonths).fill(0),
    alimentKg: new Array(totalMonths).fill(0),
    vaccinsCost: new Array(totalMonths).fill(0),
    litiereCost: new Array(totalMonths).fill(0),
    chauffageCost: new Array(totalMonths).fill(0),
    eauCost: new Array(totalMonths).fill(0),
    emballageCost: new Array(totalMonths).fill(0),
    alive: new Array(totalMonths).fill(0),
  };

  const poidsVif = cfg.tauxConversion > 0 ? cfg.consoAlim / cfg.tauxConversion : 2.2;
  const prixMoyen = cfg.partVenteDirecte * cfg.prixKgCarcasse + (1 - cfg.partVenteDirecte) * cfg.prixKgVif;
  const durationMonths = Math.max(1, Math.round(cfg.dureeCycle / 30));
  const soldPerBand = cfg.effectif * (1 - cfg.mortalite) * (1 - cfg.pertesInvendus);

  for (let i = 0; i < cfg.cycles; i++) {
    const startM = Math.round(i * 12 / cfg.cycles);
    if (startM >= totalMonths) break;
    const endM = Math.min(startM + durationMonths - 1, totalMonths - 1);

    if (startM < totalMonths) {
      r.poussins[startM] += cfg.effectif;
      r.vaccinsCost[startM] += cfg.effectif * cfg.vaccins;
      r.litiereCost[startM] += cfg.litiere;
      r.chauffageCost[startM] += cfg.chauffage;
      r.eauCost[startM] += cfg.eau;
      r.emballageCost[startM] += cfg.emballage;
      r.alimentKg[startM] += cfg.effectif * cfg.consoAlim * 0.6;
      r.alive[startM] += cfg.effectif * (1 - cfg.mortalite * 0.5);
    }
    if (startM + 1 < totalMonths) {
      r.alimentKg[startM + 1] += cfg.effectif * cfg.consoAlim * 0.4;
      r.alive[startM + 1] += cfg.effectif * (1 - cfg.mortalite);
    }
    if (endM >= 0 && endM < totalMonths) {
      r.sales[endM] += soldPerBand;
      r.revenue[endM] += soldPerBand * poidsVif * prixMoyen;
    }
  }
  return r;
}

export const chairModel: ProductionModel = {
  computeMonthlyRevenue(ctx) {
    return computeMonthly(readConfig(ctx), ctx.durationYears * 12).revenue;
  },
  computeMonthlyVariableCosts(ctx): CostLine[] {
    const cfg = readConfig(ctx);
    const m = computeMonthly(cfg, ctx.durationYears * 12);
    return [
      { key: 'poussins',  label: 'Poussins',                 values: m.poussins.map((n) => n * cfg.prixPoussin) },
      { key: 'aliments',  label: 'Aliments',                 values: m.alimentKg.map((kg) => kg * cfg.prixAlim) },
      { key: 'vaccins',   label: 'Vaccins & vétérinaires',   values: m.vaccinsCost },
      { key: 'litiere',   label: 'Litière',                  values: m.litiereCost },
      { key: 'chauffage', label: 'Chauffage & énergie',      values: m.chauffageCost },
      { key: 'eau',       label: 'Eau',                      values: m.eauCost },
      { key: 'emballage', label: 'Emballage & transport',    values: m.emballageCost },
    ];
  },
  computeMonthlyQuantities(ctx): MonthlyQuantities {
    const m = computeMonthly(readConfig(ctx), ctx.durationYears * 12);
    return {
      'Poulets vendus': m.sales,
      'Aliments (kg)': m.alimentKg,
      'Sujets vivants': m.alive,
    };
  },
  getTechnicalSheet(ctx): TechnicalSheetLine[] {
    const cfg = readConfig(ctx);
    const poidsVif = cfg.tauxConversion > 0 ? cfg.consoAlim / cfg.tauxConversion : 2.2;
    return [
      { label: 'Cycles / an',           value: `${cfg.cycles}` },
      { label: 'Durée cycle',           value: `${cfg.dureeCycle} jours` },
      { label: 'Effectif / cycle',      value: `${cfg.effectif}` },
      { label: 'Poids vif estimé',      value: `${poidsVif.toFixed(2)} kg` },
      { label: 'Indice conso (IC)',     value: `${cfg.tauxConversion.toFixed(2)}` },
      { label: 'Prix kg vif',           value: `${cfg.prixKgVif} FCFA` },
      { label: 'Prix kg carcasse',      value: `${cfg.prixKgCarcasse} FCFA` },
      { label: 'Part vente directe',    value: `${(cfg.partVenteDirecte * 100).toFixed(0)} %` },
    ];
  },
  getSectorKPIs(ctx): SectorKPI[] {
    const cfg = readConfig(ctx);
    const poidsVif = cfg.tauxConversion > 0 ? cfg.consoAlim / cfg.tauxConversion : 2.2;
    const prixMoyen = cfg.partVenteDirecte * cfg.prixKgCarcasse + (1 - cfg.partVenteDirecte) * cfg.prixKgVif;
    const soldPerBand = cfg.effectif * (1 - cfg.mortalite) * (1 - cfg.pertesInvendus);
    const caPerBand = soldPerBand * poidsVif * prixMoyen;
    return [
      { label: 'Indice conso', value: cfg.tauxConversion.toFixed(2), unit: 'kg/kg', hint: cfg.tauxConversion <= 1.9 ? '✅ Bon' : '⚠️ À améliorer' },
      { label: 'Poids vif',    value: poidsVif.toFixed(2), unit: 'kg', hint: 'estimé' },
      { label: 'CA / cycle',   value: Math.round(caPerBand), unit: 'FCFA' },
      { label: 'CA annuel',    value: Math.round(caPerBand * cfg.cycles), unit: 'FCFA' },
    ];
  },
};
