import type { Investment } from '../types/project';

/* ============================================================
   TYPES
   ============================================================ */
export interface SectorField {
  key: string;
  label: string;
  type: 'integer' | 'currency' | 'percent' | 'decimal';
  unit?: string;
  default: number;
  group?: string;         // id du groupe (optionnel — rétrocompat)
  description?: string;
  min?: number;
  max?: number;
}

export interface SectorFieldGroup {
  id: string;
  label: string;
  icon: string;
  description?: string;
}

export interface SectorKPI {
  label: string;
  value: string;
  hint?: string;
  color?: 'primary' | 'accent' | 'amber' | 'blue' | 'danger';
}

export interface SectorConfig {
  code: string;
  name: string;
  description: string;
  icon: string;
  groups?: SectorFieldGroup[];
  fields: SectorField[];
  buildHypotheses: (values: Record<string, number>) => {
    caMensuel: number;
    pctAchats: number;
    pctChargesExt: number;
    masseSalariale: number;
    joursStockage: number;
    joursClients: number;
    joursFournisseurs: number;
  };
  investmentTemplates: Omit<Investment, 'id'>[];
  chargeRubriques: string[];
  kpisSpecifiques: (values: Record<string, number>) => SectorKPI[];
}

const DEFAULT_INVEST_DATE = '2026-01-01';
const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR');

/* ============================================================
   GROUPES STANDARD
   ============================================================ */
const G_PRODUCTION: SectorFieldGroup = { id: 'production', label: 'Production / Opérations', icon: '🏭', description: 'Volumes, rendements et cycles de production' };
const G_COMMERCIAL: SectorFieldGroup = { id: 'commercial', label: 'Commercial / Pricing', icon: '💰', description: 'Prix de vente, mix produit, canaux' };
const G_CHARGES: SectorFieldGroup = { id: 'charges', label: "Charges d'exploitation", icon: '📉', description: 'Matières, énergie, maintenance, transport' };
const G_RH: SectorFieldGroup = { id: 'rh', label: 'Ressources humaines', icon: '👥', description: 'Effectif, salaires, charges sociales' };
const G_REGLEMENTAIRE: SectorFieldGroup = { id: 'reglementaire', label: 'Réglementaire & taxes', icon: '📋', description: 'Licences, autorisations, taxes sectorielles' };

/* ============================================================
   LES 13 SECTEURS
   ============================================================ */
