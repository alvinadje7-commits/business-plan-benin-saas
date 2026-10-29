// ============================================================
// Rentabilité — VAN, TRI (bisection), IP, DR (interpolation)
// ============================================================

export interface RentabiliteInput {
  initialCost: number;
  cashFlows: number[];
  discountRate: number;
}

export interface RentabiliteResult {
  van: number;
  tri: number | null;
  ip: number;
  dr: number | null;
  drString: string;
  npvSeries: number[];
}

function npvAt(rate: number, cfs: number[]): number {
  return cfs.reduce((s, cf, t) => s + cf / Math.pow(1 + rate, t + 1), 0);
}
function signedNpv(rate: number, i0: number, cfs: number[]): number {
  return -i0 + npvAt(rate, cfs);
}

function computeTRI(i0: number, cfs: number[]): number | null {
  let low = -0.999, high = 10;
  let fLow = signedNpv(low, i0, cfs);
  let fHigh = signedNpv(high, i0, cfs);
  if (fLow * fHigh > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2;
    const f = signedNpv(mid, i0, cfs);
    if (Math.abs(f) < 1e-7) return mid;
    if (f * fLow < 0) { high = mid; fHigh = f; } else { low = mid; fLow = f; }
  }
  return (low + high) / 2;
}

function computeDR(i0: number, cfs: number[], r: number): number | null {
  let cumul = -i0;
  if (cumul >= 0) return 0;
  for (let t = 0; t < cfs.length; t++) {
    const d = cfs[t] / Math.pow(1 + r, t + 1);
    const next = cumul + d;
    if (next >= 0) return t + Math.abs(cumul) / d;
    cumul = next;
  }
  return null;
}

function formatDR(dr: number | null): string {
  if (dr === null) return 'Non récupéré';
  const y = Math.floor(dr);
  const m = Math.round((dr - y) * 12);
  if (m === 12) return `${y + 1} ans 0 mois`;
  return `${y} ans ${m} mois`;
}

export function computeRentabilite(input: RentabiliteInput): RentabiliteResult {
  const { initialCost, cashFlows, discountRate } = input;
  const van = signedNpv(discountRate, initialCost, cashFlows);
  const tri = computeTRI(initialCost, cashFlows);
  const ip = initialCost > 0 ? (van + initialCost) / initialCost : 0;
  const dr = computeDR(initialCost, cashFlows, discountRate);

  const npvSeries: number[] = [];
  let acc = -initialCost;
  for (let t = 0; t < cashFlows.length; t++) {
    acc += cashFlows[t] / Math.pow(1 + discountRate, t + 1);
    npvSeries.push(acc);
  }

  return { van, tri, ip, dr, drString: formatDR(dr), npvSeries };
}
