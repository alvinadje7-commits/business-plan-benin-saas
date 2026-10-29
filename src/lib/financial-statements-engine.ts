import type {
  Hypotheses, Investment, Financement,
  FinancialResult, YearFinancials, BilanYear, TafireYear,
  TresorerieMois, KPIs, BFRDetail,
} from '../types/project';
import { computeAmortizationTable, totalByYear } from './amortization-engine';
import { computeLoanSchedule } from './financing-engine';
import { computeBFR } from './sig-engine';
import { getTaxRate } from './impots-taxes';

const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

/** Taux d'actualisation par défaut (aligné modèle Excel SCSA/ADPME) */
export const TAUX_ACTU_DEFAULT = 0.06;

/** Horizon par défaut (7 ans = 84 mois, aligné modèle Excel) */
export const HORIZON_DEFAULT = 7;

/* ---------- COMPTE DE RÉSULTAT ---------- */
function computeCR(
  h: Hypotheses,
  inv: Investment[],
  fin: Financement,
  durationYears: number,
  sectorCode: string,
): YearFinancials[] {
  const amortLines = computeAmortizationTable(inv, durationYears);
  const schedule = computeLoanSchedule(fin);
  const taxRate = getTaxRate(sectorCode);
  const result: YearFinancials[] = [];

  let ca = h.caMensuel * 12;
  for (let a = 0; a < durationYears; a++) {
    if (a > 0) {
      const growthA3 = (h as any).croissanceA3 ?? h.croissanceA2;
      const growth = a === 1 ? h.croissanceA2 : growthA3;
      ca *= 1 + growth / 100;
    }

    const achats = ca * (h.pctAchats / 100);
    const marge = ca - achats;
    const chargesExt = ca * (h.pctChargesExt / 100);
    const va = marge - chargesExt;
    const personnel = h.masseSalariale * Math.pow(1.10, a);
    const ebe = va - personnel;
    const dotations = totalByYear(amortLines, a);
    const re = ebe - dotations;
    const chargesFin = schedule[a]?.interets ?? 0;
    const rai = re - chargesFin;
    const is = rai > 0 ? rai * taxRate : 0;
    const rn = rai - is;
    const caf = rn + dotations;

    result.push({
      annee: a + 1, ca, achats, marge, chargesExt, va, personnel,
      ebe, dotations, re, chargesFin, rai, is, rn, caf,
    });
  }
  return result;
}

/* ---------- BILAN ---------- */
function computeBilan(
  cr: YearFinancials[],
  inv: Investment[],
  fin: Financement,
  bfrYears: BFRDetail[],
  durationYears: number,
): BilanYear[] {
  const amortLines = computeAmortizationTable(inv, durationYears);
  const schedule = computeLoanSchedule(fin);
  const totalBrut = inv.reduce((s, i) => s + i.cost, 0);
  const result: BilanYear[] = [];

  let reserves = 0;
  for (let a = 0; a < durationYears; a++) {
    const y = cr[a];
    const amortCumules = amortLines.reduce(
      (sum, l) => sum + l.dotations.slice(0, a + 1).reduce((x, v) => x + v, 0),
      0,
    );
    const immobNettes = totalBrut - amortCumules;
    const bfr = bfrYears[a] ?? { stocks: 0, clients: 0, fournisseurs: 0, bfr: 0 };
    const emprunt = schedule[a]?.capitalFin ?? 0;
    const isDette = y.is;
    const capital = fin.capitalSocial;
    const apportCC = fin.apportCompteCourant;
    const subventions = fin.subventions;
    const rn = y.rn;

    const totalPassif =
      capital + apportCC + subventions + reserves + rn + emprunt + bfr.fournisseurs + isDette;
    const tresorerie = totalPassif - (immobNettes + bfr.stocks + bfr.clients);
    const totalActif = immobNettes + bfr.stocks + bfr.clients + tresorerie;

    result.push({
      annee: a + 1,
      immobBrut: totalBrut, amortCumules, immobNettes,
      stocks: bfr.stocks, clients: bfr.clients, tresorerie, totalActif,
      capital, apportCC, subventions, reserves, rn, emprunt,
      fournisseurs: bfr.fournisseurs, dettesFiscales: isDette,
      totalPassif,
      equilibre: Math.abs(totalActif - totalPassif) < 1000,
    });

    reserves += rn;
  }
  return result;
}

