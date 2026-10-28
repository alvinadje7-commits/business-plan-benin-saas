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

export function computeBFR(h: Hypotheses, caAnnuel: number): BFRDetail {
  const caJour = caAnnuel / 360;
  const stocks = caJour * h.joursStockage * (h.pctAchats / 100);
  const clients = caJour * h.joursClients;
  const fournisseurs = caJour * h.joursFournisseurs * (h.pctAchats / 100);
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
