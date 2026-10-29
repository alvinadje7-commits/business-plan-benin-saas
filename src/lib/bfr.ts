// ============================================================
// BFR — TVA 1.18 sur créances clients + dettes fournisseurs UNIQUEMENT
// Stocks = CV / 12 · Variation BFR_t = BFR_t − BFR_{t−1}
// ============================================================

export const TVA_RATE = 0.18;

export interface BFRInput {
  chiffreAffaires: number[];       // annuel HT
  chargesVariables: number[];      // annuel HT
  delaiClientsJours: number;
  delaiFournisseursJours: number;
}

export interface BFRLine {
  year: number;
  stocks: number;
  creancesClients: number;
  dettesFournisseurs: number;
  bfr: number;
  variation: number;
}

export interface BFRResult {
  lines: BFRLine[];
  totalBesoins: number[];
  totalRessources: number[];
  bfr: number[];
  variation: number[];
}

export function computeBFR(input: BFRInput): BFRResult {
  const n = input.chiffreAffaires.length;
  const lines: BFRLine[] = [];
  let previous = 0;

  for (let i = 0; i < n; i++) {
    const ca = input.chiffreAffaires[i] ?? 0;
    const cv = input.chargesVariables[i] ?? 0;

    const stocks = cv / 12;
    const creancesClients = (ca * (1 + TVA_RATE) / 360) * input.delaiClientsJours;
    const dettesFournisseurs = (ca * (1 + TVA_RATE) / 360) * input.delaiFournisseursJours;

    const bfr = stocks + creancesClients - dettesFournisseurs;
    const variation = bfr - previous;
    previous = bfr;

    lines.push({ year: i + 1, stocks, creancesClients, dettesFournisseurs, bfr, variation });
  }

  return {
    lines,
    totalBesoins: lines.map((l) => l.stocks + l.creancesClients),
    totalRessources: lines.map((l) => l.dettesFournisseurs),
    bfr: lines.map((l) => l.bfr),
    variation: lines.map((l) => l.variation),
  };
}

export function totalVariationBFR(r: BFRResult): number {
  return r.variation.reduce((s, v) => s + v, 0);
}
