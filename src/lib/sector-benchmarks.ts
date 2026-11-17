// ============================================================
// Benchmarks sectoriels Bénin — références réalistes 2024-2025
// Sources : BAfD, BCEAO, Observatoire PME Bénin, Cabinet Expert Bénin
// À ajuster selon le contexte précis du projet
// ============================================================

export interface SectorBenchmark {
  triCibleRealiste: { min: number; max: number };
  triCibleAmbitieux: { min: number; max: number };
  margeBruteCible: number;       // % du CA (100 - pctAchats)
  pctChargesExtCible: number;    // % du CA
  croissanceA2: number;          // %
  croissanceA3: number;          // %
  masseSalarialePctCA: number;   // % du CA annuel
  joursStockage: number;
  joursClients: number;
  joursFournisseurs: number;
  note?: string;
}

export const SECTOR_BENCHMARKS: Record<string, SectorBenchmark> = {
  aviculture: {
    triCibleRealiste: { min: 18, max: 25 },
    triCibleAmbitieux: { min: 25, max: 30 },
    margeBruteCible: 35,
    pctChargesExtCible: 10,
    croissanceA2: 12,
    croissanceA3: 6,
    masseSalarialePctCA: 10,
    joursStockage: 15, joursClients: 15, joursFournisseurs: 20,
    note: 'Filière avicole très active (Cotonou, Parakou). Risque sanitaire modéré.',
  },
  anacarde: {
    triCibleRealiste: { min: 20, max: 28 },
    triCibleAmbitieux: { min: 28, max: 35 },
    margeBruteCible: 30,
    pctChargesExtCible: 8,
    croissanceA2: 10,
    croissanceA3: 6,
    masseSalarialePctCA: 6,
    joursStockage: 30, joursClients: 30, joursFournisseurs: 15,
    note: "Filière exportatrice en croissance. Prix mondiaux volatils.",
  },
  agriculture: {
    triCibleRealiste: { min: 15, max: 20 },
    triCibleAmbitieux: { min: 20, max: 25 },
    margeBruteCible: 30,
    pctChargesExtCible: 10,
    croissanceA2: 10,
    croissanceA3: 6,
    masseSalarialePctCA: 12,
    joursStockage: 30, joursClients: 30, joursFournisseurs: 15,
    note: 'Filière saisonnière — campagnes pluviale + contre-saison.',
  },
  agro_industrie: {
    triCibleRealiste: { min: 18, max: 25 },
    triCibleAmbitieux: { min: 25, max: 30 },
    margeBruteCible: 35,
    pctChargesExtCible: 12,
    croissanceA2: 10,
    croissanceA3: 6,
    masseSalarialePctCA: 12,
    joursStockage: 30, joursClients: 30, joursFournisseurs: 20,
    note: 'Transformation locale en développement. Cible : marchés sous-régionaux.',
  },
  commerce: {
    triCibleRealiste: { min: 15, max: 22 },
    triCibleAmbitieux: { min: 22, max: 28 },
    margeBruteCible: 20,
    pctChargesExtCible: 10,
    croissanceA2: 8,
    croissanceA3: 4,
    masseSalarialePctCA: 8,
    joursStockage: 45, joursClients: 30, joursFournisseurs: 30,
    note: 'Commerce généraliste. Marge faible mais rotation élevée.',
  },
  import_export: {
    triCibleRealiste: { min: 20, max: 28 },
    triCibleAmbitieux: { min: 28, max: 35 },
    margeBruteCible: 18,
    pctChargesExtCible: 18,
    croissanceA2: 8,
    croissanceA3: 5,
    masseSalarialePctCA: 6,
    joursStockage: 60, joursClients: 45, joursFournisseurs: 20,
    note: 'Import/export Bénin-Nigeria-Togo. Risque change et douane.',
  },
  restauration: {
    triCibleRealiste: { min: 18, max: 25 },
    triCibleAmbitieux: { min: 25, max: 32 },
    margeBruteCible: 45,
    pctChargesExtCible: 20,
    croissanceA2: 8,
    croissanceA3: 5,
    masseSalarialePctCA: 18,
    joursStockage: 7, joursClients: 0, joursFournisseurs: 15,
    note: 'Restauration Cotonou. Forte saisonnalité (déc-janv).',
  },
  btp: {
    triCibleRealiste: { min: 15, max: 22 },
    triCibleAmbitieux: { min: 22, max: 28 },
    margeBruteCible: 25,
    pctChargesExtCible: 12,
    croissanceA2: 8,
    croissanceA3: 5,
    masseSalarialePctCA: 15,
    joursStockage: 30, joursClients: 60, joursFournisseurs: 45,
    note: 'BTP Bénin — forte demande résidentielle. Allongement délais paiement.',
  },
  transport: {
    triCibleRealiste: { min: 18, max: 25 },
    triCibleAmbitieux: { min: 25, max: 30 },
    margeBruteCible: 30,
    pctChargesExtCible: 15,
    croissanceA2: 6,
    croissanceA3: 4,
    masseSalarialePctCA: 12,
    joursStockage: 0, joursClients: 30, joursFournisseurs: 30,
    note: 'Transport Bénin — flotte + carburant + entretien. Marge cyclique.',
  },
  services: {
    triCibleRealiste: { min: 25, max: 35 },
    triCibleAmbitieux: { min: 35, max: 45 },
    margeBruteCible: 60,
    pctChargesExtCible: 12,
    croissanceA2: 12,
    croissanceA3: 8,
    masseSalarialePctCA: 30,
    joursStockage: 0, joursClients: 45, joursFournisseurs: 20,
    note: 'Services B2B/B2C — marge élevée, capital léger.',
  },
  elevage_autre: {
    triCibleRealiste: { min: 18, max: 25 },
    triCibleAmbitieux: { min: 25, max: 30 },
    margeBruteCible: 30,
    pctChargesExtCible: 10,
    croissanceA2: 10,
    croissanceA3: 6,
    masseSalarialePctCA: 10,
    joursStockage: 30, joursClients: 15, joursFournisseurs: 20,
    note: 'Bovins, ovins, porcs. Cycle long, mortalité à surveiller.',
  },
  transformation_agro: {
    triCibleRealiste: { min: 20, max: 28 },
    triCibleAmbitieux: { min: 28, max: 35 },
    margeBruteCible: 40,
    pctChargesExtCible: 15,
    croissanceA2: 10,
    croissanceA3: 6,
    masseSalarialePctCA: 12,
    joursStockage: 20, joursClients: 30, joursFournisseurs: 15,
    note: 'Transformation agro (jus, savon, farine). Marché sous-régional.',
  },
  immobilier: {
    triCibleRealiste: { min: 12, max: 18 },
    triCibleAmbitieux: { min: 18, max: 22 },
    margeBruteCible: 30,
    pctChargesExtCible: 10,
    croissanceA2: 4,
    croissanceA3: 2,
    masseSalarialePctCA: 8,
    joursStockage: 0, joursClients: 30, joursFournisseurs: 30,
    note: 'Immobilier locatif Cotonou — rendement 8-12%, revalorisation lente.',
  },
};

export function getSectorBenchmark(sectorCode: string): SectorBenchmark | null {
  return SECTOR_BENCHMARKS[sectorCode] ?? null;
}

export const BENCHMARK_SOURCE = 'Sources : BAfD, BCEAO, Observatoire PME Bénin (2024-2025)';
