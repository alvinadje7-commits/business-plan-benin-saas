// ============================================================
// Impôts & taxes — mensuels + impôt résultat par secteur
// Règle : Élevage/Agri = 0 % · Transformation = 25 % · Autres = 30 %
// ============================================================

export interface TaxLine {
  id: string;
  label: string;
  monthly: number;
}

export interface ImpotsTaxesInput {
  lines: TaxLine[];
  sectorCode: string;
  resultatAvantImpot: number[];   // annuel
  durationYears: number;
}

export interface ImpotsTaxesResult {
  monthlyByPoste: { label: string; values: number[] }[];
  totalMonthly: number[];
  totalAnnual: number[];
  impotResultatAnnuel: number[];
}

export function getTaxRate(sectorCode: string): number {
  const c = sectorCode.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (['aviculture', 'elevage', 'elevage-autre', 'agriculture'].some((k) => c.includes(k))) return 0;
  if (['agro-industrie', 'transformation-agro', 'anacarde', 'transformation'].some((k) => c.includes(k))) return 0.25;
  return 0.30;
}

export function computeImpotsTaxes(input: ImpotsTaxesInput): ImpotsTaxesResult {
  const { lines, sectorCode, resultatAvantImpot, durationYears } = input;
  const monthlyByPoste = lines.map((l) => ({
    label: l.label,
    values: new Array(durationYears * 12).fill(0),
  }));
  const totalMonthly = new Array(durationYears * 12).fill(0);
  const totalAnnual  = new Array(durationYears).fill(0);

  lines.forEach((line, idx) => {
    for (let y = 1; y <= durationYears; y++) {
      for (let m = 0; m < 12; m++) {
        const mi = (y - 1) * 12 + m;
        monthlyByPoste[idx].values[mi] = line.monthly;
        totalMonthly[mi] += line.monthly;
        totalAnnual[y - 1] += line.monthly;
      }
    }
  });

  const rate = getTaxRate(sectorCode);
  const impotResultatAnnuel = resultatAvantImpot.map((r) => (r > 0 ? r * rate : 0));

  return { monthlyByPoste, totalMonthly, totalAnnual, impotResultatAnnuel };
}
