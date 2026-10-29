// src/lib/mockup-data.ts
// Données extraites de public/maquette-reference.html
// Les secteurs ont été migrés dans src/lib/sectors-config.ts

export type { SectorField, SectorConfig, SectorKPI } from './sectors-config';
export { SECTORS, getSectorConfig, getDefaultSectorValues } from './sectors-config';

export const COLORS = {
  primary: '#0F172A',
  accent: '#10B981',
  background: '#F8F9FB',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  chartBlue: '#3182BD',
  chartGrey: '#808080',
  chartAmber: '#F59E0B',
  chartEmerald: '#10B981',
  chartPie: '#0088FE',
  series: ['#3182BD', '#10B981', '#F59E0B', '#F97316', '#EC4899', '#8B5CF6', '#06B6D4', '#84CC16'],
} as const;

export interface MonthlyPoint {
  mois: string;
  ca: number;
  rn: number;
  treso: number;
}

export const MONTHLY_SERIES: MonthlyPoint[] = [
  { mois: 'M1',  ca: 4_500_000,  rn: -1_200_000, treso: 2_800_000 },
  { mois: 'M2',  ca: 5_200_000,  rn: -800_000,   treso: 3_500_000 },
  { mois: 'M3',  ca: 6_100_000,  rn: -200_000,   treso: 4_800_000 },
  { mois: 'M4',  ca: 6_800_000,  rn: 400_000,    treso: 6_200_000 },
  { mois: 'M5',  ca: 7_200_000,  rn: 800_000,    treso: 7_500_000 },
  { mois: 'M6',  ca: 7_800_000,  rn: 1_200_000,  treso: 9_100_000 },
  { mois: 'M7',  ca: 8_500_000,  rn: 1_600_000,  treso: 11_200_000 },
  { mois: 'M8',  ca: 8_200_000,  rn: 1_400_000,  treso: 12_800_000 },
  { mois: 'M9',  ca: 9_100_000,  rn: 1_900_000,  treso: 15_100_000 },
  { mois: 'M10', ca: 9_800_000,  rn: 2_300_000,  treso: 17_800_000 },
  { mois: 'M11', ca: 10_400_000, rn: 2_700_000,  treso: 20_500_000 },
  { mois: 'M12', ca: 11_200_000, rn: 3_100_000,  treso: 23_800_000 },
];

export const NAV_STEPS = [
  'Infos générales', 'Secteur', 'Hypothèses',
  'Investissements', 'Financement', 'Exploitation & Résultats',
] as const;

export const CONTEXT = {
  currency: 'XOF',
  taxRate: 0.30,
  banks: ['BOA', 'SGB', 'PADME'],
} as const;
