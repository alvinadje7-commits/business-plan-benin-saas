// src/types/project.ts
// Types et constantes pour la Carte 1 — Infos générales

export type LegalForm = 'SARL' | 'SA' | 'SAS' | 'SNC' | 'Entreprise individuelle';

export interface Shareholder {
  id: string;
  name: string;
  parts: number;      // nombre de parts
  percent: number;    // % du capital
  amount: number;     // montant en FCFA
}

export interface GeneralInfo {
  // 1. Identité du projet
  projectName: string;
  sectorCode: string;
  startDate: string;       // ISO yyyy-mm-dd
  location: string;
  summary: string;

  // 2. Porteur / Promoteur
  promoterName: string;
  birthDate: string;
  email: string;
  phone: string;
  currentRole: string;
  experience: string;

  // 3. Forme juridique (OHADA)
  legalForm: LegalForm;
  capital: number;
  shareholders: Shareholder[];

  // 4. Identifiants officiels (Bénin)
  rccm: string;
  ifu: string;
  address: string;
}

export const LEGAL_FORMS: { value: LegalForm; label: string; minCapital: number; note: string }[] = [
  { value: 'SARL', label: 'SARL', minCapital: 100_000, note: 'Capital min. 100 000 FCFA' },
  { value: 'SA', label: 'SA', minCapital: 10_000_000, note: 'Capital min. 10 000 000 FCFA' },
  { value: 'SAS', label: 'SAS', minCapital: 100_000, note: 'Capital libre' },
  { value: 'SNC', label: 'SNC', minCapital: 0, note: 'Responsabilité illimitée' },
  { value: 'Entreprise individuelle', label: 'Entreprise individuelle', minCapital: 0, note: 'Pas de capital social' },
];

export const BENIN_CITIES = [
  'Cotonou, Littoral',
  'Porto-Novo, Ouémé',
  'Parakou, Borgou',
  'Abomey-Calavi, Atlantique',
  'Natitingou, Atacora',
  'Djougou, Donga',
  'Bohicon, Zou',
  'Lokossa, Mono',
  'Kandi, Alibori',
  'Ouidah, Atlantique',
];

export const CONTEXT_FISCAL = {
  currency: 'XOF (FCFA)',
  taxRate: 30,
  vatRate: 18,
  socialRate: 20,
} as const;

// Valeurs par défaut (alignées sur l'app actuelle)
export const DEFAULT_GENERAL_INFO: GeneralInfo = {
  projectName: 'Élevage Poulets de chair 5000 sujets - Parakou',
  sectorCode: 'aviculture',
  startDate: new Date().toISOString().slice(0, 10),
  location: 'Parakou, Borgou',
  summary: '',
  promoterName: 'Armand KOWOUVI',
  birthDate: '',
  email: '',
  phone: '',
  currentRole: 'Gérant',
  experience: '',
  legalForm: 'SARL',
  capital: 5_000_000,
  shareholders: [
    { id: 'sh1', name: 'Armand KOWOUVI', parts: 500, percent: 50, amount: 2_500_000 },
    { id: 'sh2', name: 'Coopérative Parakou', parts: 300, percent: 30, amount: 1_500_000 },
    { id: 'sh3', name: 'Autres', parts: 200, percent: 20, amount: 1_000_000 },
  ],
  rccm: '',
  ifu: '',
  address: 'Quartier Zongo, Parakou, Borgou',
};

// ========== CARTE 2 — SECTEUR ==========
export interface SectorSynthesis {
  ca: number;      // CA annuel prévisionnel
  marge: number;   // marge brute %
  bfr: number;     // BFR initial (FCFA)
  jobs: number;    // emplois directs
}

// ========== CARTE 3 — HYPOTHÈSES ==========
export interface Hypotheses {
  // 1. CA
  caMensuel: number;
  croissanceA2: number;  // %
  croissanceA3: number;  // %
  saisonnalite: number[]; // 12 coefficients (moy = 1.0)

  // 2. Charges
  pctAchats: number;      // % du CA
  pctChargesExt: number;  // % du CA
  masseSalariale: number; // FCFA/an
  chargesFinancieres: number; // FCFA/an (calculé depuis Carte 5, valeur par défaut ici)

  // 3. BFR
  joursStockage: number;
  joursClients: number;
  joursFournisseurs: number;
}

export interface SIG {
  ca: number;
  achats: number;
  marge: number;
  chargesExt: number;
  valeurAjoutee: number;
  personnel: number;
  ebe: number;
  amortissements: number;
  resultatExpl: number;
  resultatFin: number;
  resultatAvantImpot: number;
  impot: number;
  resultatNet: number;
}

export interface BFRDetail {
  stocks: number;
  clients: number;
  fournisseurs: number;
  bfr: number;
}

export const DEFAULT_HYPOTHESES: Hypotheses = {
  caMensuel: 13_750_000,
  croissanceA2: 20,
  croissanceA3: 20,
  saisonnalite: [0.7, 0.8, 0.9, 1.0, 1.0, 1.0, 1.1, 1.1, 1.2, 1.1, 1.1, 1.2],
  pctAchats: 40,
  pctChargesExt: 12,
  masseSalariale: 24_000_000,
  chargesFinancieres: 2_400_000,
  joursStockage: 30,
  joursClients: 45,
  joursFournisseurs: 30,
};

