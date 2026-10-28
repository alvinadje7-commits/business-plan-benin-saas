import type {
  Hypotheses, Investment, Financement,
  FinancialResult, YearFinancials, BilanYear, TafireYear,
  TresorerieMois, KPIs,
} from '../types/project';
import { computeAmortizationTable, totalByYear } from './amortization-engine';
import { computeLoanSchedule } from './financing-engine';
import { computeBFR } from './sig-engine';

const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
const TAUX_IS = 0.30;
const TAUX_ACTU = 0.12;

/* ---------- COMPTE DE RÉSULTAT ---------- */
function computeCR(h: Hypotheses, inv: Investment[], fin: Financement): YearFinancials[] {
  const amortLines = computeAmortizationTable(inv, 5);
  const schedule = computeLoanSchedule(fin);
  const result: YearFinancials[] = [];

  let ca = h.caMensuel * 12;
  for (let a = 0; a < 3; a++) {
    if (a > 0) ca *= 1 + (a === 1 ? h.croissanceA2 : h.croissanceA3) / 100;

    const achats = ca * (h.pctAchats / 100);
    const marge = ca - achats;
    const chargesExt = ca * (h.pctChargesExt / 100);
    const va = marge - chargesExt;
    // Personnel : +10%/an
    const personnel = h.masseSalariale * Math.pow(1.10, a);
    const ebe = va - personnel;
    const dotations = totalByYear(amortLines, a);
    const re = ebe - dotations;
    const chargesFin = schedule[a]?.interets ?? 0;
    const rai = re - chargesFin;
    const is = rai > 0 ? rai * TAUX_IS : 0;
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
function computeBilan(cr: YearFinancials[], inv: Investment[], fin: Financement, bfr: ReturnType<typeof computeBFR>): BilanYear[] {
  const amortLines = computeAmortizationTable(inv, 5);
  const schedule = computeLoanSchedule(fin);
  const totalBrut = inv.reduce((s, i) => s + i.cost, 0);
  const result: BilanYear[] = [];

  let reserves = 0;
  for (let a = 0; a < 3; a++) {
    const y = cr[a];
    const amortCumules = amortLines.reduce((s, l) => s + l.dotations.slice(0, a + 1).reduce((x, v) => x + v, 0), 0);
    const immobNettes = totalBrut - amortCumules;
    const stocks = bfr.stocks;
    const clients = bfr.clients;
    const fournisseurs = bfr.fournisseurs;
    const emprunt = schedule[a]?.capitalFin ?? 0;
    const isDette = y.is; // IS payé l'année suivante
    const capital = fin.capitalSocial;
    const apportCC = fin.apportCompteCourant;
    const subventions = fin.subventions;
    const rn = y.rn;

    const totalPassif =
      capital + apportCC + subventions + reserves + rn + emprunt + fournisseurs + isDette;

    // Trésorerie = plug pour équilibrer
    const tresorerie = totalPassif - (immobNettes + stocks + clients);
    const totalActif = immobNettes + stocks + clients + tresorerie;

    result.push({
      annee: a + 1,
      immobBrut: totalBrut, amortCumules, immobNettes, stocks, clients, tresorerie, totalActif,
      capital, apportCC, subventions, reserves, rn, emprunt, fournisseurs, dettesFiscales: isDette,
      totalPassif,
      equilibre: Math.abs(totalActif - totalPassif) < 1000,
    });

    reserves += rn;
  }
  return result;
}

/* ---------- TAFIRE ---------- */
function computeTafire(cr: YearFinancials[], bilan: BilanYear[], fin: Financement): TafireYear[] {
  const schedule = computeLoanSchedule(fin);
  const result: TafireYear[] = [];
  let prevTreso = 0;

  for (let a = 0; a < 3; a++) {
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
    const variationTresorerie = totalRessources - totalEmplois + b.tresorerie - prevTreso - (b.tresorerie - prevTreso);

    result.push({
      annee: a + 1,
      investissements, variationBFR, remboursement, totalEmplois,
      caf: y.caf, apports, subventions, nouveauxEmprunts, totalRessources,
      variationTresorerie,
    });

    prevTreso = b.tresorerie;
  }
  return result;
}

/* ---------- TRÉSORERIE MENSUELLE A1 ---------- */
function computeTresorerie(h: Hypotheses, cr: YearFinancials): TresorerieMois[] {
  const y = cr[0];
  const caMoy = y.ca / 12;
  const chargesMens =
    (y.achats + y.chargesExt + y.personnel + y.chargesFin) / 12;

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

/* ---------- KPIs ---------- */
function computeIRR(flows: number[]): number {
  // Bisection sur [-0.99, 5]
  let lo = -0.99, hi = 5, mid = 0;
  const npv = (r: number) => flows.reduce((s, f, t) => s + f / Math.pow(1 + r, t), 0);
  if (npv(lo) * npv(hi) > 0) return 0;
  for (let i = 0; i < 100; i++) {
    mid = (lo + hi) / 2;
    if (npv(mid) > 0) lo = mid; else hi = mid;
  }
  return mid;
}

function computeKPIs(cr: YearFinancials[], inv: Investment[], fin: Financement, bilan: BilanYear[]): KPIs {
  const investInit = inv.reduce((s, i) => s + i.cost, 0);
  const flows: number[] = [-investInit];
  for (let a = 0; a < 3; a++) flows.push(cr[a].caf);

  const van = flows.reduce((s, f, t) => s + f / Math.pow(1 + TAUX_ACTU, t), 0);
  const tri = computeIRR(flows) * 100;

  // Délai de récupération
  let cumul = -investInit;
  let delai = 0;
  for (let a = 0; a < 3 && cumul < 0; a++) {
    cumul += cr[a].caf;
    if (cumul >= 0) {
      delai = a * 12 + (Math.abs(cumul - cr[a].caf) / cr[a].caf) * 12;
    }
  }
  if (cumul < 0) delai = 36;

  // DSCR A1
  const schedule = computeLoanSchedule(fin);
  const annuiteA1 = schedule[0]?.annuite ?? 0;
  const dscr = annuiteA1 > 0 ? cr[0].caf / annuiteA1 : 0;

  // Marge nette
  const margeNette = (cr[0].rn / cr[0].ca) * 100;

  // Seuil de rentabilité
  const chargesFixes = cr[0].personnel + cr[0].dotations + cr[0].chargesFin + cr[0].chargesExt;
  const tauxMarge = (cr[0].marge / cr[0].ca);
  const seuil = tauxMarge > 0 ? chargesFixes / tauxMarge : 0;

  return {
    van, tri, delaiRecupMois: Math.round(delai), dscr,
    margeNette, seuilRentabilite: Math.round(seuil),
  };
}

/* ---------- ORCHESTRATEUR ---------- */
export function computeFinancialResult(
  h: Hypotheses, inv: Investment[], fin: Financement,
): FinancialResult {
  const cr = computeCR(h, inv, fin);
  const bfr = computeBFR(h, cr[0].ca);
  const bilan = computeBilan(cr, inv, fin, bfr);
  const tafire = computeTafire(cr, bilan, fin);
  const tresorerie = computeTresorerie(h, cr);
  const kpis = computeKPIs(cr, inv, fin, bilan);
  return { cr, bilan, tafire, tresorerie, kpis };
}

export function fmtFCFA(n: number): string {
  return Math.round(n).toLocaleString('fr-FR');
}

export function fmtSigned(n: number): string {
  const abs = Math.round(Math.abs(n)).toLocaleString('fr-FR');
  return n < 0 ? `−${abs}` : abs;
}
