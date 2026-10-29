// ============================================================
// Plan de trésorerie — 84 mois, encaissements vs décaissements
// Le CA/achats sont décalés par les délais clients/fournisseurs.
// ============================================================

export interface TresorerieInput {
  durationYears: number;
  soldeInitial: number;

  // Encaissements (arrays de longueur durationYears * 12)
  caTtcMonthly: number[];
  apportsCapital: number[];
  empruntMT: number[];
  empruntCT: number[];
  subvention: number[];
  autresEncaissements: number[];
  delaiClientsJours: number;

  // Décaissements
  investissements: number[];
  achatsVariablesTtcMonthly: number[];
  chargesExternes: number[];
  salaires: number[];
  impotsTaxes: number[];
  delaiFournisseursJours: number;

  // Service de la dette (mensuel)
  remboursementMT: number[];
  interetsMT: number[];
  tafMT: number[];
  remboursementCT: number[];
  interetsCT: number[];
  tafCT: number[];

  // Impôt sur résultat — payé au mois 12 de chaque année
  impotResultatAnnuel: number[];
}

export interface TresorerieMonth {
  month: number;
  year: number;
  encaissements: {
    apports: number;
    empruntsMT: number;
    empruntsCT: number;
    subventions: number;
    clients: number;
    autres: number;
    total: number;
  };
  decaissements: {
    investissements: number;
    achatsVariables: number;
    chargesExternes: number;
    salaires: number;
    impotsTaxes: number;
    remboursementMT: number;
    remboursementCT: number;
    interets: number;
    taf: number;
    impotResultat: number;
    total: number;
  };
  soldeDebut: number;
  fluxNet: number;
  soldeFin: number;
}

export interface TresorerieYear {
  year: number;
  encaissements: number;
  decaissements: number;
  soldeDebut: number;
  soldeFin: number;
}

export interface TresorerieResult {
  months: TresorerieMonth[];
  annees: TresorerieYear[];
  soldeFinal: number;
  soldeMinimum: number;
}

/**
 * Répartit un flux par mois selon le délai (en jours).
 * Ex : d=15j → 50% au mois t, 50% au mois t+1
 *      d=30j → 100% au mois t+1
 *      d=0j  → 100% au mois t
 */
function applyCollectionDelay(flux: number[], delayDays: number): number[] {
  const n = flux.length;
  const out = new Array(n).fill(0);
  const fullMonths = Math.floor(Math.max(0, delayDays) / 30);
  const partial = (Math.max(0, delayDays) % 30) / 30;

  for (let t = 0; t < n; t++) {
    const a = t + fullMonths;
    if (a < n) out[a] += flux[t] * (1 - partial);
    const b = t + fullMonths + 1;
    if (b < n && partial > 0) out[b] += flux[t] * partial;
  }
  return out;
}

function get(arr: number[], i: number): number {
  return arr[i] ?? 0;
}

export function computeTresorerie(input: TresorerieInput): TresorerieResult {
  const totalMonths = input.durationYears * 12;
  const clients = applyCollectionDelay(input.caTtcMonthly, input.delaiClientsJours);
  const fournisseurs = applyCollectionDelay(input.achatsVariablesTtcMonthly, input.delaiFournisseursJours);

  const months: TresorerieMonth[] = [];
  let solde = input.soldeInitial;
  let soldeMinimum = solde;

  for (let m = 1; m <= totalMonths; m++) {
    const i = m - 1;
    const year = Math.ceil(m / 12);

    const enc = {
      apports: get(input.apportsCapital, i),
      empruntsMT: get(input.empruntMT, i),
      empruntsCT: get(input.empruntCT, i),
      subventions: get(input.subvention, i),
      clients: get(clients, i),
      autres: get(input.autresEncaissements, i),
    };
    const encTotal = enc.apports + enc.empruntsMT + enc.empruntsCT + enc.subventions + enc.clients + enc.autres;

    const dec = {
      investissements: get(input.investissements, i),
      achatsVariables: get(fournisseurs, i),
      chargesExternes: get(input.chargesExternes, i),
      salaires: get(input.salaires, i),
      impotsTaxes: get(input.impotsTaxes, i),
      remboursementMT: get(input.remboursementMT, i),
      remboursementCT: get(input.remboursementCT, i),
      interets: get(input.interetsMT, i) + get(input.interetsCT, i),
      taf: get(input.tafMT, i) + get(input.tafCT, i),
      impotResultat: m % 12 === 0 ? get(input.impotResultatAnnuel, year - 1) : 0,
    };
    const decTotal =
      dec.investissements + dec.achatsVariables + dec.chargesExternes + dec.salaires +
      dec.impotsTaxes + dec.remboursementMT + dec.remboursementCT + dec.interets +
      dec.taf + dec.impotResultat;

    const soldeDebut = solde;
    const fluxNet = encTotal - decTotal;
    solde = soldeDebut + fluxNet;
    if (solde < soldeMinimum) soldeMinimum = solde;

    months.push({
      month: m,
      year,
      encaissements: { ...enc, total: encTotal },
      decaissements: { ...dec, total: decTotal },
      soldeDebut,
      fluxNet,
      soldeFin: solde,
    });
  }

  const annees: TresorerieYear[] = [];
  for (let y = 1; y <= input.durationYears; y++) {
    const ms = months.filter((m) => m.year === y);
    if (ms.length === 0) continue;
    annees.push({
      year: y,
      encaissements: ms.reduce((s, m) => s + m.encaissements.total, 0),
      decaissements: ms.reduce((s, m) => s + m.decaissements.total, 0),
      soldeDebut: ms[0].soldeDebut,
      soldeFin: ms[ms.length - 1].soldeFin,
    });
  }

  return { months, annees, soldeFinal: solde, soldeMinimum };
}

/** Étale une annuité de prêt sur 12 mois (utile pour LoanResult → tresorerie). */
export function spreadAnnualToMonthly(annual: number[], durationYears: number): number[] {
  const out: number[] = [];
  for (let y = 0; y < durationYears; y++) {
    for (let m = 0; m < 12; m++) out.push((annual[y] ?? 0) / 12);
  }
  return out;
}
