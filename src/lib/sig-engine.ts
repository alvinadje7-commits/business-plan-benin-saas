import { DEFAULT_DOTATIONS_AMORT } from '../types/project';
import type { Hypotheses, SIG, BFRDetail } from '../types/project';

/**
 * Calcule la cascade des Soldes Intermédiaires de Gestion (SIG) pour l'année 1.
 * @param h  Hypothèses saisies par l'utilisateur
 * @param amortissements  Dotations (provenant de la Carte 4)
 */
export function computeSIG(h: Hypotheses, amortissements = DEFAULT_DOTATIONS_AMORT): SIG {
  const ca = h.caMensuel * 12;
  const achats = ca * (h.pctAchats / 100);
  const marge = ca - achats;
  const chargesExt = ca * (h.pctChargesExt / 100);
  const valeurAjoutee = marge - chargesExt;
  const personnel = h.masseSalariale;
  const ebe = valeurAjoutee - personnel;
  const resultatExpl = ebe - amortissements;
  const resultatFin = -h.chargesFinancieres;
  const resultatAvantImpot = resultatExpl + resultatFin;
  const impot = resultatAvantImpot > 0 ? resultatAvantImpot * 0.30 : 0;
  const resultatNet = resultatAvantImpot - impot;

  return {
    ca, achats, marge, chargesExt, valeurAjoutee,
    personnel, ebe, amortissements,
    resultatExpl, resultatFin, resultatAvantImpot,
    impot, resultatNet,
  };
}

/**
 * Calcule le Besoin en Fonds de Roulement (BFR) selon les règles SYSCOHADA.
 *
 * Formules :
 *   Stocks           = CV annuelles / 12           (1 mois de charges variables)
 *   Créances clients = CA TTC × joursClients / baseJours
 *   Dettes fourniss. = Achats TTC × joursFournisseurs / baseJours
 *   BFR = Stocks + Clients − Fournisseurs
 *
 * @param h          Hypothèses (jours clients/fournisseurs, % achats)
 * @param caAnnuel   Chiffre d'affaires annuel HT
 * @param cvAnnuel   Charges variables annuelles (optionnel ; défaut = CA × %Achats)
 * @param baseJours  Base de calcul (360 par défaut, aligné SYSCOHADA / Excel)
 */
export function computeBFR(
  h: Hypotheses,
  caAnnuel: number,
  cvAnnuel?: number,
  baseJours = 360,
): BFRDetail {
  const TVA = 1.18;

  // Stocks : 1 mois de charges variables (12e des CV)
  const cv = cvAnnuel ?? caAnnuel * (h.pctAchats / 100);
  const stocks = cv / 12;

  // Créances clients : CA TTC × délai / baseJours
  const clients = (caAnnuel * TVA / baseJours) * h.joursClients;

  // Dettes fournisseurs : Achats TTC × délai / baseJours
  const achats = caAnnuel * (h.pctAchats / 100);
  const fournisseurs = (achats * TVA / baseJours) * h.joursFournisseurs;

  const bfr = stocks + clients - fournisseurs;
  return {
    stocks: Math.round(stocks),
    clients: Math.round(clients),
    fournisseurs: Math.round(fournisseurs),
    bfr: Math.round(bfr),
  };
}

export function fmtFCFA(n: number): string {
  return Math.round(n).toLocaleString('fr-FR');
}

export function fmtFCFAsigned(n: number): string {
  const abs = Math.abs(n).toLocaleString('fr-FR');
  return n < 0 ? `−${abs}` : abs;
}