export const DEFAULT_DOTATIONS_AMORT = 7_500_000; // récupéré depuis Carte 4

// ========== CARTE 4 — INVESTISSEMENTS ==========
export type InvestmentCategory = 'Incorporel' | 'Corporel' | 'Financier';
export type AmortizationMode = 'Linéaire' | 'Dégressif';

export interface Investment {
  id: string;
  label: string;
  category: InvestmentCategory;
  cost: number;
  startDate: string;
  duration: number;
  mode: AmortizationMode;
}

export interface AmortizationLine {
  inv: Investment;
  dotations: number[];
  totalDotations: number;
  vnc: number;
}

export const DEFAULT_INVESTMENTS: Investment[] = [
  { id: 'inv1', label: 'Poulailler 5000 sujets (bâtiment)', category: 'Corporel', cost: 15_000_000, startDate: '2026-01-01', duration: 15, mode: 'Linéaire' },
  { id: 'inv2', label: 'Équipements élevage', category: 'Corporel', cost: 5_000_000, startDate: '2026-01-01', duration: 5, mode: 'Linéaire' },
  { id: 'inv3', label: 'Véhicule utilitaire', category: 'Corporel', cost: 8_000_000, startDate: '2026-01-01', duration: 5, mode: 'Linéaire' },
  { id: 'inv4', label: 'Matériel d\'élevage', category: 'Corporel', cost: 2_500_000, startDate: '2026-01-01', duration: 3, mode: 'Linéaire' },
  { id: 'inv5', label: 'Logiciel de gestion', category: 'Incorporel', cost: 1_500_000, startDate: '2026-01-01', duration: 3, mode: 'Linéaire' },
];

// ========== CARTE 5 — FINANCEMENT ==========
export interface Financement {
  capitalSocial: number;
  apportCompteCourant: number;
  subventions: number;

  empruntMontant: number;
  empruntBanque: string;
  empruntTaux: number;     // % annuel
  empruntDuree: number;    // années
  empruntDiffere: number;  // mois
}

export interface LoanYear {
  annee: number;
  capitalDebut: number;
  interets: number;
  amortissement: number;
  annuite: number;
  capitalFin: number;
}

export const BANQUES_BENIN = [
  'BOA Bénin',
  'SGB Bénin',
  'PADME',
  'Ecobank Bénin',
  'BSIC Bénin',
  'UBA Bénin',
  'Orabank',
  'Autre',
];

export const DEFAULT_FINANCEMENT: Financement = {
  capitalSocial: 5_000_000,
  apportCompteCourant: 2_000_000,
  subventions: 1_000_000,
  empruntMontant: 30_000_000,
  empruntBanque: 'BOA Bénin',
  empruntTaux: 9,
  empruntDuree: 5,
  empruntDiffere: 12,
};

// ========== CARTE 6 — RÉSULTATS ==========
export interface YearFinancials {
  annee: number;
  ca: number;
  achats: number;
  marge: number;
  chargesExt: number;
  va: number;
  personnel: number;
  ebe: number;
  dotations: number;
  re: number;
  chargesFin: number;
  rai: number;
  is: number;
  rn: number;
  caf: number;
}

export interface BilanYear {
  annee: number;
  immobBrut: number;
  amortCumules: number;
  immobNettes: number;
  stocks: number;
  clients: number;
  tresorerie: number;
  totalActif: number;
  capital: number;
  apportCC: number;
  subventions: number;
  reserves: number;
  rn: number;
  emprunt: number;
  fournisseurs: number;
  dettesFiscales: number;
  totalPassif: number;
  equilibre: boolean;
}

export interface TafireYear {
  annee: number;
  investissements: number;
  variationBFR: number;
  remboursement: number;
  totalEmplois: number;
  caf: number;
  apports: number;
  subventions: number;
  nouveauxEmprunts: number;
  totalRessources: number;
  variationTresorerie: number;
}

export interface TresorerieMois {
  mois: string;
  encaissements: number;
  decaissements: number;
  soldeMensuel: number;
  soldeCumule: number;
}

export interface KPIs {
  van: number;
  tri: number;
  delaiRecupMois: number;
  dscr: number;
  margeNette: number;
  seuilRentabilite: number;

  // --- Détails de calcul (transparence) ---
  tauxActualisation: number;
  horizonAnnees: number;
  investInit: number;
  vnci: number;
  cfadsA1: number;
  annuiteA1: number;
  tauxISApplique: number;

  // --- Séries annuelles (index 0 = année 1) ---
  ebe: number[];
  is: number[];
  deltaBfr: number[];
  vnciYear: number[];
  fcf: number[];
  fcfActualises: number[];
  fcfCumules: number[];
  fcfActCumules: number[];
}

export interface FinancialResult {
  cr: YearFinancials[];
  bilan: BilanYear[];
  tafire: TafireYear[];
  tresorerie: TresorerieMois[];
  kpis: KPIs;
}