/* ---------- TAFIRE ---------- */
function computeTafire(
  cr: YearFinancials[],
  bilan: BilanYear[],
  fin: Financement,
  durationYears: number,
): TafireYear[] {
  const schedule = computeLoanSchedule(fin);
  const result: TafireYear[] = [];

  for (let a = 0; a < durationYears; a++) {
    const y = cr[a];
    const b = bilan[a];
    const investissements = a === 0 ? b.immobBrut : 0;
    const bfrActuel = b.stocks + b.clients - b.fournisseurs;
    const prevBfr = a === 0 ? 0 : bilan[a - 1].stocks + bilan[a - 1].clients - bilan[a - 1].fournisseurs;
    const variationBFR = bfrActuel - prevBfr;
    const remboursement = schedule[a]?.amortissement ?? 0;
    const apports = a === 0 ? fin.capitalSocial + fin.apportCompteCourant : 0;
    const subventions = a === 0 ? fin.subventions : 0;
    const nouveauxEmprunts = a === 0 ? fin.empruntMontant : 0;

    const totalEmplois = investissements + Math.max(0, variationBFR) + remboursement;
    const totalRessources = y.caf + apports + subventions + nouveauxEmprunts;
    const variationTresorerie = totalRessources - totalEmplois;

    result.push({
      annee: a + 1,
      investissements, variationBFR, remboursement, totalEmplois,
      caf: y.caf, apports, subventions, nouveauxEmprunts, totalRessources,
      variationTresorerie,
    });
  }
  return result;
}

/* ---------- TRÉSORERIE MENSUELLE A1 ---------- */
function computeTresorerie(h: Hypotheses, cr: YearFinancials[]): TresorerieMois[] {
  const y1 = cr[0];
  if (!y1) return [];

  const caMoy = y1.ca / 12;
  const chargesMens = (y1.achats + y1.chargesExt + y1.personnel + y1.chargesFin) / 12;

  const result: TresorerieMois[] = [];
  let cumul = 0;

  for (let m = 0; m < 12; m++) {
    const coeff = h.saisonnalite[m] ?? 1;
    const encaissements = caMoy * coeff;
    const decaissements = chargesMens;
    const soldeMensuel = encaissements - decaissements;
    cumul += soldeMensuel;
    result.push({
      mois: MOIS_LABELS[m],
      encaissements: Math.round(encaissements),
      decaissements: Math.round(decaissements),
      soldeMensuel: Math.round(soldeMensuel),
      soldeCumule: Math.round(cumul),
    });
  }
  return result;
}

/* ---------- IRR (TRI) par bisection ---------- */
function computeIRR(flows: number[]): number {
  let lo = -0.99, hi = 5, mid = 0;
  const npv = (r: number) => flows.reduce((s, f, t) => s + f / Math.pow(1 + r, t), 0);
  if (npv(lo) * npv(hi) > 0) return 0;
  for (let i = 0; i < 200; i++) {
    mid = (lo + hi) / 2;
    if (npv(mid) > 0) lo = mid; else hi = mid;
  }
  return mid;
}

