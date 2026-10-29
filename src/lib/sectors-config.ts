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
     2. ANACARDE / CAJOU — PILOTE ENRICHI (18 champs, 5 groupes)
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'anacarde', name: 'Anacarde / Cajou',
    description: 'Production, qualité, transformation, export',
    icon: '🥜',
    groups: [G_PRODUCTION, G_COMMERCIAL, G_CHARGES, G_RH, G_REGLEMENTAIRE],
    fields: [
      { key: 'superficie', label: 'Superficie plantée', type: 'decimal', unit: 'ha', default: 10, group: 'production', min: 1, max: 500 },
      { key: 'nbArbresHa', label: 'Densité plantation', type: 'integer', unit: 'arbres/ha', default: 100, group: 'production', min: 60, max: 200 },
      { key: 'rendementBrut', label: 'Rendement brut', type: 'decimal', unit: 'kg/ha', default: 800, group: 'production', min: 200, max: 2000 },
      { key: 'pertesRecolte', label: 'Pertes post-récolte', type: 'percent', unit: '%', default: 8, group: 'production', min: 2, max: 20 },
      { key: 'tauxTransfoAmande', label: 'Taux transformation amande', type: 'percent', unit: '%', default: 22, group: 'production', min: 18, max: 28, description: 'Standard : 20-24 %' },
      { key: 'prixBordChamp', label: 'Prix bord champ', type: 'currency', unit: 'FCFA/kg', default: 300, group: 'commercial' },
      { key: 'prixAmandeExport', label: 'Prix amande export', type: 'currency', unit: 'FCFA/kg', default: 3500, group: 'commercial' },
      { key: 'partExportDirect', label: 'Part export direct', type: 'percent', unit: '%', default: 70, group: 'commercial', min: 0, max: 100 },
      { key: 'contratsLongTerme', label: 'Part contrats long terme', type: 'percent', unit: '%', default: 40, group: 'commercial', min: 0, max: 100 },
      { key: 'fraisCollecte', label: 'Frais collecte / kg', type: 'currency', unit: 'FCFA/kg', default: 50, group: 'charges' },
      { key: 'intrantsHa', label: 'Intrants / ha / an', type: 'currency', unit: 'FCFA', default: 80000, group: 'charges', description: 'Engrais, pesticides, entretien' },
      { key: 'mainOeuvreSaisonniere', label: "Main d'œuvre saisonnière", type: 'currency', unit: 'FCFA/an', default: 600000, group: 'charges' },
      { key: 'transportUsine', label: 'Transport / kg amande', type: 'currency', unit: 'FCFA', default: 30, group: 'charges' },
      { key: 'emballageExport', label: 'Emballage export / kg', type: 'currency', unit: 'FCFA', default: 100, group: 'charges' },
      { key: 'nbEmployes', label: 'Employés permanents', type: 'integer', unit: 'pers', default: 3, group: 'rh' },
      { key: 'salaireMoyen', label: 'Salaire moyen mensuel', type: 'currency', unit: 'FCFA', default: 80000, group: 'rh' },
      { key: 'chargesSociales', label: 'Charges sociales', type: 'percent', unit: '%', default: 20, group: 'rh', min: 0, max: 30 },
      { key: 'taxesFoncieres', label: 'Taxes foncières annuelles', type: 'currency', unit: 'FCFA', default: 150000, group: 'reglementaire' },
      { key: 'certificationExport', label: 'Certification export (annuelle)', type: 'currency', unit: 'FCFA', default: 300000, group: 'reglementaire' },
    ],
    buildHypotheses: (v) => {
      const prodBrute = v.superficie * v.rendementBrut;
      const prodNette = prodBrute * (1 - v.pertesRecolte / 100);
      const prodAmande = prodNette * (v.tauxTransfoAmande / 100);
      const prodBord = prodNette - prodAmande;
      const partExport = v.partExportDirect / 100;
      const amandeExport = prodAmande * partExport;
      const amandeLocal = prodAmande * (1 - partExport);
      const caExport = amandeExport * v.prixAmandeExport;
      const caBord = (prodBord + amandeLocal) * v.prixBordChamp;
      const caAnnuel = caExport + caBord;
      const achats = v.superficie * v.intrantsHa + v.mainOeuvreSaisonniere + prodBrute * v.fraisCollecte;
      const chargesExt = prodAmande * v.transportUsine + amandeExport * v.emballageExport + v.taxesFoncieres + v.certificationExport;
      const masseSal = v.nbEmployes * v.salaireMoyen * 12 * (1 + v.chargesSociales / 100);
      return {
        caMensuel: caAnnuel / 12,
        pctAchats: caAnnuel > 0 ? (achats / caAnnuel) * 100 : 40,
        pctChargesExt: caAnnuel > 0 ? (chargesExt / caAnnuel) * 100 : 12,
        masseSalariale: masseSal,
        joursStockage: 45, joursClients: 30, joursFournisseurs: 20,
      };
    },
    investmentTemplates: [
      { label: 'Plantation anacardiers', category: 'Corporel', cost: 12_000_000, startDate: DEFAULT_INVEST_DATE, duration: 20, mode: 'Linéaire' },
      { label: 'Matériel de collecte & séchage', category: 'Corporel', cost: 4_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
      { label: 'Unité de transformation amande', category: 'Corporel', cost: 20_000_000, startDate: DEFAULT_INVEST_DATE, duration: 10, mode: 'Linéaire' },
      { label: 'Véhicule utilitaire', category: 'Corporel', cost: 8_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Intrants agricoles', "Main d'œuvre saisonnière", 'Collecte', 'Transport usine', 'Emballage export', 'Personnel permanent', 'Taxes foncières', 'Certification export'],
    kpisSpecifiques: (v) => {
      const prodBrute = v.superficie * v.rendementBrut;
      const prodAmande = prodBrute * (1 - v.pertesRecolte / 100) * (v.tauxTransfoAmande / 100);
      return [
        { label: 'Prod. brute', value: fmt(prodBrute), hint: 'kg/an brut', color: 'primary' },
        { label: 'Amande', value: fmt(prodAmande), hint: 'kg/an amande', color: 'accent' },
        { label: 'Prix export', value: fmt(v.prixAmandeExport), hint: 'FCFA/kg', color: 'primary' },
        { label: 'Rendement', value: fmt(v.rendementBrut), hint: 'kg/ha', color: 'primary' },
      ];
    },
  },
    /* ═══════════════════════════════════════════════════════════
     3. AGRICULTURE — PILOTE ENRICHI (18 champs, 5 groupes)
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'agriculture', name: 'Agriculture',
    description: 'Maïs, riz, maraîchage, intrants, campagnes',
    icon: '🌾',
    groups: [G_PRODUCTION, G_COMMERCIAL, G_CHARGES, G_RH, G_REGLEMENTAIRE],
    fields: [
      { key: 'superficie', label: 'Superficie cultivée', type: 'decimal', unit: 'ha', default: 5, group: 'production', min: 0.5, max: 500 },
      { key: 'rendement', label: 'Rendement', type: 'decimal', unit: 'T/ha', default: 3, group: 'production', min: 0.5, max: 15 },
      { key: 'nbCampagnes', label: 'Campagnes / an', type: 'integer', default: 2, group: 'production', min: 1, max: 3, description: 'Pluviale + contre-saison = 2' },
      { key: 'pertes', label: 'Pertes post-récolte', type: 'percent', unit: '%', default: 8, group: 'production', min: 2, max: 25 },
      { key: 'tauxMecanisation', label: 'Taux mécanisation', type: 'percent', unit: '%', default: 30, group: 'production', min: 0, max: 100 },
      { key: 'prixVente', label: 'Prix de vente / T', type: 'currency', unit: 'FCFA', default: 180000, group: 'commercial' },
      { key: 'partContractuelle', label: 'Part vendue sous contrat', type: 'percent', unit: '%', default: 30, group: 'commercial', min: 0, max: 100 },
      { key: 'primeQualite', label: 'Prime qualité', type: 'percent', unit: '%', default: 10, group: 'commercial', min: 0, max: 50 },
      { key: 'semencesHa', label: 'Semences / ha', type: 'currency', unit: 'FCFA', default: 30000, group: 'charges' },
      { key: 'engraisHa', label: 'Engrais / ha', type: 'currency', unit: 'FCFA', default: 60000, group: 'charges' },
      { key: 'pesticidesHa', label: 'Pesticides / ha', type: 'currency', unit: 'FCFA', default: 25000, group: 'charges' },
      { key: 'mecanisationHa', label: 'Mécanisation / ha', type: 'currency', unit: 'FCFA', default: 40000, group: 'charges' },
      { key: 'transportT', label: 'Transport / T', type: 'currency', unit: 'FCFA', default: 8000, group: 'charges' },
      { key: 'nbEmployes', label: 'Employés permanents', type: 'integer', unit: 'pers', default: 3, group: 'rh' },
      { key: 'salaireMoyen', label: 'Salaire moyen mensuel', type: 'currency', unit: 'FCFA', default: 60000, group: 'rh' },
      { key: 'chargesSociales', label: 'Charges sociales', type: 'percent', unit: '%', default: 20, group: 'rh', min: 0, max: 30 },
      { key: 'taxesFoncieres', label: 'Taxes foncières annuelles', type: 'currency', unit: 'FCFA', default: 100000, group: 'reglementaire' },
      { key: 'certification', label: 'Certification (annuelle)', type: 'currency', unit: 'FCFA', default: 200000, group: 'reglementaire' },
    ],
    buildHypotheses: (v) => {
      const prodTotale = v.superficie * v.rendement * v.nbCampagnes * (1 - v.pertes / 100);
      const prixMoyen = v.prixVente * (1 + v.primeQualite / 100) * (v.partContractuelle / 100) + v.prixVente * (1 - v.partContractuelle / 100);
      const caAnnuel = prodTotale * prixMoyen;
      const achats = v.superficie * v.nbCampagnes * (v.semencesHa + v.engraisHa + v.pesticidesHa + v.mecanisationHa);
      const chargesExt = prodTotale * v.transportT + v.taxesFoncieres + v.certification;
      const masseSal = v.nbEmployes * v.salaireMoyen * 12 * (1 + v.chargesSociales / 100);
      return {
        caMensuel: caAnnuel / 12,
        pctAchats: caAnnuel > 0 ? (achats / caAnnuel) * 100 : 35,
        pctChargesExt: caAnnuel > 0 ? (chargesExt / caAnnuel) * 100 : 10,
        masseSalariale: masseSal,
        joursStockage: 60, joursClients: 45, joursFournisseurs: 15,
      };
    },
    investmentTemplates: [
      { label: 'Matériel agricole (tracteur, charrue)', category: 'Corporel', cost: 12_000_000, startDate: DEFAULT_INVEST_DATE, duration: 8, mode: 'Linéaire' },
      { label: "Système d'irrigation", category: 'Corporel', cost: 4_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
      { label: 'Stockage / hangar', category: 'Corporel', cost: 3_000_000, startDate: DEFAULT_INVEST_DATE, duration: 15, mode: 'Linéaire' },
      { label: 'Véhicule utilitaire', category: 'Corporel', cost: 8_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Semences', 'Engrais', 'Pesticides', 'Mécanisation', "Main d'œuvre", 'Transport', 'Taxes foncières', 'Certification'],
    kpisSpecifiques: (v) => {
      const prodTotale = v.superficie * v.rendement * v.nbCampagnes * (1 - v.pertes / 100);
      return [
        { label: 'Production', value: prodTotale.toFixed(1), hint: 'T/an nettes', color: 'primary' },
        { label: 'Pertes', value: v.pertes.toFixed(1), hint: '% post-récolte', color: v.pertes <= 10 ? 'accent' : 'danger' },
        { label: 'Rendement', value: v.rendement.toFixed(2), hint: 'T/ha', color: 'primary' },
        { label: 'CA annuel', value: fmt(prodTotale * v.prixVente), hint: 'FCFA', color: 'accent' },
      ];
    },
  },
    /* ═══════════════════════════════════════════════════════════
     4. AGRO-INDUSTRIE — PILOTE ENRICHI (20 champs, 5 groupes)
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'agro_industrie', name: 'Agro-industrie',
    description: 'Transformation, capacité, rendement matière',
    icon: '🏭',
    groups: [G_PRODUCTION, G_COMMERCIAL, G_CHARGES, G_RH, G_REGLEMENTAIRE],
    fields: [
      { key: 'capacite', label: 'Capacité mensuelle', type: 'decimal', unit: 'T', default: 20, group: 'production', min: 1, max: 500 },
      { key: 'utilisation', label: "Taux d'utilisation", type: 'percent', unit: '%', default: 75, group: 'production', min: 30, max: 100 },
      { key: 'rendement', label: 'Rendement transformation', type: 'percent', unit: '%', default: 65, group: 'production', min: 40, max: 95 },
      { key: 'pertesTech', label: 'Pertes techniques', type: 'percent', unit: '%', default: 3, group: 'production', min: 0, max: 10 },
      { key: 'joursProdMois', label: 'Jours production / mois', type: 'integer', default: 22, group: 'production', min: 15, max: 30 },
      { key: 'prixPF', label: 'Prix vente PF / T', type: 'currency', unit: 'FCFA', default: 400000, group: 'commercial' },
      { key: 'partExport', label: 'Part export', type: 'percent', unit: '%', default: 30, group: 'commercial', min: 0, max: 100 },
      { key: 'contrats', label: 'Part sous contrat', type: 'percent', unit: '%', default: 50, group: 'commercial', min: 0, max: 100 },
      { key: 'mp', label: 'Matière première / T', type: 'currency', unit: 'FCFA', default: 150000, group: 'charges' },
      { key: 'energieMensuelle', label: 'Énergie mensuelle', type: 'currency', unit: 'FCFA', default: 800000, group: 'charges' },
      { key: 'emballagePF', label: 'Emballage / T PF', type: 'currency', unit: 'FCFA', default: 25000, group: 'charges' },
      { key: 'maintenanceMensuelle', label: 'Maintenance mensuelle', type: 'currency', unit: 'FCFA', default: 400000, group: 'charges' },
      { key: 'transportPF', label: 'Transport / T PF', type: 'currency', unit: 'FCFA', default: 15000, group: 'charges' },
      { key: 'assuranceMensuelle', label: 'Assurance mensuelle', type: 'currency', unit: 'FCFA', default: 150000, group: 'charges' },
      { key: 'nbEmployes', label: 'Employés', type: 'integer', unit: 'pers', default: 12, group: 'rh' },
      { key: 'salaireMoyen', label: 'Salaire moyen mensuel', type: 'currency', unit: 'FCFA', default: 90000, group: 'rh' },
      { key: 'chargesSociales', label: 'Charges sociales', type: 'percent', unit: '%', default: 20, group: 'rh', min: 0, max: 30 },
      { key: 'licenceExploitation', label: "Licence d'exploitation", type: 'currency', unit: 'FCFA', default: 500000, group: 'reglementaire' },
      { key: 'normesQualite', label: 'Normes qualité (annuel)', type: 'currency', unit: 'FCFA', default: 400000, group: 'reglementaire' },
      { key: 'certificationExport', label: 'Certification export', type: 'currency', unit: 'FCFA', default: 600000, group: 'reglementaire' },
    ],
    buildHypotheses: (v) => {
      const mpMensuelle = v.capacite * (v.utilisation / 100);
      const prodPFMensuelle = mpMensuelle * (v.rendement / 100) * (1 - v.pertesTech / 100);
      const caMensuel = prodPFMensuelle * v.prixPF;
      const caAnnuel = caMensuel * 12;
      const coutMP = mpMensuelle * v.mp;
      const coutExt = v.energieMensuelle + v.maintenanceMensuelle + v.assuranceMensuelle
        + prodPFMensuelle * v.emballagePF + prodPFMensuelle * v.transportPF
        + (v.licenceExploitation + v.normesQualite + v.certificationExport) / 12;
      const masseSal = v.nbEmployes * v.salaireMoyen * 12 * (1 + v.chargesSociales / 100);
      return {
        caMensuel,
        pctAchats: caMensuel > 0 ? (coutMP / caMensuel) * 100 : 45,
        pctChargesExt: caMensuel > 0 ? (coutExt / caMensuel) * 100 : 15,
        masseSalariale: masseSal,
        joursStockage: 30, joursClients: 45, joursFournisseurs: 30,
      };
    },
    investmentTemplates: [
      { label: 'Ligne de production complète', category: 'Corporel', cost: 45_000_000, startDate: DEFAULT_INVEST_DATE, duration: 10, mode: 'Linéaire' },
      { label: 'Bâtiment industriel', category: 'Corporel', cost: 25_000_000, startDate: DEFAULT_INVEST_DATE, duration: 20, mode: 'Linéaire' },
      { label: 'Véhicule de livraison', category: 'Corporel', cost: 12_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
      { label: 'Équipement laboratoire qualité', category: 'Corporel', cost: 6_000_000, startDate: DEFAULT_INVEST_DATE, duration: 7, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Matières premières', 'Énergie', 'Emballage', 'Maintenance', 'Transport', "Main d'œuvre", 'Licences & taxes', 'Certification'],
    kpisSpecifiques: (v) => {
      const prodPFMois = v.capacite * (v.utilisation / 100) * (v.rendement / 100) * (1 - v.pertesTech / 100);
      return [
        { label: 'Prod. PF', value: prodPFMois.toFixed(1), hint: 'T/mois', color: 'primary' },
        { label: 'Rendement', value: v.rendement.toFixed(0), hint: '% transfo', color: v.rendement >= 60 ? 'accent' : 'amber' },
        { label: 'Utilisation', value: v.utilisation.toFixed(0), hint: '% capacité', color: v.utilisation >= 70 ? 'accent' : 'amber' },
        { label: 'CA mensuel', value: fmt(prodPFMois * v.prixPF), hint: 'FCFA', color: 'accent' },
      ];
    },
  },
    /* ═══════════════════════════════════════════════════════════
     5. COMMERCE GÉNÉRAL — PILOTE ENRICHI (17 champs, 5 groupes)
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'commerce', name: 'Commerce général',
    description: 'Stock, rotation, marge commerciale, mix produit',
    icon: '🛒',
    groups: [G_PRODUCTION, G_COMMERCIAL, G_CHARGES, G_RH, G_REGLEMENTAIRE],
    fields: [
      { key: 'caCible', label: 'CA mensuel cible', type: 'currency', unit: 'FCFA', default: 5000000, group: 'production' },
      { key: 'marge', label: 'Marge commerciale', type: 'percent', unit: '%', default: 30, group: 'production', min: 5, max: 60 },
      { key: 'rotation', label: 'Rotation stock', type: 'decimal', unit: 'fois/an', default: 6, group: 'production', min: 2, max: 20 },
      { key: 'mixProduitPrincipal', label: 'Part produit principal', type: 'percent', unit: '%', default: 60, group: 'commercial', min: 0, max: 100 },
      { key: 'remisesMoyennes', label: 'Remises moyennes', type: 'percent', unit: '%', default: 5, group: 'commercial', min: 0, max: 20 },
      { key: 'partFideles', label: 'Part clients fidèles', type: 'percent', unit: '%', default: 40, group: 'commercial', min: 0, max: 100 },
      { key: 'saisonnalitePeak', label: 'Pic saisonnier', type: 'percent', unit: '%', default: 20, group: 'commercial', min: 0, max: 80 },
      { key: 'stockInit', label: 'Stock initial', type: 'currency', unit: 'FCFA', default: 2000000, group: 'charges' },
      { key: 'loyerMensuel', label: 'Loyer mensuel', type: 'currency', unit: 'FCFA', default: 350000, group: 'charges' },
      { key: 'energieMensuelle', label: 'Énergie mensuelle', type: 'currency', unit: 'FCFA', default: 80000, group: 'charges' },
      { key: 'marketingMensuel', label: 'Marketing mensuel', type: 'currency', unit: 'FCFA', default: 100000, group: 'charges' },
      { key: 'transportMensuel', label: 'Transport mensuel', type: 'currency', unit: 'FCFA', default: 120000, group: 'charges' },
      { key: 'nbEmployes', label: 'Employés', type: 'integer', unit: 'pers', default: 3, group: 'rh' },
      { key: 'salaireMoyen', label: 'Salaire moyen mensuel', type: 'currency', unit: 'FCFA', default: 70000, group: 'rh' },
      { key: 'chargesSociales', label: 'Charges sociales', type: 'percent', unit: '%', default: 20, group: 'rh', min: 0, max: 30 },
      { key: 'licenceCommerce', label: 'Licence commerce', type: 'currency', unit: 'FCFA', default: 150000, group: 'reglementaire' },
      { key: 'taxesLocales', label: 'Taxes locales annuelles', type: 'currency', unit: 'FCFA', default: 200000, group: 'reglementaire' },
    ],
    buildHypotheses: (v) => {
      const caAnnuel = v.caCible * 12 * (1 - v.remisesMoyennes / 100);
      const achats = caAnnuel * (1 - v.marge / 100);
      const chargesExt = (v.loyerMensuel + v.energieMensuelle + v.marketingMensuel + v.transportMensuel) * 12 + v.licenceCommerce + v.taxesLocales;
      const masseSal = v.nbEmployes * v.salaireMoyen * 12 * (1 + v.chargesSociales / 100);
      return {
        caMensuel: caAnnuel / 12,
        pctAchats: caAnnuel > 0 ? (achats / caAnnuel) * 100 : 70,
        pctChargesExt: caAnnuel > 0 ? (chargesExt / caAnnuel) * 100 : 10,
        masseSalariale: masseSal,
        joursStockage: Math.round(360 / Math.max(1, v.rotation)),
        joursClients: 15, joursFournisseurs: 30,
      };
    },
    investmentTemplates: [
      { label: 'Aménagement magasin', category: 'Corporel', cost: 5_000_000, startDate: DEFAULT_INVEST_DATE, duration: 10, mode: 'Linéaire' },
      { label: 'Stock initial marchandises', category: 'Corporel', cost: 2_000_000, startDate: DEFAULT_INVEST_DATE, duration: 1, mode: 'Linéaire' },
      { label: 'Équipement caisse & informatique', category: 'Incorporel', cost: 1_500_000, startDate: DEFAULT_INVEST_DATE, duration: 3, mode: 'Linéaire' },
      { label: 'Véhicule livraison', category: 'Corporel', cost: 6_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Achats marchandises', 'Loyer local', 'Énergie', 'Marketing', 'Transport', 'Personnel', 'Licences & taxes'],
    kpisSpecifiques: (v) => {
      const caAnnuel = v.caCible * 12 * (1 - v.remisesMoyennes / 100);
      const stockMoyen = caAnnuel > 0 ? (caAnnuel * (1 - v.marge / 100)) / Math.max(1, v.rotation) : 0;
      return [
        { label: 'Marge', value: v.marge.toFixed(1), hint: '% CA', color: v.marge >= 25 ? 'accent' : 'amber' },
        { label: 'Rotation', value: v.rotation.toFixed(1), hint: 'fois/an', color: 'primary' },
        { label: 'Stock moyen', value: fmt(stockMoyen), hint: 'FCFA', color: 'primary' },
        { label: 'CA annuel', value: fmt(caAnnuel), hint: 'FCFA (net remises)', color: 'accent' },
      ];
    },
  },
    /* ═══════════════════════════════════════════════════════════
     6. IMPORT-EXPORT — PILOTE ENRICHI (19 champs, 5 groupes)
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'import_export', name: 'Import-Export',
    description: 'Devise, douane, transit, logistique, contrats',
    icon: '🚢',
    groups: [G_PRODUCTION, G_COMMERCIAL, G_CHARGES, G_RH, G_REGLEMENTAIRE],
    fields: [
      { key: 'cifMensuel', label: 'Valeur CIF mensuelle', type: 'currency', unit: 'FCFA', default: 8000000, group: 'production' },
      { key: 'volumeConteneurs', label: 'Conteneurs / mois', type: 'integer', default: 4, group: 'production', min: 1, max: 100 },
      { key: 'coefDevise', label: 'Coefficient devise', type: 'decimal', unit: 'x', default: 1, group: 'production', description: 'Ajustement FCFA/USD/EUR' },
      { key: 'margeRevente', label: 'Marge revente', type: 'percent', unit: '%', default: 25, group: 'commercial', min: 5, max: 60 },
      { key: 'partLocal', label: 'Part vente locale', type: 'percent', unit: '%', default: 60, group: 'commercial', min: 0, max: 100 },
      { key: 'partExport', label: "Part export", type: 'percent', unit: '%', default: 40, group: 'commercial', min: 0, max: 100 },
      { key: 'contrats', label: 'Part sous contrat', type: 'percent', unit: '%', default: 40, group: 'commercial', min: 0, max: 100 },
      { key: 'droitsDouane', label: 'Droits de douane', type: 'percent', unit: '% CIF', default: 20, group: 'charges', min: 0, max: 50 },
      { key: 'fraisTransit', label: 'Frais transit', type: 'percent', unit: '% CIF', default: 8, group: 'charges', min: 0, max: 25 },
      { key: 'assuranceCIF', label: 'Assurance CIF', type: 'percent', unit: '% CIF', default: 2, group: 'charges', min: 0, max: 10 },
      { key: 'fraisPortuaire', label: 'Frais portuaire / conteneur', type: 'currency', unit: 'FCFA', default: 250000, group: 'charges' },
      { key: 'transportLocal', label: 'Transport local mensuel', type: 'currency', unit: 'FCFA', default: 400000, group: 'charges' },
      { key: 'fraisBancaires', label: 'Frais bancaires', type: 'percent', unit: '% CIF', default: 1, group: 'charges', min: 0, max: 5 },
      { key: 'nbEmployes', label: 'Employés', type: 'integer', unit: 'pers', default: 5, group: 'rh' },
      { key: 'salaireMoyen', label: 'Salaire moyen mensuel', type: 'currency', unit: 'FCFA', default: 100000, group: 'rh' },
      { key: 'chargesSociales', label: 'Charges sociales', type: 'percent', unit: '%', default: 20, group: 'rh', min: 0, max: 30 },
      { key: 'licenceImport', label: "Licence d'importation", type: 'currency', unit: 'FCFA', default: 400000, group: 'reglementaire' },
      { key: 'licenceExport', label: "Licence d'exportation", type: 'currency', unit: 'FCFA', default: 400000, group: 'reglementaire' },
      { key: 'taxesSpecifiques', label: 'Taxes spécifiques', type: 'currency', unit: 'FCFA', default: 300000, group: 'reglementaire' },
    ],
    buildHypotheses: (v) => {
      const cifEffectif = v.cifMensuel * v.coefDevise;
      const caMensuel = cifEffectif * (1 + v.margeRevente / 100);
      const caAnnuel = caMensuel * 12;
      const achats = cifEffectif * 12;
      const chargesDouane = cifEffectif * (v.droitsDouane / 100 + v.fraisTransit / 100 + v.assuranceCIF / 100 + v.fraisBancaires / 100);
      const chargesExt = chargesDouane * 12 + v.fraisPortuaire * v.volumeConteneurs * 12 + v.transportLocal * 12
        + v.licenceImport + v.licenceExport + v.taxesSpecifiques;
      const masseSal = v.nbEmployes * v.salaireMoyen * 12 * (1 + v.chargesSociales / 100);
      return {
        caMensuel,
        pctAchats: caMensuel > 0 ? (achats / caMensuel) * 100 : 80,
        pctChargesExt: caMensuel > 0 ? (chargesExt / caAnnuel) * 100 : 10,
        masseSalariale: masseSal,
        joursStockage: 45, joursClients: 30, joursFournisseurs: 15,
      };
    },
    investmentTemplates: [
      { label: 'Fonds de roulement marchandises', category: 'Corporel', cost: 15_000_000, startDate: DEFAULT_INVEST_DATE, duration: 1, mode: 'Linéaire' },
      { label: 'Véhicule utilitaire', category: 'Corporel', cost: 8_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
      { label: 'Bureau & informatique', category: 'Incorporel', cost: 2_500_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
      { label: 'Caution bancaire', category: 'Financier', cost: 3_000_000, startDate: DEFAULT_INVEST_DATE, duration: 1, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Achats CIF', 'Droits de douane', 'Frais transit', 'Assurance CIF', 'Frais portuaire', 'Transport local', 'Frais bancaires', 'Licences & taxes'],
    kpisSpecifiques: (v) => {
      const cifEff = v.cifMensuel * v.coefDevise;
      return [
        { label: 'Droits douane', value: v.droitsDouane.toFixed(0), hint: '% CIF', color: 'primary' },
        { label: 'Marge revente', value: v.margeRevente.toFixed(0), hint: '%', color: v.margeRevente >= 20 ? 'accent' : 'amber' },
        { label: 'CA mensuel', value: fmt(cifEff * (1 + v.margeRevente / 100)), hint: 'FCFA', color: 'accent' },
        { label: 'Frais transit', value: v.fraisTransit.toFixed(0), hint: '% CIF', color: 'primary' },
      ];
    },
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
     8. BTP — PILOTE ENRICHI (20 champs, 5 groupes)
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'btp', name: 'BTP',
    description: 'Chantiers, matériaux, sous-traitance, cautions',
    icon: '🏗️',
    groups: [G_PRODUCTION, G_COMMERCIAL, G_CHARGES, G_RH, G_REGLEMENTAIRE],
    fields: [
      { key: 'nbChantiersActifs', label: 'Chantiers actifs simultanés', type: 'integer', default: 3, group: 'production', min: 1, max: 20 },
      { key: 'tailleMoyenneChantier', label: 'Taille moyenne chantier', type: 'currency', unit: 'FCFA', default: 5000000, group: 'production' },
      { key: 'dureeMoyenneChantier', label: 'Durée moyenne chantier', type: 'integer', unit: 'mois', default: 6, group: 'production', min: 2, max: 36 },
      { key: 'tauxAvancement', label: 'Taux avancement moyen', type: 'percent', unit: '%', default: 60, group: 'production', min: 30, max: 100 },
      { key: 'joursFacturation', label: 'Délai paiement client', type: 'integer', unit: 'jours', default: 90, group: 'production', min: 30, max: 180 },
      { key: 'margeNetteCible', label: 'Marge nette cible', type: 'percent', unit: '%', default: 15, group: 'commercial', min: 5, max: 30 },
      { key: 'remisesMoyennes', label: 'Remises moyennes', type: 'percent', unit: '%', default: 5, group: 'commercial', min: 0, max: 20 },
      { key: 'partSousTraitance', label: 'Part sous-traitance', type: 'percent', unit: '%', default: 15, group: 'commercial', min: 0, max: 40 },
      { key: 'retenueGarantiePct', label: 'Retenue de garantie', type: 'percent', unit: '%', default: 5, group: 'commercial', min: 0, max: 10 },
      { key: 'dureeRetenue', label: 'Durée retenue de garantie', type: 'integer', unit: 'mois', default: 12, group: 'commercial', min: 6, max: 24 },
      { key: 'materiauxPct', label: 'Matériaux (% CA)', type: 'percent', unit: '%', default: 40, group: 'charges', min: 20, max: 60 },
      { key: 'mainOeuvreChantierPct', label: "Main d'œuvre chantier (% CA)", type: 'percent', unit: '%', default: 15, group: 'charges', min: 5, max: 30 },
      { key: 'carburantMensuel', label: 'Carburant mensuel', type: 'currency', unit: 'FCFA', default: 500000, group: 'charges' },
      { key: 'locationMateriel', label: 'Location matériel mensuel', type: 'currency', unit: 'FCFA', default: 800000, group: 'charges' },
      { key: 'assuranceChantier', label: 'Assurance chantier mensuel', type: 'currency', unit: 'FCFA', default: 300000, group: 'charges' },
      { key: 'fraisGeneraux', label: 'Frais généraux mensuels', type: 'currency', unit: 'FCFA', default: 1000000, group: 'charges' },
      { key: 'nbEmployes', label: 'Employés permanents', type: 'integer', unit: 'pers', default: 8, group: 'rh', min: 1, max: 200 },
      { key: 'salaireMoyen', label: 'Salaire moyen mensuel', type: 'currency', unit: 'FCFA', default: 100000, group: 'rh' },
      { key: 'chargesSociales', label: 'Charges sociales', type: 'percent', unit: '%', default: 20, group: 'rh', min: 0, max: 30 },
      { key: 'cautionsBancaires', label: 'Cautions bancaires annuelles', type: 'currency', unit: 'FCFA', default: 1500000, group: 'reglementaire' },
    ],
    buildHypotheses: (v) => {
      const facturationMensuelle = v.nbChantiersActifs * (v.tailleMoyenneChantier / Math.max(1, v.dureeMoyenneChantier));
      const caMensuel = facturationMensuelle * (v.tauxAvancement / 100) * (1 - v.remisesMoyennes / 100);
      const caAnnuel = caMensuel * 12;
      const achats = caMensuel * ((v.materiauxPct + v.mainOeuvreChantierPct + v.partSousTraitance) / 100);
      const chargesExt = v.carburantMensuel + v.locationMateriel + v.assuranceChantier + v.fraisGeneraux + v.cautionsBancaires / 12;
      const masseSal = v.nbEmployes * v.salaireMoyen * 12 * (1 + v.chargesSociales / 100);
      return {
        caMensuel,
        pctAchats: caMensuel > 0 ? (achats / caMensuel) * 100 : 55,
        pctChargesExt: caMensuel > 0 ? (chargesExt / caMensuel) * 100 : 15,
        masseSalariale: masseSal,
        joursStockage: 30, joursClients: v.joursFacturation, joursFournisseurs: 45,
      };
    },
    investmentTemplates: [
      { label: 'Matériel de chantier', category: 'Corporel', cost: 20_000_000, startDate: DEFAULT_INVEST_DATE, duration: 7, mode: 'Linéaire' },
      { label: 'Véhicules utilitaires', category: 'Corporel', cost: 15_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
      { label: 'Bureau & dépôt', category: 'Corporel', cost: 8_000_000, startDate: DEFAULT_INVEST_DATE, duration: 15, mode: 'Linéaire' },
      { label: 'Cautions bancaires (fonds)', category: 'Financier', cost: 3_000_000, startDate: DEFAULT_INVEST_DATE, duration: 1, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Matériaux', 'Sous-traitance', "Main d'œuvre chantier", 'Carburant', 'Location matériel', 'Assurance chantier', 'Frais généraux', 'Personnel permanent', 'Cautions bancaires'],
    kpisSpecifiques: (v) => {
      const factMois = v.nbChantiersActifs * (v.tailleMoyenneChantier / Math.max(1, v.dureeMoyenneChantier)) * (v.tauxAvancement / 100);
      const margeBrute = 100 - v.materiauxPct - v.mainOeuvreChantierPct - v.partSousTraitance;
      return [
        { label: 'Marge brute', value: margeBrute.toFixed(1), hint: '% CA', color: margeBrute >= 20 ? 'accent' : 'danger' },
        { label: 'Chantiers actifs', value: String(v.nbChantiersActifs), hint: 'en cours', color: 'primary' },
        { label: 'Sous-traitance', value: v.partSousTraitance.toFixed(0), hint: '% CA', color: 'primary' },
        { label: 'Facturation/mois', value: fmt(factMois), hint: 'FCFA', color: 'accent' },
      ];
    },
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
     10. SERVICES — PILOTE ENRICHI (17 champs, 5 groupes)
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'services', name: 'Services',
    description: 'Effectifs, TJM, taux utilisation, missions',
    icon: '💼',
    groups: [G_PRODUCTION, G_COMMERCIAL, G_CHARGES, G_RH, G_REGLEMENTAIRE],
    fields: [
      { key: 'effectifFacturable', label: 'Effectif facturable', type: 'integer', default: 4, group: 'production', min: 1, max: 100 },
      { key: 'joursFacturablesMois', label: 'Jours facturables / mois / pers', type: 'integer', default: 18, group: 'production', min: 10, max: 22 },
      { key: 'tauxUtilisation', label: "Taux d'utilisation", type: 'percent', unit: '%', default: 80, group: 'production', min: 50, max: 100, description: 'Cible : 75-85 %' },
      { key: 'nbMissionsMois', label: 'Missions / mois', type: 'integer', default: 4, group: 'production', min: 1, max: 30 },
      { key: 'tjmMoyen', label: 'TJM moyen', type: 'currency', unit: 'FCFA', default: 50000, group: 'commercial' },
      { key: 'tarifHoraire', label: 'Tarif horaire moyen', type: 'currency', unit: 'FCFA', default: 8000, group: 'commercial' },
      { key: 'remises', label: 'Remises moyennes', type: 'percent', unit: '%', default: 5, group: 'commercial', min: 0, max: 20 },
      { key: 'partContratsLongs', label: 'Part contrats longs', type: 'percent', unit: '%', default: 30, group: 'commercial', min: 0, max: 100 },
      { key: 'loyerBureau', label: 'Loyer bureau mensuel', type: 'currency', unit: 'FCFA', default: 300000, group: 'charges' },
      { key: 'informatiqueLogiciels', label: 'Informatique & logiciels', type: 'currency', unit: 'FCFA', default: 200000, group: 'charges', description: 'Abonnements mensuels' },
      { key: 'deplacements', label: 'Déplacements mensuels', type: 'currency', unit: 'FCFA', default: 400000, group: 'charges' },
      { key: 'formationMensuelle', label: 'Formation mensuelle', type: 'currency', unit: 'FCFA', default: 100000, group: 'charges' },
      { key: 'marketingMensuel', label: 'Marketing mensuel', type: 'currency', unit: 'FCFA', default: 150000, group: 'charges' },
      { key: 'nbEmployes', label: 'Employés', type: 'integer', unit: 'pers', default: 5, group: 'rh', min: 1, max: 100 },
      { key: 'salaireMoyen', label: 'Salaire moyen mensuel', type: 'currency', unit: 'FCFA', default: 300000, group: 'rh' },
      { key: 'chargesSociales', label: 'Charges sociales', type: 'percent', unit: '%', default: 20, group: 'rh', min: 0, max: 30 },
      { key: 'taxesProfessionnelles', label: 'Taxes professionnelles annuelles', type: 'currency', unit: 'FCFA', default: 200000, group: 'reglementaire' },
    ],
    buildHypotheses: (v) => {
      const caMensuel = v.effectifFacturable * v.tjmMoyen * v.joursFacturablesMois * (v.tauxUtilisation / 100) * (1 - v.remises / 100);
      const achats = caMensuel * 0.05;
      const chargesExt = v.loyerBureau + v.informatiqueLogiciels + v.deplacements + v.formationMensuelle + v.marketingMensuel + v.taxesProfessionnelles / 12;
      const masseSal = v.nbEmployes * v.salaireMoyen * 12 * (1 + v.chargesSociales / 100);
      return {
        caMensuel,
        pctAchats: caMensuel > 0 ? (achats / caMensuel) * 100 : 5,
        pctChargesExt: caMensuel > 0 ? (chargesExt / caMensuel) * 100 : 18,
        masseSalariale: masseSal,
        joursStockage: 0, joursClients: 45, joursFournisseurs: 30,
      };
    },
    investmentTemplates: [
      { label: 'Bureau & mobilier', category: 'Corporel', cost: 4_000_000, startDate: DEFAULT_INVEST_DATE, duration: 7, mode: 'Linéaire' },
      { label: 'Informatique & logiciels', category: 'Incorporel', cost: 2_500_000, startDate: DEFAULT_INVEST_DATE, duration: 3, mode: 'Linéaire' },
      { label: 'Véhicule de service', category: 'Corporel', cost: 10_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Salaires', 'Loyer bureau', 'Informatique', 'Déplacements', 'Formation', 'Marketing', 'Taxes professionnelles'],
    kpisSpecifiques: (v) => {
      const caMois = v.effectifFacturable * v.tjmMoyen * v.joursFacturablesMois * (v.tauxUtilisation / 100);
      return [
        { label: 'Utilisation', value: v.tauxUtilisation.toFixed(0), hint: '% (cible 75+)', color: v.tauxUtilisation >= 75 ? 'accent' : 'amber' },
        { label: 'TJM', value: fmt(v.tjmMoyen), hint: 'FCFA', color: 'primary' },
        { label: 'CA/effectif', value: fmt(v.tjmMoyen * v.joursFacturablesMois * v.tauxUtilisation / 100 * 12), hint: 'FCFA/an', color: 'accent' },
        { label: 'CA mensuel', value: fmt(caMois), hint: 'FCFA', color: 'accent' },
      ];
    },
  },
    /* ═══════════════════════════════════════════════════════════
     11. ÉLEVAGE AUTRE — PILOTE ENRICHI (18 champs, 5 groupes)
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'elevage_autre', name: 'Élevage autre',
    description: 'Bovins, ovins, porcs, pisciculture',
    icon: '🐄',
    groups: [G_PRODUCTION, G_COMMERCIAL, G_CHARGES, G_RH, G_REGLEMENTAIRE],
    fields: [
      { key: 'cheptelInitial', label: 'Cheptel initial', type: 'integer', unit: 'têtes', default: 50, group: 'production', min: 5, max: 5000 },
      { key: 'tauxCroissance', label: 'Taux de croissance troupeau', type: 'percent', unit: '%', default: 20, group: 'production', min: 10, max: 40 },
      { key: 'tauxMortalite', label: 'Taux de mortalité', type: 'percent', unit: '%', default: 8, group: 'production', min: 2, max: 20 },
      { key: 'dureeEngraissement', label: 'Durée engraissement', type: 'integer', unit: 'mois', default: 18, group: 'production', min: 6, max: 36 },
      { key: 'poidsMoyenVente', label: 'Poids moyen à la vente', type: 'decimal', unit: 'kg', default: 400, group: 'production', min: 20, max: 800 },
      { key: 'prixVenteTete', label: 'Prix vente / tête', type: 'currency', unit: 'FCFA', default: 250000, group: 'commercial' },
      { key: 'prixVenteKg', label: 'Prix vente / kg', type: 'currency', unit: 'FCFA', default: 2000, group: 'commercial' },
      { key: 'partVenteDirecte', label: 'Part vente directe', type: 'percent', unit: '%', default: 40, group: 'commercial', min: 0, max: 100 },
      { key: 'pertes', label: 'Pertes / invendus', type: 'percent', unit: '%', default: 5, group: 'commercial', min: 0, max: 15 },
      { key: 'alimentationTeteMois', label: 'Alimentation / tête / mois', type: 'currency', unit: 'FCFA', default: 8000, group: 'charges' },
      { key: 'veterinaireTeteAn', label: 'Vétérinaire / tête / an', type: 'currency', unit: 'FCFA', default: 15000, group: 'charges' },
      { key: 'eauMensuel', label: 'Eau mensuelle', type: 'currency', unit: 'FCFA', default: 50000, group: 'charges' },
      { key: 'litiereMensuel', label: 'Litière mensuelle', type: 'currency', unit: 'FCFA', default: 40000, group: 'charges' },
      { key: 'transportTete', label: 'Transport / tête vendue', type: 'currency', unit: 'FCFA', default: 10000, group: 'charges' },
      { key: 'nbEmployes', label: 'Employés', type: 'integer', unit: 'pers', default: 2, group: 'rh', min: 1, max: 50 },
      { key: 'salaireMoyen', label: 'Salaire moyen mensuel', type: 'currency', unit: 'FCFA', default: 70000, group: 'rh' },
      { key: 'chargesSociales', label: 'Charges sociales', type: 'percent', unit: '%', default: 20, group: 'rh', min: 0, max: 30 },
      { key: 'autorisationSanitaire', label: 'Autorisation sanitaire annuelle', type: 'currency', unit: 'FCFA', default: 150000, group: 'reglementaire' },
    ],
    buildHypotheses: (v) => {
      const tetesVendues = v.cheptelInitial * (v.tauxCroissance / 100) * (1 - v.tauxMortalite / 100);
      const caAnnuel = tetesVendues * v.prixVenteTete * (1 - v.pertes / 100);
      const achats = v.cheptelInitial * v.alimentationTeteMois * 12 + v.cheptelInitial * v.veterinaireTeteAn;
      const chargesExt = (v.eauMensuel + v.litiereMensuel) * 12 + tetesVendues * v.transportTete + v.autorisationSanitaire;
      const masseSal = v.nbEmployes * v.salaireMoyen * 12 * (1 + v.chargesSociales / 100);
      return {
        caMensuel: caAnnuel / 12,
        pctAchats: caAnnuel > 0 ? (achats / caAnnuel) * 100 : 40,
        pctChargesExt: caAnnuel > 0 ? (chargesExt / caAnnuel) * 100 : 10,
        masseSalariale: masseSal,
        joursStockage: 30, joursClients: 15, joursFournisseurs: 20,
      };
    },
    investmentTemplates: [
      { label: 'Étable / enclos', category: 'Corporel', cost: 8_000_000, startDate: DEFAULT_INVEST_DATE, duration: 15, mode: 'Linéaire' },
      { label: 'Cheptel initial', category: 'Corporel', cost: 12_500_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
      { label: 'Matériel élevage', category: 'Corporel', cost: 2_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Aliments', 'Vétérinaire', "Main d'œuvre", 'Eau', 'Litière', 'Transport', 'Autorisation sanitaire'],
    kpisSpecifiques: (v) => {
      const tetesVendues = v.cheptelInitial * (v.tauxCroissance / 100) * (1 - v.tauxMortalite / 100);
      return [
        { label: 'Têtes vendues', value: fmt(tetesVendues), hint: '/an', color: 'primary' },
        { label: 'Croissance', value: v.tauxCroissance.toFixed(0), hint: '% (cible 15-25)', color: v.tauxCroissance >= 15 ? 'accent' : 'amber' },
        { label: 'Mortalité', value: v.tauxMortalite.toFixed(1), hint: '% (max 10)', color: v.tauxMortalite <= 10 ? 'accent' : 'danger' },
        { label: 'CA annuel', value: fmt(tetesVendues * v.prixVenteTete), hint: 'FCFA', color: 'accent' },
      ];
    },
  },
    /* ═══════════════════════════════════════════════════════════
     12. TRANSFORMATION AGRO — PILOTE ENRICHI (19 champs, 5 groupes)
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'transformation_agro', name: 'Transformation agro',
    description: 'Capacité, rendement, emballage, distribution',
    icon: '🥫',
    groups: [G_PRODUCTION, G_COMMERCIAL, G_CHARGES, G_RH, G_REGLEMENTAIRE],
    fields: [
      { key: 'capaciteJour', label: 'Capacité / jour', type: 'integer', unit: 'kg', default: 500, group: 'production', min: 50, max: 20000 },
      { key: 'joursProdMois', label: 'Jours production / mois', type: 'integer', default: 22, group: 'production', min: 15, max: 30 },
      { key: 'tauxUtilisation', label: "Taux d'utilisation", type: 'percent', unit: '%', default: 85, group: 'production', min: 30, max: 100 },
      { key: 'pertesTech', label: 'Pertes techniques', type: 'percent', unit: '%', default: 5, group: 'production', min: 0, max: 15 },
      { key: 'prixPF', label: 'Prix vente PF / kg', type: 'currency', unit: 'FCFA', default: 1500, group: 'commercial' },
      { key: 'partExport', label: 'Part export', type: 'percent', unit: '%', default: 10, group: 'commercial', min: 0, max: 100 },
      { key: 'contratsLongs', label: 'Part sous contrat', type: 'percent', unit: '%', default: 40, group: 'commercial', min: 0, max: 100 },
      { key: 'margeCible', label: 'Marge brute cible', type: 'percent', unit: '%', default: 35, group: 'commercial', min: 15, max: 60 },
      { key: 'coutMP', label: 'Coût matière première / kg PF', type: 'currency', unit: 'FCFA', default: 600, group: 'charges' },
      { key: 'emballage', label: 'Emballage / kg PF', type: 'currency', unit: 'FCFA', default: 80, group: 'charges' },
      { key: 'energieMensuel', label: 'Énergie mensuelle', type: 'currency', unit: 'FCFA', default: 400000, group: 'charges' },
      { key: 'eauMensuel', label: 'Eau mensuelle', type: 'currency', unit: 'FCFA', default: 100000, group: 'charges' },
      { key: 'transportMensuel', label: 'Transport mensuel', type: 'currency', unit: 'FCFA', default: 300000, group: 'charges' },
      { key: 'maintenanceMensuel', label: 'Maintenance mensuelle', type: 'currency', unit: 'FCFA', default: 200000, group: 'charges' },
      { key: 'nbEmployes', label: 'Employés', type: 'integer', unit: 'pers', default: 8, group: 'rh', min: 1, max: 100 },
      { key: 'salaireMoyen', label: 'Salaire moyen mensuel', type: 'currency', unit: 'FCFA', default: 80000, group: 'rh' },
      { key: 'chargesSociales', label: 'Charges sociales', type: 'percent', unit: '%', default: 20, group: 'rh', min: 0, max: 30 },
      { key: 'normesQualite', label: 'Normes qualité annuelles', type: 'currency', unit: 'FCFA', default: 300000, group: 'reglementaire' },
      { key: 'licenceExploitation', label: "Licence d'exploitation", type: 'currency', unit: 'FCFA', default: 400000, group: 'reglementaire' },
    ],
    buildHypotheses: (v) => {
      const prodJour = v.capaciteJour * (v.tauxUtilisation / 100);
      const prodMois = prodJour * v.joursProdMois * (1 - v.pertesTech / 100);
      const caMensuel = prodMois * v.prixPF;
      const achats = prodMois * (v.coutMP + v.emballage);
      const chargesExt = v.energieMensuel + v.eauMensuel + v.transportMensuel + v.maintenanceMensuel + (v.normesQualite + v.licenceExploitation) / 12;
      const masseSal = v.nbEmployes * v.salaireMoyen * 12 * (1 + v.chargesSociales / 100);
      return {
        caMensuel,
        pctAchats: caMensuel > 0 ? (achats / caMensuel) * 100 : 45,
        pctChargesExt: caMensuel > 0 ? (chargesExt / caMensuel) * 100 : 12,
        masseSalariale: masseSal,
        joursStockage: 15, joursClients: 30, joursFournisseurs: 15,
      };
    },
    investmentTemplates: [
      { label: 'Unité de transformation', category: 'Corporel', cost: 18_000_000, startDate: DEFAULT_INVEST_DATE, duration: 10, mode: 'Linéaire' },
      { label: "Matériel d'emballage", category: 'Corporel', cost: 5_000_000, startDate: DEFAULT_INVEST_DATE, duration: 7, mode: 'Linéaire' },
      { label: 'Véhicule livraison', category: 'Corporel', cost: 8_000_000, startDate: DEFAULT_INVEST_DATE, duration: 5, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Matières premières', 'Emballage', "Main d'œuvre", 'Énergie', 'Eau', 'Transport', 'Maintenance', 'Normes & licences'],
    kpisSpecifiques: (v) => {
      const prodMois = v.capaciteJour * (v.tauxUtilisation / 100) * v.joursProdMois * (1 - v.pertesTech / 100);
      return [
        { label: 'Production', value: fmt(prodMois * 12), hint: 'kg/an', color: 'primary' },
        { label: 'Pertes tech.', value: v.pertesTech.toFixed(1), hint: '% (max 8)', color: v.pertesTech <= 8 ? 'accent' : 'danger' },
        { label: 'Marge brute', value: fmt(v.prixPF - v.coutMP - v.emballage), hint: 'FCFA/kg', color: 'accent' },
        { label: 'CA mensuel', value: fmt(prodMois * v.prixPF), hint: 'FCFA', color: 'accent' },
      ];
    },
  },
    /* ═══════════════════════════════════════════════════════════
     13. IMMOBILIER / PROMOTION — PILOTE ENRICHI (20 champs, 5 groupes)
     ═══════════════════════════════════════════════════════════ */
  {
    code: 'immobilier', name: 'Immobilier / Promotion',
    description: 'Programmes immobiliers, lotissements, promotion',
    icon: '🏢',
    groups: [G_PRODUCTION, G_COMMERCIAL, G_CHARGES, G_RH, G_REGLEMENTAIRE],
    fields: [
      { key: 'nbLogements', label: 'Nombre de logements', type: 'integer', default: 20, group: 'production', min: 1, max: 500 },
      { key: 'dureeProgramme', label: 'Durée du programme', type: 'integer', unit: 'mois', default: 24, group: 'production', min: 6, max: 60 },
      { key: 'surfaceMoyenne', label: 'Surface moyenne / logement', type: 'decimal', unit: 'm²', default: 100, group: 'production', min: 30, max: 500 },
      { key: 'nbTranches', label: 'Nombre de tranches', type: 'integer', default: 2, group: 'production', min: 1, max: 6 },
      { key: 'prixUnitaireLogement', label: 'Prix vente / logement', type: 'currency', unit: 'FCFA', default: 25000000, group: 'commercial' },
      { key: 'prixM2', label: 'Prix moyen / m²', type: 'currency', unit: 'FCFA', default: 250000, group: 'commercial' },
      { key: 'tauxPrelocation', label: 'Taux de pré-location', type: 'percent', unit: '%', default: 60, group: 'commercial', min: 0, max: 100 },
      { key: 'delaiVenteMoyen', label: 'Délai de vente moyen', type: 'integer', unit: 'mois', default: 6, group: 'commercial', min: 1, max: 24 },
      { key: 'coutTerrainTotal', label: 'Coût terrain / programme', type: 'currency', unit: 'FCFA', default: 50000000, group: 'charges' },
      { key: 'coutConstructionLogement', label: 'Coût construction / logement', type: 'currency', unit: 'FCFA', default: 15000000, group: 'charges' },
      { key: 'coutVRD', label: 'Coût VRD (voirie & réseaux)', type: 'currency', unit: 'FCFA', default: 30000000, group: 'charges' },
      { key: 'fraisCommerciaux', label: 'Frais commerciaux', type: 'percent', unit: '% CA', default: 5, group: 'charges', min: 0, max: 15 },
      { key: 'fraisNotaire', label: 'Frais notaire & actes', type: 'percent', unit: '% CA', default: 3, group: 'charges', min: 0, max: 10 },
      { key: 'taxesFoncieres', label: 'Taxes foncières annuelles', type: 'currency', unit: 'FCFA', default: 500000, group: 'charges' },
      { key: 'nbEmployes', label: 'Employés', type: 'integer', unit: 'pers', default: 5, group: 'rh', min: 1, max: 50 },
      { key: 'salaireMoyen', label: 'Salaire moyen mensuel', type: 'currency', unit: 'FCFA', default: 150000, group: 'rh' },
      { key: 'chargesSociales', label: 'Charges sociales', type: 'percent', unit: '%', default: 20, group: 'rh', min: 0, max: 30 },
      { key: 'permisConstruire', label: 'Permis de construire', type: 'currency', unit: 'FCFA', default: 2000000, group: 'reglementaire' },
      { key: 'agrementPromoteur', label: 'Agrément promoteur', type: 'currency', unit: 'FCFA', default: 1000000, group: 'reglementaire' },
      { key: 'assuranceProgramme', label: 'Assurance programme', type: 'currency', unit: 'FCFA', default: 1500000, group: 'reglementaire' },
    ],
    buildHypotheses: (v) => {
      const caTotal = v.nbLogements * v.prixUnitaireLogement;
      const dureeAns = Math.max(1, v.dureeProgramme / 12);
      const caAnnuel = caTotal / dureeAns;
      const caMensuel = caAnnuel / 12;
      const coutTotal = v.coutTerrainTotal + v.nbLogements * v.coutConstructionLogement + v.coutVRD;
      const pctAchats = caTotal > 0 ? (coutTotal / caTotal) * 100 : 65;
      const fraisPct = (v.fraisCommerciaux + v.fraisNotaire) / 100;
      const chargesExt = caAnnuel * fraisPct + v.taxesFoncieres + (v.permisConstruire + v.agrementPromoteur + v.assuranceProgramme) / dureeAns;
      const masseSal = v.nbEmployes * v.salaireMoyen * 12 * (1 + v.chargesSociales / 100);
      return {
        caMensuel,
        pctAchats,
        pctChargesExt: caAnnuel > 0 ? (chargesExt / caAnnuel) * 100 : 10,
        masseSalariale: masseSal,
        joursStockage: 0, joursClients: 60, joursFournisseurs: 30,
      };
    },
    investmentTemplates: [
      { label: 'Acquisition terrain', category: 'Corporel', cost: 50_000_000, startDate: DEFAULT_INVEST_DATE, duration: 30, mode: 'Linéaire' },
      { label: 'Construction lotissement (tranche 1)', category: 'Corporel', cost: 150_000_000, startDate: DEFAULT_INVEST_DATE, duration: 30, mode: 'Linéaire' },
      { label: 'Voirie & VRD', category: 'Corporel', cost: 30_000_000, startDate: DEFAULT_INVEST_DATE, duration: 20, mode: 'Linéaire' },
      { label: 'Bureau de vente', category: 'Corporel', cost: 5_000_000, startDate: DEFAULT_INVEST_DATE, duration: 10, mode: 'Linéaire' },
    ],
    chargeRubriques: ['Terrain', 'Construction', 'VRD', 'Frais commerciaux', 'Notaire & actes', 'Taxes foncières', 'Personnel', 'Permis & agréments'],
    kpisSpecifiques: (v) => {
      const caTotal = v.nbLogements * v.prixUnitaireLogement;
      const coutTotal = v.coutTerrainTotal + v.nbLogements * v.coutConstructionLogement + v.coutVRD;
      const margeBrute = caTotal > 0 ? ((caTotal - coutTotal) / caTotal) * 100 : 0;
      return [
        { label: 'Marge brute', value: margeBrute.toFixed(1), hint: '% (cible 20+)', color: margeBrute >= 20 ? 'accent' : 'danger' },
        { label: 'CA programme', value: fmt(caTotal), hint: 'FCFA', color: 'accent' },
        { label: 'Coût total', value: fmt(coutTotal), hint: 'FCFA', color: 'primary' },
        { label: 'Durée', value: String(v.dureeProgramme), hint: 'mois', color: 'primary' },
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