export const SECTORS: SectorConfig[] = [

  /* ═══════════════════════════════════════════════════════════
     1. AVICULTURE — PILOTE ENRICHI (20 champs, 5 groupes)
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'aviculture',
    name: 'Aviculture',
    description: 'Poulets de chair, pondeuses, poussins, cycles',
    icon: '🐔',
    groups: [G_PRODUCTION, G_COMMERCIAL, G_CHARGES, G_RH, G_REGLEMENTAIRE],
    fields: [
      // Production
      { key: 'cycles', label: 'Nombre de cycles / an', type: 'integer', unit: 'cycles', default: 6, group: 'production', min: 4, max: 8, description: 'Standard : 5-7 cycles pour poulet de chair' },
      { key: 'effectif', label: 'Effectif / cycle', type: 'integer', unit: 'sujets', default: 5000, group: 'production', min: 500, max: 20000 },
      { key: 'dureeCycle', label: 'Durée d\'un cycle', type: 'integer', unit: 'jours', default: 45, group: 'production', min: 35, max: 60, description: 'Poulet de chair : 40-50 j' },
      { key: 'mortalite', label: 'Taux de mortalité', type: 'percent', unit: '%', default: 5, group: 'production', min: 2, max: 10, description: 'Norme : 3-8 %' },
      { key: 'tauxConversion', label: 'Taux de conversion alimentaire', type: 'decimal', unit: 'kg alim/kg gain', default: 1.8, group: 'production', min: 1.5, max: 2.2, description: 'Indice de consommation (IC) — plus bas = mieux' },
      // Commercial
      { key: 'prixKgVif', label: 'Prix vente / kg vif', type: 'currency', unit: 'FCFA', default: 2500, group: 'commercial', description: 'Vente au grossiste, animal vivant' },
      { key: 'prixKgCarcasse', label: 'Prix vente / kg carcasse', type: 'currency', unit: 'FCFA', default: 3500, group: 'commercial', description: 'Vente directe, animal abattu' },
      { key: 'partVenteDirecte', label: 'Part vente directe', type: 'percent', unit: '%', default: 60, group: 'commercial', min: 0, max: 100 },
      { key: 'pertesInvendus', label: 'Pertes / invendus', type: 'percent', unit: '%', default: 3, group: 'commercial', min: 0, max: 10 },
      // Charges
      { key: 'prixPoussin', label: 'Prix poussin / sujet', type: 'currency', unit: 'FCFA', default: 700, group: 'charges' },
      { key: 'consoAlim', label: 'Consommation aliment / sujet', type: 'decimal', unit: 'kg', default: 4.5, group: 'charges' },
      { key: 'prixAlim', label: 'Prix aliment / kg', type: 'currency', unit: 'FCFA', default: 400, group: 'charges' },
      { key: 'vaccins', label: 'Vaccins & vétérinaire / sujet', type: 'currency', unit: 'FCFA', default: 150, group: 'charges' },
      { key: 'litiere', label: 'Litière / cycle', type: 'currency', unit: 'FCFA', default: 50000, group: 'charges' },
      { key: 'chauffage', label: 'Chauffage & énergie / cycle', type: 'currency', unit: 'FCFA', default: 80000, group: 'charges' },
      { key: 'eau', label: 'Eau / cycle', type: 'currency', unit: 'FCFA', default: 30000, group: 'charges' },
      { key: 'emballageTransport', label: 'Emballage & transport / cycle', type: 'currency', unit: 'FCFA', default: 40000, group: 'charges' },
      // RH
      { key: 'nbEmployes', label: "Nombre d'employés", type: 'integer', unit: 'pers', default: 2, group: 'rh' },
      { key: 'salaireMoyen', label: 'Salaire moyen mensuel', type: 'currency', unit: 'FCFA', default: 60000, group: 'rh' },
      { key: 'chargesSociales', label: 'Charges sociales', type: 'percent', unit: '%', default: 20, group: 'rh', min: 0, max: 30 },
      // Réglementaire
      { key: 'autorisationSanitaire', label: 'Autorisation sanitaire annuelle', type: 'currency', unit: 'FCFA', default: 100000, group: 'reglementaire' },
    ],
    buildHypotheses: (v) => {
      // Poids vif estimé à partir de l'IC : poids = consoAlim / tauxConversion
      const poidsVif = v.tauxConversion > 0 ? v.consoAlim / v.tauxConversion : 2.2;
      // Prix moyen pondéré selon mix vente directe (carcasse) / grossiste (vif)
      const partDirecte = v.partVenteDirecte / 100;
      const prixMoyen = partDirecte * v.prixKgCarcasse + (1 - partDirecte) * v.prixKgVif;
      // CA annuel net de pertes et mortalité
      const ventesNettes = v.cycles * v.effectif * (1 - v.mortalite / 100) * (1 - v.pertesInvendus / 100);
      const caAnnuel = ventesNettes * poidsVif * prixMoyen;
      // Achats = poussin + aliment + vaccins
      const coutPoussins = v.cycles * v.effectif * v.prixPoussin;
      const coutAlim = v.cycles * v.effectif * v.consoAlim * v.prixAlim;
      const coutVaccins = v.cycles * v.effectif * v.vaccins;
      const achats = coutPoussins + coutAlim + coutVaccins;
      // Charges externes = litière + chauffage + eau + emballage + autorisation
      const chargesExt = v.cycles * (v.litiere + v.chauffage + v.eau + v.emballageTransport) + v.autorisationSanitaire;
      // Masse salariale
      const masseSal = v.nbEmployes * v.salaireMoyen * 12 * (1 + v.chargesSociales / 100);
      return {
        caMensuel: caAnnuel / 12,
        pctAchats: caAnnuel > 0 ? (achats / caAnnuel) * 100 : 55,
        pctChargesExt: caAnnuel > 0 ? (chargesExt / caAnnuel) * 100 : 10,
        masseSalariale: masseSal,
        joursStockage: Math.round(v.dureeCycle * 0.5),
        joursClients: 15,
        joursFournisseurs: 30,
      };
    },
    investmentTemplates: [
      { label: 'Poulailler 5000 sujets', category: 'Corporel', cost: 15_000_000, startDate: DEFAULT_INVEST_DATE, duration: 15, mode: 'Linéaire' },
      { label: 'Équipements élevage (abreuvoirs, mangeoires)', category: 'Corporel', cost: 5_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
      { label: 'Stock initial poussins + aliment', category: 'Corporel', cost: 2_500_000, startDate: DEFAULT_INVEST_DATE, duration: 3, mode: 'Linéaire' },
      { label: 'Véhicule utilitaire', category: 'Corporel', cost: 8_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Poussins', 'Aliments', 'Vaccins & vétérinaires', 'Litière', 'Chauffage & énergie', 'Eau', 'Emballage & transport', 'Personnel', 'Autorisation sanitaire'],
    kpisSpecifiques: (v) => {
      const poidsVif = v.tauxConversion > 0 ? v.consoAlim / v.tauxConversion : 2.2;
      const partDirecte = v.partVenteDirecte / 100;
      const prixMoyen = partDirecte * v.prixKgCarcasse + (1 - partDirecte) * v.prixKgVif;
      const caCycle = v.effectif * (1 - v.mortalite / 100) * (1 - v.pertesInvendus / 100) * poidsVif * prixMoyen;
      return [
        { label: 'Indice conso', value: v.tauxConversion.toFixed(2), hint: 'kg alim / kg gain', color: v.tauxConversion <= 1.9 ? 'accent' : 'amber' },
        { label: 'Mortalité', value: v.mortalite.toFixed(1), hint: '% (max 8)', color: v.mortalite <= 8 ? 'accent' : 'danger' },
        { label: 'Poids vif/sujet', value: poidsVif.toFixed(2), hint: 'kg estimé', color: 'primary' },
        { label: 'CA / cycle', value: fmt(caCycle), hint: 'FCFA brut', color: 'accent' },
      ];
    },
  },

  /* ═══════════════════════════════════════════════════════════
     2. ANACARDE / CAJOU — inchangé (ancien format)
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'anacarde', name: 'Anacarde / Cajou', description: 'Superficie, rendement, transformation, export', icon: '🥜',
    fields: [
      { key: 'superficie', label: 'Superficie', type: 'decimal', unit: 'ha', default: 10 },
      { key: 'rendement', label: 'Rendement brut', type: 'decimal', unit: 'kg/ha', default: 800 },
      { key: 'prixBord', label: 'Prix bord champ', type: 'currency', unit: 'FCFA/kg', default: 300 },
      { key: 'tauxTransfo', label: 'Taux transformation amande', type: 'percent', unit: '%', default: 22 },
      { key: 'prixExport', label: 'Prix amande export', type: 'currency', unit: 'FCFA/kg', default: 3500 },
      { key: 'fraisCollecte', label: 'Frais collecte / kg', type: 'currency', unit: 'FCFA', default: 50 },
    ],
    buildHypotheses: (v) => {
      const prodBrute = v.superficie * v.rendement;
      const caAnnuel = prodBrute * v.prixBord;
      const pctAchats = caAnnuel > 0 ? (prodBrute * v.fraisCollecte / caAnnuel) * 100 : 25;
      return { caMensuel: caAnnuel / 12, pctAchats, pctChargesExt: 12, masseSalariale: 18_000_000, joursStockage: 45, joursClients: 30, joursFournisseurs: 20 };
    },
    investmentTemplates: [
      { label: 'Plantation anacardiers (10 ha)', category: 'Corporel', cost: 12_000_000, startDate: DEFAULT_INVEST_DATE, duration: 20, mode: 'Linéaire' },
      { label: 'Matériel de collecte', category: 'Corporel', cost: 3_500_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
      { label: 'Unité de transformation amande', category: 'Corporel', cost: 20_000_000, startDate: DEFAULT_INVEST_DATE, duration: 10, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Intrants agricoles', 'Collecte', 'Transformation', 'Transport', 'Personnel', 'Emballage'],
    kpisSpecifiques: (v) => [
      { label: 'Prod. brute', value: fmt(v.superficie * v.rendement), hint: 'kg/an', color: 'primary' },
      { label: 'Amande export', value: fmt(v.superficie * v.rendement * v.tauxTransfo / 100), hint: 'kg/an', color: 'accent' },
      { label: 'Prix bord', value: fmt(v.prixBord), hint: 'FCFA/kg', color: 'primary' },
      { label: 'Rendement', value: fmt(v.rendement), hint: 'kg/ha', color: 'primary' },
    ],
  },

  /* ═══════════════════════════════════════════════════════════
     3. AGRICULTURE — inchangé
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'agriculture', name: 'Agriculture', description: 'Maïs, riz, maraîchage, intrants', icon: '🌾',
    fields: [
      { key: 'superficie', label: 'Superficie cultivée', type: 'decimal', unit: 'ha', default: 5 },
      { key: 'rendement', label: 'Rendement', type: 'decimal', unit: 'T/ha', default: 3 },
      { key: 'prixVente', label: 'Prix de vente / T', type: 'currency', unit: 'FCFA', default: 180000 },
      { key: 'intrants', label: 'Intrants / ha', type: 'currency', unit: 'FCFA', default: 120000 },
      { key: 'pertes', label: 'Pertes post-récolte', type: 'percent', unit: '%', default: 8 },
    ],
    buildHypotheses: (v) => {
      const prod = v.superficie * v.rendement * (1 - v.pertes / 100);
      const caAnnuel = prod * v.prixVente;
      const pctAchats = caAnnuel > 0 ? (v.superficie * v.intrants / caAnnuel) * 100 : 35;
      return { caMensuel: caAnnuel / 12, pctAchats, pctChargesExt: 10, masseSalariale: 8_000_000, joursStockage: 30, joursClients: 45, joursFournisseurs: 15 };
    },
    investmentTemplates: [
      { label: 'Matériel agricole (tracteur, charrue)', category: 'Corporel', cost: 12_000_000, startDate: DEFAULT_INVEST_DATE, duration: 8, mode: 'Linéaire' },
      { label: 'Système d\'irrigation', category: 'Corporel', cost: 4_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
      { label: 'Stockage / hangar', category: 'Corporel', cost: 3_000_000, startDate: DEFAULT_INVEST_DATE, duration: 15, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Semences', 'Engrais', 'Pesticides', 'Main d\'œuvre', 'Transport', 'Stockage'],
    kpisSpecifiques: (v) => [
      { label: 'Production', value: (v.superficie * v.rendement).toFixed(1), hint: 'T/an', color: 'primary' },
      { label: 'Pertes', value: v.pertes.toFixed(1), hint: '% post-récolte', color: v.pertes <= 10 ? 'accent' : 'danger' },
      { label: 'Rendement', value: v.rendement.toFixed(2), hint: 'T/ha', color: 'primary' },
      { label: 'CA/ha', value: fmt(v.rendement * (1 - v.pertes / 100) * v.prixVente), hint: 'FCFA/an', color: 'accent' },
    ],
  },

  /* ═══════════════════════════════════════════════════════════
     4. AGRO-INDUSTRIE — inchangé
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'agro_industrie', name: 'Agro-industrie', description: 'Transformation, capacité, rendement matière', icon: '🏭',
    fields: [
      { key: 'capacite', label: 'Capacité mensuelle', type: 'decimal', unit: 'T', default: 20 },
      { key: 'utilisation', label: "Taux d'utilisation", type: 'percent', unit: '%', default: 75 },
      { key: 'mp', label: 'Matière première / T', type: 'currency', unit: 'FCFA', default: 150000 },
      { key: 'rendement', label: 'Rendement transformation', type: 'percent', unit: '%', default: 65 },
      { key: 'prixPF', label: 'Prix vente PF / T', type: 'currency', unit: 'FCFA', default: 400000 },
    ],
    buildHypotheses: (v) => {
      const prodPF = v.capacite * 12 * (v.utilisation / 100) * (v.rendement / 100);
      const caAnnuel = prodPF * v.prixPF;
      const coutMP = v.capacite * 12 * (v.utilisation / 100) * v.mp;
      return { caMensuel: caAnnuel / 12, pctAchats: caAnnuel > 0 ? (coutMP / caAnnuel) * 100 : 45, pctChargesExt: 15, masseSalariale: 30_000_000, joursStockage: 30, joursClients: 45, joursFournisseurs: 30 };
    },
    investmentTemplates: [
      { label: 'Ligne de production complète', category: 'Corporel', cost: 45_000_000, startDate: DEFAULT_INVEST_DATE, duration: 10, mode: 'Linéaire' },
      { label: 'Bâtiment industriel', category: 'Corporel', cost: 25_000_000, startDate: DEFAULT_INVEST_DATE, duration: 20, mode: 'Linéaire' },
      { label: 'Véhicule de livraison', category: 'Corporel', cost: 12_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Matières premières', 'Énergie', 'Emballage', 'Main d\'œuvre', 'Maintenance', 'Transport'],
    kpisSpecifiques: (v) => [
      { label: 'Prod. PF', value: (v.capacite * 12 * v.utilisation / 100 * v.rendement / 100).toFixed(1), hint: 'T/an', color: 'primary' },
      { label: 'Rendement', value: v.rendement.toFixed(0), hint: '% transfo', color: v.rendement >= 60 ? 'accent' : 'amber' },
      { label: 'Utilisation', value: v.utilisation.toFixed(0), hint: '% capacité', color: v.utilisation >= 70 ? 'accent' : 'amber' },
      { label: 'Prix PF', value: fmt(v.prixPF), hint: 'FCFA/T', color: 'primary' },
    ],
  },

  /* ═══════════════════════════════════════════════════════════
     5. COMMERCE — inchangé
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'commerce', name: 'Commerce général', description: 'Stock, rotation, marge commerciale', icon: '🛒',
    fields: [
      { key: 'stockInit', label: 'Stock initial', type: 'currency', unit: 'FCFA', default: 2_000_000 },
      { key: 'marge', label: 'Marge commerciale', type: 'percent', unit: '%', default: 30 },
      { key: 'rotation', label: 'Rotation stock', type: 'decimal', unit: 'fois/an', default: 6 },
      { key: 'caCible', label: 'CA mensuel cible', type: 'currency', unit: 'FCFA', default: 5_000_000 },
    ],
    buildHypotheses: (v) => ({
      caMensuel: v.caCible, pctAchats: 100 - v.marge, pctChargesExt: 8, masseSalariale: 9_600_000,
      joursStockage: Math.round(360 / Math.max(1, v.rotation)), joursClients: 15, joursFournisseurs: 30,
    }),
    investmentTemplates: [
      { label: 'Aménagement magasin', category: 'Corporel', cost: 5_000_000, startDate: DEFAULT_INVEST_DATE, duration: 10, mode: 'Linéaire' },
      { label: 'Stock initial marchandises', category: 'Corporel', cost: 2_000_000, startDate: DEFAULT_INVEST_DATE, duration: 1, mode: 'Linéaire' },
      { label: 'Équipement caisse & informatique', category: 'Incorporel', cost: 1_500_000, startDate: DEFAULT_INVEST_DATE, duration: 3, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Achats marchandises', 'Loyer local', 'Personnel', 'Énergie', 'Publicité', 'Transport'],
    kpisSpecifiques: (v) => [
      { label: 'Marge', value: v.marge.toFixed(1), hint: '% CA', color: v.marge >= 25 ? 'accent' : 'amber' },
      { label: 'Rotation', value: v.rotation.toFixed(1), hint: 'fois/an', color: 'primary' },
      { label: 'Stock moyen', value: fmt(v.caCible * 12 * (1 - v.marge / 100) / v.rotation), hint: 'FCFA', color: 'primary' },
      { label: 'CA annuel', value: fmt(v.caCible * 12), hint: 'FCFA', color: 'accent' },
    ],
  },

  /* ═══════════════════════════════════════════════════════════
     6. IMPORT-EXPORT — inchangé
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'import_export', name: 'Import-Export', description: 'Devise, douane, transit, logistique', icon: '🚢',
    fields: [
      { key: 'cif', label: 'Valeur CIF mensuelle', type: 'currency', unit: 'FCFA', default: 8_000_000 },
      { key: 'douane', label: 'Droits de douane', type: 'percent', unit: '%', default: 20 },
      { key: 'transit', label: 'Frais transit & logistique', type: 'percent', unit: '%', default: 8 },
      { key: 'marge', label: 'Marge revente', type: 'percent', unit: '%', default: 25 },
    ],
    buildHypotheses: (v) => {
      const caAnnuel = v.cif * 12 * (1 + v.marge / 100);
      return { caMensuel: caAnnuel / 12, pctAchats: caAnnuel > 0 ? (v.cif * 12 / caAnnuel) * 100 : 80, pctChargesExt: v.transit + 5, masseSalariale: 15_000_000, joursStockage: 45, joursClients: 30, joursFournisseurs: 15 };
    },
    investmentTemplates: [
      { label: 'Fonds de roulement marchandises', category: 'Corporel', cost: 15_000_000, startDate: DEFAULT_INVEST_DATE, duration: 1, mode: 'Linéaire' },
      { label: 'Véhicule utilitaire', category: 'Corporel', cost: 8_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
      { label: 'Bureau & informatique', category: 'Incorporel', cost: 2_500_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Achats CIF', 'Douane', 'Transit', 'Assurance', 'Personnel', 'Transport local'],
    kpisSpecifiques: (v) => [
      { label: 'Droits douane', value: v.douane.toFixed(0), hint: '% CIF', color: 'primary' },
      { label: 'Marge revente', value: v.marge.toFixed(0), hint: '%', color: v.marge >= 20 ? 'accent' : 'amber' },
      { label: 'CA mensuel', value: fmt(v.cif * (1 + v.marge / 100)), hint: 'FCFA', color: 'primary' },
      { label: 'Frais transit', value: v.transit.toFixed(0), hint: '% CIF', color: 'primary' },
    ],
  },

  /* ═══════════════════════════════════════════════════════════
     7. RESTAURATION — PILOTE ENRICHI (19 champs, 5 groupes)
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'restauration',
    name: 'Restauration',
    description: 'Couverts, ticket moyen, food cost, mix food/boisson',
    icon: '🍽️',
    groups: [
      { id: 'production', label: 'Opérations', icon: '🍽️', description: 'Couverts, services, capacité salle' },
      G_COMMERCIAL, G_CHARGES, G_RH, G_REGLEMENTAIRE,
    ],
    fields: [
      // Opérations
      { key: 'couvertsJour', label: 'Couverts / jour', type: 'integer', default: 60, group: 'production', min: 20, max: 300 },
      { key: 'joursOuverture', label: "Jours d'ouverture / mois", type: 'integer', default: 26, group: 'production', min: 20, max: 30 },
      { key: 'nbServices', label: 'Nombre de services / jour', type: 'integer', default: 2, group: 'production', min: 1, max: 3, description: 'Midi + soir = 2' },
      { key: 'placesSalle', label: 'Places en salle', type: 'integer', default: 40, group: 'production', min: 10, max: 200 },
      // Commercial
      { key: 'ticketFood', label: 'Ticket moyen — nourriture', type: 'currency', unit: 'FCFA', default: 2500, group: 'commercial' },
      { key: 'ticketBoisson', label: 'Ticket moyen — boisson', type: 'currency', unit: 'FCFA', default: 500, group: 'commercial' },
      { key: 'partVenteEmporter', label: 'Part vente à emporter', type: 'percent', unit: '%', default: 15, group: 'commercial', min: 0, max: 80 },
      { key: 'pertesCuisine', label: 'Pertes cuisine', type: 'percent', unit: '%', default: 5, group: 'commercial', min: 2, max: 12 },
      // Charges
      { key: 'foodCost', label: 'Food cost (% CA food)', type: 'percent', unit: '%', default: 32, group: 'charges', min: 25, max: 45, description: 'Cible : 30-35 %' },
      { key: 'coutBoisson', label: 'Coût boisson (% CA boisson)', type: 'percent', unit: '%', default: 25, group: 'charges', min: 15, max: 40 },
      { key: 'loyerMensuel', label: 'Loyer mensuel', type: 'currency', unit: 'FCFA', default: 400000, group: 'charges' },
      { key: 'energieMensuel', label: 'Électricité mensuelle', type: 'currency', unit: 'FCFA', default: 200000, group: 'charges' },
      { key: 'eauGazMensuel', label: 'Eau & gaz mensuels', type: 'currency', unit: 'FCFA', default: 80000, group: 'charges' },
      { key: 'marketingMensuel', label: 'Marketing & publicité', type: 'currency', unit: 'FCFA', default: 100000, group: 'charges' },
      // RH
      { key: 'nbEmployes', label: "Nombre d'employés", type: 'integer', unit: 'pers', default: 4, group: 'rh' },
      { key: 'salaireMoyen', label: 'Salaire moyen mensuel', type: 'currency', unit: 'FCFA', default: 70000, group: 'rh' },
      { key: 'chargesSociales', label: 'Charges sociales', type: 'percent', unit: '%', default: 20, group: 'rh', min: 0, max: 30 },
      // Réglementaire
      { key: 'licenceExploitation', label: "Licence d'exploitation annuelle", type: 'currency', unit: 'FCFA', default: 150000, group: 'reglementaire' },
      { key: 'taxesLocales', label: 'Taxes locales annuelles', type: 'currency', unit: 'FCFA', default: 200000, group: 'reglementaire' },
    ],
    buildHypotheses: (v) => {
      // CA mensuel = couverts × jours × (ticketFood + ticketBoisson)
      const caMensuelBrut = v.couvertsJour * v.joursOuverture * (v.ticketFood + v.ticketBoisson);
      // Ajustement pertes cuisine sur la partie food
      const caMensuelFood = v.couvertsJour * v.joursOuverture * v.ticketFood * (1 - v.pertesCuisine / 100);
      const caMensuelBoisson = v.couvertsJour * v.joursOuverture * v.ticketBoisson;
      const caMensuel = caMensuelFood + caMensuelBoisson;
      const caAnnuel = caMensuel * 12;
      // Achats = food cost + coût boisson
      const achatsMensuels = caMensuelFood * (v.foodCost / 100) + caMensuelBoisson * (v.coutBoisson / 100);
      // Charges externes
      const chargesExtMensuelles = v.loyerMensuel + v.energieMensuel + v.eauGazMensuel + v.marketingMensuel + (v.licenceExploitation + v.taxesLocales) / 12;
      // Masse salariale
      const masseSal = v.nbEmployes * v.salaireMoyen * 12 * (1 + v.chargesSociales / 100);
      return {
        caMensuel,
        pctAchats: caMensuel > 0 ? (achatsMensuels / caMensuel) * 100 : 32,
        pctChargesExt: caMensuel > 0 ? (chargesExtMensuelles / caMensuel) * 100 : 15,
        masseSalariale: masseSal,
        joursStockage: 7,
        joursClients: 0,
        joursFournisseurs: 15,
      };
    },
    investmentTemplates: [
      { label: 'Aménagement salle & cuisine', category: 'Corporel', cost: 12_000_000, startDate: DEFAULT_INVEST_DATE, duration: 10, mode: 'Linéaire' },
      { label: 'Matériel de cuisine professionnel', category: 'Corporel', cost: 6_000_000, startDate: DEFAULT_INVEST_DATE, duration: 7, mode: 'Linéaire' },
      { label: 'Mobilier & décoration', category: 'Corporel', cost: 2_500_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
      { label: 'Caisse & logiciel POS', category: 'Incorporel', cost: 1_500_000, startDate: DEFAULT_INVEST_DATE, duration: 3, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Matières premières food', 'Boissons', 'Personnel', 'Loyer', 'Énergie', 'Eau & gaz', 'Marketing', 'Licences & taxes'],
    kpisSpecifiques: (v) => {
      const caMensuelFood = v.couvertsJour * v.joursOuverture * v.ticketFood * (1 - v.pertesCuisine / 100);
      const caMensuelBoisson = v.couvertsJour * v.joursOuverture * v.ticketBoisson;
      return [
        { label: 'Food cost', value: v.foodCost.toFixed(0), hint: '% (cible 30-35)', color: v.foodCost <= 35 ? 'accent' : 'danger' },
        { label: 'Ticket moyen total', value: fmt(v.ticketFood + v.ticketBoisson), hint: 'FCFA (food + boisson)', color: 'primary' },
        { label: 'Couverts/jour', value: String(v.couvertsJour), hint: 'par service', color: 'primary' },
        { label: 'CA mensuel', value: fmt(caMensuelFood + caMensuelBoisson), hint: 'FCFA (net pertes)', color: 'accent' },
      ];
    },
  },

  /* ═══════════════════════════════════════════════════════════
     8. BTP — inchangé
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'btp', name: 'BTP', description: 'Chantiers, avancement, sous-traitance', icon: '🏗️',
    fields: [
      { key: 'facturation', label: 'Facturation mensuelle', type: 'currency', unit: 'FCFA', default: 15_000_000 },
      { key: 'materiaux', label: 'Matériaux % CA', type: 'percent', unit: '%', default: 40 },
      { key: 'sousTraitance', label: 'Sous-traitance % CA', type: 'percent', unit: '%', default: 15 },
      { key: 'retenue', label: 'Retenue de garantie', type: 'percent', unit: '%', default: 5 },
    ],
    buildHypotheses: (v) => ({
      caMensuel: v.facturation, pctAchats: v.materiaux + v.sousTraitance, pctChargesExt: 8,
      masseSalariale: 24_000_000, joursStockage: 30, joursClients: 90, joursFournisseurs: 45,
    }),
    investmentTemplates: [
      { label: 'Matériel de chantier', category: 'Corporel', cost: 20_000_000, startDate: DEFAULT_INVEST_DATE, duration: 7, mode: 'Linéaire' },
      { label: 'Véhicules utilitaires', category: 'Corporel', cost: 15_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
      { label: 'Bureau & dépôt', category: 'Corporel', cost: 8_000_000, startDate: DEFAULT_INVEST_DATE, duration: 15, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Matériaux', 'Sous-traitance', 'Main d\'œuvre', 'Carburant', 'Location matériel', 'Assurance chantier'],
    kpisSpecifiques: (v) => [
      { label: 'Matériaux', value: v.materiaux.toFixed(0), hint: '% CA', color: 'primary' },
      { label: 'Sous-traitance', value: v.sousTraitance.toFixed(0), hint: '% CA', color: 'primary' },
      { label: 'Retenue garantie', value: v.retenue.toFixed(0), hint: '% CA', color: 'amber' },
      { label: 'CA annuel', value: fmt(v.facturation * 12), hint: 'FCFA', color: 'accent' },
    ],
  },

  /* ═══════════════════════════════════════════════════════════
     9. TRANSPORT — PILOTE ENRICHI (18 champs, 5 groupes)
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'transport',
    name: 'Transport',
    description: 'Flotte, km, carburant, taux remplissage, contrats',
    icon: '🚚',
    groups: [
      { id: 'production', label: 'Flotte', icon: '🚚', description: 'Véhicules, capacité, kilométrage' },
      G_COMMERCIAL, G_CHARGES, G_RH, G_REGLEMENTAIRE,
    ],
    fields: [
      // Flotte
      { key: 'nbVehicules', label: 'Nombre de véhicules', type: 'integer', default: 3, group: 'production', min: 1, max: 50 },
      { key: 'capaciteTonnes', label: 'Capacité moyenne / véhicule', type: 'decimal', unit: 'T', default: 10, group: 'production', min: 1, max: 40 },
      { key: 'kmMois', label: 'Km / mois / véhicule', type: 'integer', unit: 'km', default: 4000, group: 'production', min: 1000, max: 12000 },
      { key: 'ageMoyenFlotte', label: 'Âge moyen de la flotte', type: 'integer', unit: 'ans', default: 3, group: 'production', min: 0, max: 15 },
      // Commercial
      { key: 'prixKm', label: 'Prix facturé / km', type: 'currency', unit: 'FCFA', default: 800, group: 'commercial' },
      { key: 'tauxRemplissage', label: 'Taux de remplissage', type: 'percent', unit: '%', default: 75, group: 'commercial', min: 40, max: 95, description: 'Cible : 70-85 %' },
      { key: 'partContratsLongs', label: 'Part contrats longs', type: 'percent', unit: '%', default: 40, group: 'commercial', min: 0, max: 100 },
      // Charges
      { key: 'consoL100', label: 'Consommation', type: 'decimal', unit: 'L/100 km', default: 15, group: 'charges', min: 8, max: 30 },
      { key: 'prixCarburant', label: 'Prix carburant', type: 'currency', unit: 'FCFA/L', default: 750, group: 'charges' },
      { key: 'entretienAnnuel', label: 'Entretien annuel / véhicule', type: 'currency', unit: 'FCFA', default: 1_200_000, group: 'charges' },
      { key: 'assuranceAnnuelle', label: 'Assurance annuelle / véhicule', type: 'currency', unit: 'FCFA', default: 800_000, group: 'charges' },
      { key: 'peagesMensuel', label: 'Péages mensuels / véhicule', type: 'currency', unit: 'FCFA', default: 150_000, group: 'charges' },
      { key: 'fraisAdminMensuel', label: 'Frais admin mensuels', type: 'currency', unit: 'FCFA', default: 200_000, group: 'charges' },
      // RH
      { key: 'nbChauffeurs', label: 'Nombre de chauffeurs', type: 'integer', unit: 'pers', default: 3, group: 'rh' },
      { key: 'salaireChauffeur', label: 'Salaire moyen chauffeur', type: 'currency', unit: 'FCFA', default: 150_000, group: 'rh' },
      { key: 'chargesSociales', label: 'Charges sociales', type: 'percent', unit: '%', default: 20, group: 'rh', min: 0, max: 30 },
      // Réglementaire
      { key: 'taxesTransport', label: 'Taxes transport annuelles', type: 'currency', unit: 'FCFA', default: 500_000, group: 'reglementaire' },
      { key: 'cartesGrises', label: 'Cartes grises (one-time)', type: 'currency', unit: 'FCFA', default: 200_000, group: 'reglementaire' },
    ],
    buildHypotheses: (v) => {
      // CA = véhicules × km/mois × prix/km × taux remplissage
      const caMensuel = v.nbVehicules * v.kmMois * v.prixKm * (v.tauxRemplissage / 100);
      const caAnnuel = caMensuel * 12;
      // Achats = carburant (matière directe)
      const carburantMensuel = v.nbVehicules * v.kmMois * (v.consoL100 / 100) * v.prixCarburant;
      // Charges externes = entretien + assurance + péages + frais admin (mensualisés)
      const chargesExtMensuelles = v.nbVehicules * (v.entretienAnnuel + v.assuranceAnnuelle) / 12
        + v.nbVehicules * v.peagesMensuel
        + v.fraisAdminMensuel
        + v.taxesTransport / 12;
      // Masse salariale
      const masseSal = v.nbChauffeurs * v.salaireChauffeur * 12 * (1 + v.chargesSociales / 100);
      return {
        caMensuel,
        pctAchats: caMensuel > 0 ? (carburantMensuel / caMensuel) * 100 : 25,
        pctChargesExt: caMensuel > 0 ? (chargesExtMensuelles / caMensuel) * 100 : 20,
        masseSalariale: masseSal,
        joursStockage: 0,
        joursClients: 30,
        joursFournisseurs: 15,
      };
    },
    investmentTemplates: [
      { label: 'Flotte 3 camions', category: 'Corporel', cost: 60_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Dégressif' },
      { label: 'Garage / atelier maintenance', category: 'Corporel', cost: 8_000_000, startDate: DEFAULT_INVEST_DATE, duration: 15, mode: 'Linéaire' },
      { label: 'Assurance flotte (1 an)', category: 'Incorporel', cost: 3_000_000, startDate: DEFAULT_INVEST_DATE, duration: 1, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Carburant', 'Entretien véhicules', 'Assurance flotte', 'Chauffeurs', 'Péages', 'Taxes transport'],
    kpisSpecifiques: (v) => {
      const coutKm = (v.consoL100 / 100) * v.prixCarburant;
      const caVehiculeMois = v.kmMois * v.prixKm * (v.tauxRemplissage / 100);
      return [
        { label: 'Coût carburant/km', value: fmt(coutKm), hint: 'FCFA/km', color: 'primary' },
        { label: 'Remplissage', value: v.tauxRemplissage.toFixed(0), hint: '% (cible 70+)', color: v.tauxRemplissage >= 70 ? 'accent' : 'danger' },
        { label: 'Conso', value: v.consoL100.toFixed(1), hint: 'L/100 km', color: 'primary' },
        { label: 'CA/véhicule/mois', value: fmt(caVehiculeMois), hint: 'FCFA', color: 'accent' },
      ];
    },
  },

  /* ═══════════════════════════════════════════════════════════
     10. SERVICES — inchangé
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'services', name: 'Services', description: 'Effectifs, TJM, taux utilisation', icon: '💼',
    fields: [
      { key: 'effectif', label: 'Effectif facturable', type: 'integer', default: 4 },
      { key: 'tjm', label: 'TJM moyen', type: 'currency', unit: 'FCFA', default: 50_000 },
      { key: 'joursFact', label: 'Jours facturables / mois / pers', type: 'integer', default: 18 },
      { key: 'utilisation', label: "Taux d'utilisation", type: 'percent', unit: '%', default: 80 },
    ],
    buildHypotheses: (v) => {
      const caAnnuel = v.effectif * v.tjm * v.joursFact * (v.utilisation / 100) * 12;
      return { caMensuel: caAnnuel / 12, pctAchats: 5, pctChargesExt: 18, masseSalariale: v.effectif * 3_600_000, joursStockage: 0, joursClients: 45, joursFournisseurs: 30 };
    },
    investmentTemplates: [
      { label: 'Bureau & mobilier', category: 'Corporel', cost: 4_000_000, startDate: DEFAULT_INVEST_DATE, duration: 7, mode: 'Linéaire' },
      { label: 'Informatique & logiciels', category: 'Incorporel', cost: 2_500_000, startDate: DEFAULT_INVEST_DATE, duration: 3, mode: 'Linéaire' },
      { label: 'Véhicule de service', category: 'Corporel', cost: 10_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Salaires', 'Loyer bureau', 'Informatique', 'Déplacements', 'Formation', 'Marketing'],
    kpisSpecifiques: (v) => [
      { label: 'Utilisation', value: v.utilisation.toFixed(0), hint: '% (cible 75+)', color: v.utilisation >= 75 ? 'accent' : 'amber' },
      { label: 'TJM', value: fmt(v.tjm), hint: 'FCFA', color: 'primary' },
      { label: 'CA/effectif', value: fmt(v.tjm * v.joursFact * v.utilisation / 100 * 12), hint: 'FCFA/an', color: 'accent' },
      { label: 'Effectif', value: String(v.effectif), hint: 'facturable', color: 'primary' },
    ],
  },

  /* ═══════════════════════════════════════════════════════════
     11. ÉLEVAGE AUTRE — inchangé
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'elevage_autre', name: 'Élevage autre', description: 'Bovins, ovins, porcs, pisciculture', icon: '🐄',
    fields: [
      { key: 'cheptel', label: 'Cheptel initial', type: 'integer', default: 50 },
      { key: 'prixTete', label: 'Prix vente / tête', type: 'currency', unit: 'FCFA', default: 250_000 },
      { key: 'croissance', label: 'Croissance troupeau / an', type: 'percent', unit: '%', default: 20 },
      { key: 'alim', label: 'Alimentation / tête / mois', type: 'currency', unit: 'FCFA', default: 8_000 },
    ],
    buildHypotheses: (v) => {
      const teteVendues = v.cheptel * (v.croissance / 100);
      const caAnnuel = teteVendues * v.prixTete;
      const coutAlim = v.cheptel * v.alim * 12;
      return { caMensuel: caAnnuel / 12, pctAchats: caAnnuel > 0 ? (coutAlim / caAnnuel) * 100 : 40, pctChargesExt: 10, masseSalariale: 7_200_000, joursStockage: 30, joursClients: 15, joursFournisseurs: 20 };
    },
    investmentTemplates: [
      { label: 'Étable / enclos', category: 'Corporel', cost: 8_000_000, startDate: DEFAULT_INVEST_DATE, duration: 15, mode: 'Linéaire' },
      { label: 'Cheptel initial', category: 'Corporel', cost: 12_500_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
      { label: 'Matériel d\'élevage', category: 'Corporel', cost: 2_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Aliments', 'Vétérinaire', 'Main d\'œuvre', 'Eau', 'Litière', 'Transport'],
    kpisSpecifiques: (v) => [
      { label: 'Têtes vendues', value: fmt(v.cheptel * v.croissance / 100), hint: '/an', color: 'primary' },
      { label: 'Croissance', value: v.croissance.toFixed(0), hint: '% (cible 15-25)', color: v.croissance >= 15 ? 'accent' : 'amber' },
      { label: 'Coût alim/tête', value: fmt(v.alim * 12), hint: 'FCFA/an', color: 'primary' },
      { label: 'CA annuel', value: fmt(v.cheptel * v.croissance / 100 * v.prixTete), hint: 'FCFA', color: 'accent' },
    ],
  },

  /* ═══════════════════════════════════════════════════════════
     12. TRANSFORMATION AGRO — inchangé
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'transformation_agro', name: 'Transformation agro', description: 'Capacité, rendement, emballage, distribution', icon: '🥫',
    fields: [
      { key: 'capacite', label: 'Capacité / jour', type: 'integer', unit: 'kg', default: 500 },
      { key: 'jours', label: 'Jours production / mois', type: 'integer', default: 22 },
      { key: 'prixPF', label: 'Prix vente PF / kg', type: 'currency', unit: 'FCFA', default: 1_500 },
      { key: 'coutMP', label: 'Coût MP / kg PF', type: 'currency', unit: 'FCFA', default: 600 },
      { key: 'pertes', label: 'Taux pertes techniques', type: 'percent', unit: '%', default: 5 },
    ],
    buildHypotheses: (v) => {
      const prod = v.capacite * v.jours * 12 * (1 - v.pertes / 100);
      const caAnnuel = prod * v.prixPF;
      return { caMensuel: caAnnuel / 12, pctAchats: caAnnuel > 0 ? (prod * v.coutMP / caAnnuel) * 100 : 40, pctChargesExt: 12, masseSalariale: 15_600_000, joursStockage: 15, joursClients: 30, joursFournisseurs: 15 };
    },
    investmentTemplates: [
      { label: 'Unité de transformation', category: 'Corporel', cost: 18_000_000, startDate: DEFAULT_INVEST_DATE, duration: 10, mode: 'Linéaire' },
      { label: 'Matériel d\'emballage', category: 'Corporel', cost: 5_000_000, startDate: DEFAULT_INVEST_DATE, duration: 7, mode: 'Linéaire' },
      { label: 'Véhicule livraison', category: 'Corporel', cost: 8_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Matières premières', 'Emballage', 'Main d\'œuvre', 'Énergie', 'Eau', 'Transport'],
    kpisSpecifiques: (v) => [
      { label: 'Production', value: fmt(v.capacite * v.jours * 12 * (1 - v.pertes / 100)), hint: 'kg/an', color: 'primary' },
      { label: 'Pertes tech.', value: v.pertes.toFixed(1), hint: '% (max 8)', color: v.pertes <= 8 ? 'accent' : 'danger' },
      { label: 'Marge brute', value: fmt(v.prixPF - v.coutMP), hint: 'FCFA/kg', color: 'accent' },
      { label: 'CA annuel', value: fmt(v.capacite * v.jours * 12 * (1 - v.pertes / 100) * v.prixPF), hint: 'FCFA', color: 'accent' },
    ],
  },

  /* ═══════════════════════════════════════════════════════════
     13. IMMOBILIER / PROMOTION — inchangé
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'immobilier', name: 'Immobilier / Promotion', description: 'Programmes immobiliers, lotissements, promotion', icon: '🏢',
    fields: [
      { key: 'nbLogements', label: 'Nombre de logements / programme', type: 'integer', default: 20 },
      { key: 'prixUnitaire', label: 'Prix moyen / logement', type: 'currency', unit: 'FCFA', default: 25_000_000 },
      { key: 'coutTerrain', label: 'Coût terrain / programme', type: 'currency', unit: 'FCFA', default: 50_000_000 },
      { key: 'coutConstruction', label: 'Coût construction / logement', type: 'currency', unit: 'FCFA', default: 15_000_000 },
      { key: 'dureeProjet', label: 'Durée du programme', type: 'integer', unit: 'mois', default: 24 },
      { key: 'fraisCommerciaux', label: 'Frais commerciaux', type: 'percent', unit: '%', default: 5 },
    ],
    buildHypotheses: (v) => {
      const caTotal = v.nbLogements * v.prixUnitaire;
      const coutTotal = v.coutTerrain + (v.nbLogements * v.coutConstruction);
      const dureeAns = Math.max(1, v.dureeProjet / 12);
      const caAnnuel = caTotal / dureeAns;
      return { caMensuel: caAnnuel / 12, pctAchats: caAnnuel > 0 ? (coutTotal / caTotal) * 100 : 65, pctChargesExt: v.fraisCommerciaux + 5, masseSalariale: 24_000_000, joursStockage: 0, joursClients: 60, joursFournisseurs: 30 };
    },
    investmentTemplates: [
      { label: 'Acquisition terrain', category: 'Corporel', cost: 50_000_000, startDate: DEFAULT_INVEST_DATE, duration: 30, mode: 'Linéaire' },
      { label: 'Construction lotissement (tranche 1)', category: 'Corporel', cost: 150_000_000, startDate: DEFAULT_INVEST_DATE, duration: 30, mode: 'Linéaire' },
      { label: 'Voirie & VRD', category: 'Corporel', cost: 30_000_000, startDate: DEFAULT_INVEST_DATE, duration: 20, mode: 'Linéaire' },
      { label: 'Bureau de vente', category: 'Corporel', cost: 5_000_000, startDate: DEFAULT_INVEST_DATE, duration: 10, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Terrain', 'Construction', 'VRD', 'Frais commerciaux', 'Notaire & actes', 'Personnel'],
    kpisSpecifiques: (v) => {
      const caTotal = v.nbLogements * v.prixUnitaire;
      const coutTotal = v.coutTerrain + (v.nbLogements * v.coutConstruction);
      const margeBrute = caTotal > 0 ? ((caTotal - coutTotal) / caTotal) * 100 : 0;
      return [
        { label: 'Marge brute', value: margeBrute.toFixed(1), hint: '% (cible 20+)', color: margeBrute >= 20 ? 'accent' : 'danger' },
        { label: 'CA programme', value: fmt(caTotal), hint: 'FCFA', color: 'accent' },
        { label: 'Coût total', value: fmt(coutTotal), hint: 'FCFA', color: 'primary' },
        { label: 'Durée', value: String(v.dureeProjet), hint: 'mois', color: 'primary' },
      ];
    },
  },
];

/* ============================================================
   HELPERS
   ============================================================ */
export function getSectorConfig(code: string): SectorConfig {
  return SECTORS.find((s) => s.code === code) || SECTORS[0];
}

export function getDefaultSectorValues(code: string): Record<string, number> {
  const sector = getSectorConfig(code);
  return Object.fromEntries(sector.fields.map((f) => [f.key, f.default]));
}

/**
 * Retourne les groupes d'un secteur.
 * - Si `groups` est défini → l'utilise
 * - Sinon → crée un groupe unique "default" pour rétrocompat
 */
export function getSectorGroups(sector: SectorConfig): SectorFieldGroup[] {
  if (sector.groups && sector.groups.length > 0) return sector.groups;
  return [{ id: 'default', label: sector.name, icon: sector.icon }];
}

export function getFieldsByGroup(sector: SectorConfig, groupId: string): SectorField[] {
  return sector.fields.filter((f) => (f.group ?? 'default') === groupId);
}