/* ---------- KPIs ---------- */
function computeKPIs(
  cr: YearFinancials[],
  inv: Investment[],
  fin: Financement,
  bfrYears: BFRDetail[],
  durationYears: number,
  tauxActu: number,
): KPIs {
  const investInit = inv.reduce((s, i) => s + i.cost, 0);

  // VNC de fin de projet = Valeur Résiduelle Nette d'Impôts (VRNI)
  const amortLines = computeAmortizationTable(inv, durationYears);
  const amortCumul = amortLines.reduce(
    (sum, l) => sum + l.dotations.reduce((x, v) => x + v, 0),
    0,
  );
  const vnci = Math.max(0, investInit - amortCumul);

  // Free Cash Flows
  // fcf[0] = -investInit (t=0)
  // fcf[a+1] = EBE(a) - IS(a) - ΔBFR(a) + VRNI (si dernier)
  const fcf: number[] = [-investInit];
  for (let a = 0; a < durationYears; a++) {
    const ebe = cr[a].ebe;
    const is = cr[a].is;
    const bfrA = bfrYears[a]?.bfr ?? 0;
    const bfrPrev = a === 0 ? 0 : (bfrYears[a - 1]?.bfr ?? 0);
    const dbfr = bfrA - bfrPrev;
    const vnciYear = a === durationYears - 1 ? vnci : 0;
    fcf.push(ebe - is - dbfr + vnciYear);
  }

  // VAN
  const van = fcf.reduce((s, f, t) => s + f / Math.pow(1 + tauxActu, t), 0);

  // TRI
  const tri = computeIRR(fcf) * 100;

  // DRCI sur FCF cumulés
  let cumul = 0;
  let delai = durationYears * 12;
  for (let a = 0; a < fcf.length; a++) {
    const prev = cumul;
    cumul += fcf[a];
    if (prev < 0 && cumul >= 0) {
      const fraction = -prev / fcf[a];
      delai = a * 12 + fraction * 12;
      break;
    }
  }

  // DSCR année 1 (CFADS / Annuité)
  const schedule = computeLoanSchedule(fin);
  const annuiteA1 = schedule[0]?.annuite ?? 0;
  const cfadsA1 = cr[0].ebe - cr[0].is - (bfrYears[0]?.bfr ?? 0);
  const dscr = annuiteA1 > 0 ? cfadsA1 / annuiteA1 : 0;

  // Marge nette
  const margeNette = cr[0].ca > 0 ? (cr[0].rn / cr[0].ca) * 100 : 0;

  // Seuil de rentabilité
  const chargesFixes = cr[0].personnel + cr[0].dotations + cr[0].chargesFin + cr[0].chargesExt;
  const tauxMarge = cr[0].ca > 0 ? cr[0].marge / cr[0].ca : 0;
  const seuil = tauxMarge > 0 ? chargesFixes / tauxMarge : 0;

  return {
    van, tri,
    delaiRecupMois: Math.round(delai),
    dscr,
    margeNette,
    seuilRentabilite: Math.round(seuil),
  };
}

/* ---------- ORCHESTRATEUR ---------- */
export function computeFinancialResult(
  h: Hypotheses,
  inv: Investment[],
  fin: Financement,
  sectorCode: string = 'autres',
): FinancialResult {
  const durationYears = (h as any).dureeEtude ?? HORIZON_DEFAULT;
  const tauxActu = TAUX_ACTU_DEFAULT;

  const cr = computeCR(h, inv, fin, durationYears, sectorCode);
  const bfrYears = cr.map((y) => computeBFR(h, y.ca, y.achats));
  const bilan = computeBilan(cr, inv, fin, bfrYears, durationYears);
  const tafire = computeTafire(cr, bilan, fin, durationYears);
  const tresorerie = computeTresorerie(h, cr);
  const kpis = computeKPIs(cr, inv, fin, bfrYears, durationYears, tauxActu);

  return { cr, bilan, tafire, tresorerie, kpis };
}

export function fmtFCFA(n: number): string {
  return Math.round(n).toLocaleString('fr-FR');
}

export function fmtSigned(n: number): string {
  const abs = Math.round(Math.abs(n)).toLocaleString('fr-FR');
  return n < 0 ? `−${abs}` : abs;
}
