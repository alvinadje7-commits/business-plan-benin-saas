// src/lib/mockup-data.ts
// Données extraites de public/maquette-reference.html

export interface SectorField {
  key: string;
  label: string;
  type: 'integer' | 'currency' | 'percent' | 'decimal';
  unit?: string;
  default: number;
}

export interface SectorDef {
  code: string;
  name: string;
  description: string;
  icon: string;
  fields: SectorField[];
}

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

export const SECTORS: SectorDef[] = [
  {
    code: 'aviculture', name: 'Aviculture',
    description: 'Poulets de chair, pondeuses, poussins, cycles', icon: '🐔',
    fields: [
      { key: 'cycles', label: 'Nombre de cycles par an', type: 'integer', unit: 'cycles', default: 6 },
      { key: 'effectif', label: 'Effectif par cycle', type: 'integer', unit: 'sujets', default: 5000 },
      { key: 'mortalite', label: 'Taux de mortalité', type: 'percent', unit: '%', default: 5 },
      { key: 'poids', label: 'Poids moyen à la vente', type: 'decimal', unit: 'kg', default: 2.2 },
      { key: 'prixKg', label: 'Prix de vente au kg', type: 'currency', unit: 'FCFA', default: 2500 },
      { key: 'consoAlim', label: 'Consommation aliment / sujet', type: 'decimal', unit: 'kg', default: 4.5 },
      { key: 'prixAlim', label: 'Prix aliment kg', type: 'currency', unit: 'FCFA', default: 400 },
      { key: 'vaccins', label: 'Vaccins & veto / sujet', type: 'currency', unit: 'FCFA', default: 150 },
      { key: 'litiere', label: 'Litière par cycle', type: 'currency', unit: 'FCFA', default: 50000 },
      { key: 'chauffage', label: 'Chauffage & énergie / cycle', type: 'currency', unit: 'FCFA', default: 80000 },
    ],
  },
  {
    code: 'anacarde', name: 'Anacarde / Cajou',
    description: 'Superficie, rendement, transformation, export', icon: '🥜',
    fields: [
      { key: 'superficie', label: 'Superficie', type: 'decimal', unit: 'ha', default: 10 },
      { key: 'rendement', label: 'Rendement brut', type: 'decimal', unit: 'kg/ha', default: 800 },
      { key: 'prixBord', label: 'Prix bord champ', type: 'currency', unit: 'FCFA/kg', default: 300 },
      { key: 'tauxTransfo', label: 'Taux transformation amande', type: 'percent', unit: '%', default: 22 },
      { key: 'prixExport', label: 'Prix amande export', type: 'currency', unit: 'FCFA/kg', default: 3500 },
      { key: 'fraisCollecte', label: 'Frais collecte / kg', type: 'currency', unit: 'FCFA', default: 50 },
    ],
  },
  {
    code: 'agriculture', name: 'Agriculture',
    description: 'Maïs, riz, maraîchage, intrants', icon: '🌾',
    fields: [
      { key: 'superficie', label: 'Superficie cultivée', type: 'decimal', unit: 'ha', default: 5 },
      { key: 'rendement', label: 'Rendement', type: 'decimal', unit: 'T/ha', default: 3 },
      { key: 'prixVente', label: 'Prix de vente / T', type: 'currency', unit: 'FCFA', default: 180000 },
      { key: 'intrants', label: 'Intrants / ha', type: 'currency', unit: 'FCFA', default: 120000 },
      { key: 'pertes', label: 'Pertes post-récolte', type: 'percent', unit: '%', default: 8 },
    ],
  },
  {
    code: 'agro_industrie', name: 'Agro-industrie',
    description: 'Transformation, capacité, rendement matière', icon: '🏭',
    fields: [
      { key: 'capacite', label: 'Capacité mensuelle', type: 'decimal', unit: 'T', default: 20 },
      { key: 'utilisation', label: "Taux d'utilisation", type: 'percent', unit: '%', default: 75 },
      { key: 'mp', label: 'Matière première / T', type: 'currency', unit: 'FCFA', default: 150000 },
      { key: 'rendement', label: 'Rendement transformation', type: 'percent', unit: '%', default: 65 },
      { key: 'prixPF', label: 'Prix vente PF / T', type: 'currency', unit: 'FCFA', default: 400000 },
    ],
  },
  {
    code: 'commerce', name: 'Commerce général',
    description: 'Stock, rotation, marge commerciale', icon: '🛒',
    fields: [
      { key: 'stockInit', label: 'Stock initial', type: 'currency', unit: 'FCFA', default: 2000000 },
      { key: 'marge', label: 'Marge commerciale', type: 'percent', unit: '%', default: 30 },
      { key: 'rotation', label: 'Rotation stock', type: 'decimal', unit: 'fois/an', default: 6 },
      { key: 'caCible', label: 'CA mensuel cible', type: 'currency', unit: 'FCFA', default: 5000000 },
    ],
  },
  {
    code: 'import_export', name: 'Import-Export',
    description: 'Devise, douane, transit, logistique', icon: '🚢',
    fields: [
      { key: 'cif', label: 'Valeur CIF mensuelle', type: 'currency', unit: 'FCFA', default: 8000000 },
      { key: 'douane', label: 'Droits de douane', type: 'percent', unit: '%', default: 20 },
      { key: 'transit', label: 'Frais transit & logistique', type: 'percent', unit: '%', default: 8 },
      { key: 'marge', label: 'Marge revente', type: 'percent', unit: '%', default: 25 },
    ],
  },
  {
    code: 'restauration', name: 'Restauration',
    description: 'Couverts, ticket moyen, matières', icon: '🍽️',
    fields: [
      { key: 'couverts', label: 'Couverts / jour', type: 'integer', default: 60 },
      { key: 'ticket', label: 'Ticket moyen', type: 'currency', unit: 'FCFA', default: 3000 },
      { key: 'jours', label: "Jours d'ouverture / mois", type: 'integer', default: 26 },
      { key: 'foodCost', label: 'Food cost', type: 'percent', unit: '%', default: 32 },
    ],
  },
  {
    code: 'btp', name: 'BTP',
    description: 'Chantiers, avancement, sous-traitance', icon: '🏗️',
    fields: [
      { key: 'facturation', label: 'Facturation mensuelle', type: 'currency', unit: 'FCFA', default: 15000000 },
      { key: 'materiaux', label: 'Matériaux % CA', type: 'percent', unit: '%', default: 40 },
      { key: 'sousTraitance', label: 'Sous-traitance % CA', type: 'percent', unit: '%', default: 15 },
      { key: 'retenue', label: 'Retenue de garantie', type: 'percent', unit: '%', default: 5 },
    ],
  },
  {
    code: 'transport', name: 'Transport',
    description: 'Flotte, km, carburant, taux remplissage', icon: '🚚',
    fields: [
      { key: 'vehicules', label: 'Nombre véhicules', type: 'integer', default: 3 },
      { key: 'kmMois', label: 'Km / mois / véhicule', type: 'integer', default: 4000 },
      { key: 'prixKm', label: 'Prix facturé / km', type: 'currency', unit: 'FCFA', default: 800 },
      { key: 'conso', label: 'Conso L/100km', type: 'decimal', default: 15 },
      { key: 'prixCarburant', label: 'Prix carburant / L', type: 'currency', unit: 'FCFA', default: 750 },
      { key: 'remplissage', label: 'Taux remplissage', type: 'percent', unit: '%', default: 75 },
    ],
  },
  {
    code: 'services', name: 'Services',
    description: 'Effectifs, TJM, taux utilisation', icon: '💼',
    fields: [
      { key: 'effectif', label: 'Effectif facturable', type: 'integer', default: 4 },
      { key: 'tjm', label: 'TJM moyen', type: 'currency', unit: 'FCFA', default: 50000 },
      { key: 'joursFact', label: 'Jours facturables / mois / pers', type: 'integer', default: 18 },
      { key: 'utilisation', label: "Taux d'utilisation", type: 'percent', unit: '%', default: 80 },
    ],
  },
  {
    code: 'elevage_autre', name: 'Élevage autre',
    description: 'Bovins, ovins, porcs, pisciculture', icon: '🐄',
    fields: [
      { key: 'cheptel', label: 'Cheptel initial', type: 'integer', default: 50 },
      { key: 'prixTete', label: 'Prix vente / tête', type: 'currency', unit: 'FCFA', default: 250000 },
      { key: 'croissance', label: 'Croissance troupeau / an', type: 'percent', unit: '%', default: 20 },
      { key: 'alim', label: 'Alimentation / tête / mois', type: 'currency', unit: 'FCFA', default: 8000 },
    ],
  },
  {
    code: 'transformation_agro', name: 'Transformation agro',
    description: 'Capacité, rendement, emballage, distribution', icon: '🥫',
    fields: [
      { key: 'capacite', label: 'Capacité / jour', type: 'integer', unit: 'kg', default: 500 },
      { key: 'jours', label: 'Jours production / mois', type: 'integer', default: 22 },
      { key: 'prixPF', label: 'Prix vente PF / kg', type: 'currency', unit: 'FCFA', default: 1500 },
      { key: 'coutMP', label: 'Coût MP / kg PF', type: 'currency', unit: 'FCFA', default: 600 },
      { key: 'pertes', label: 'Taux pertes techniques', type: 'percent', unit: '%', default: 5 },
    ],
  },
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
