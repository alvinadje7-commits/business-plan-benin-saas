import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_GENERAL_INFO,
  DEFAULT_HYPOTHESES,
  DEFAULT_FINANCEMENT,
  type GeneralInfo,
  type Hypotheses,
  type Investment,
  type Financement,
} from '../types/project';
import { SECTORS, getSectorConfig, getDefaultSectorValues } from '../lib/sectors-config';

/** Construit le tableau d'investissements depuis un template de secteur */
function buildInvestmentsFromTemplate(sectorCode: string): Investment[] {
  const sector = getSectorConfig(sectorCode);
  return sector.investmentTemplates.map((inv, i) => ({
    ...inv,
    id: `inv-${sectorCode}-${i}-${Date.now()}`,
  }));
}

/** Construit les hypothèses génériques à partir des valeurs sectorielles */
function buildHypothesesFromSector(
  sectorCode: string,
  values: Record<string, number>,
): Hypotheses {
  const sector = getSectorConfig(sectorCode);
  const derived = sector.buildHypotheses(values);
  // On conserve les hypothèses non sectorielles du défaut (croissance, saisonnalité)
  return {
    ...DEFAULT_HYPOTHESES,
    caMensuel: derived.caMensuel,
    pctAchats: derived.pctAchats,
    pctChargesExt: derived.pctChargesExt,
    masseSalariale: derived.masseSalariale,
    joursStockage: derived.joursStockage,
    joursClients: derived.joursClients,
    joursFournisseurs: derived.joursFournisseurs,
  };
}

interface ProjectState {
  info: GeneralInfo;
  hypotheses: Hypotheses;
  investments: Investment[];
  financement: Financement;
  sectorCode: string;
  sectorValues: Record<string, number>;

  updateInfo: <K extends keyof GeneralInfo>(k: K, v: GeneralInfo[K]) => void;
  updateHypothese: <K extends keyof Hypotheses>(k: K, v: Hypotheses[K]) => void;
  updateSaisonnalite: (index: number, v: number) => void;
  updateInvestment: (id: string, patch: Partial<Investment>) => void;
  addInvestment: (inv: Investment) => void;
  removeInvestment: (id: string) => void;
  updateFinancement: <K extends keyof Financement>(k: K, v: Financement[K]) => void;

  applySectorTemplate: (code: string) => void;
  updateSectorValue: (key: string, value: number) => void;
  setSelectedSector: (code: string) => void;

  loadProject: (name: string, sector: string) => void;
  reset: () => void;
}

const INITIAL_SECTOR = 'aviculture';
const INITIAL_VALUES = getDefaultSectorValues(INITIAL_SECTOR);

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      info: DEFAULT_GENERAL_INFO,
      hypotheses: buildHypothesesFromSector(INITIAL_SECTOR, INITIAL_VALUES),
      investments: buildInvestmentsFromTemplate(INITIAL_SECTOR),
      financement: DEFAULT_FINANCEMENT,
      sectorCode: INITIAL_SECTOR,
      sectorValues: INITIAL_VALUES,

      updateInfo: (k, v) => set((s) => ({ info: { ...s.info, [k]: v } })),

      updateHypothese: (k, v) =>
        set((s) => ({ hypotheses: { ...s.hypotheses, [k]: v } })),

      updateSaisonnalite: (index, v) =>
        set((s) => {
          const next = [...s.hypotheses.saisonnalite];
          next[index] = v;
          return { hypotheses: { ...s.hypotheses, saisonnalite: next } };
        }),

      updateInvestment: (id, patch) =>
        set((s) => ({
          investments: s.investments.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),

      addInvestment: (inv) =>
        set((s) => ({ investments: [...s.investments, inv] })),

      removeInvestment: (id) =>
        set((s) => ({ investments: s.investments.filter((i) => i.id !== id) })),

      updateFinancement: (k, v) =>
        set((s) => ({ financement: { ...s.financement, [k]: v } })),

      /**
       * Recharge tout le projet avec les templates du nouveau secteur :
       * - valeurs sectorielles par défaut
       * - hypothèses génériques recalculées
       * - investissements types du secteur
       * - infos générales : sectorCode mis à jour
       * ⚠️ Conservation : financement, croissance, saisonnalité, infos promoteur
       */
      applySectorTemplate: (code) => {
        const values = getDefaultSectorValues(code);
        const newHypotheses = buildHypothesesFromSector(code, values);
        const newInvestments = buildInvestmentsFromTemplate(code);

        // Conserver la saisonnalité et les taux de croissance déjà saisis
        const prev = get().hypotheses;
        newHypotheses.saisonnalite = prev.saisonnalite;
        newHypotheses.croissanceA2 = prev.croissanceA2;
        newHypotheses.croissanceA3 = prev.croissanceA3;

        set((s) => ({
          sectorCode: code,
          sectorValues: values,
          hypotheses: newHypotheses,
          investments: newInvestments,
          info: { ...s.info, sectorCode: code },
        }));
      },

      /**
       * Met à jour un champ sectoriel et recalcule les hypothèses dérivées.
       * Appelée à chaque saisie dans la Carte 3 (section sectorielle).
       */
      updateSectorValue: (key, value) =>
        set((s) => {
          const newValues = { ...s.sectorValues, [key]: value };
          const newHypotheses = buildHypothesesFromSector(s.sectorCode, newValues);
          // Conserver la saisonnalité et les taux de croissance
          newHypotheses.saisonnalite = s.hypotheses.saisonnalite;
          newHypotheses.croissanceA2 = s.hypotheses.croissanceA2;
          newHypotheses.croissanceA3 = s.hypotheses.croissanceA3;
          return { sectorValues: newValues, hypotheses: newHypotheses };
        }),

      setSelectedSector: (code) => get().applySectorTemplate(code),

      loadProject: (name, sector) =>
        set((s) => ({
          info: { ...s.info, projectName: name, sectorCode: sector },
          sectorCode: sector,
        })),

      reset: () =>
        set({
          info: DEFAULT_GENERAL_INFO,
          hypotheses: buildHypothesesFromSector(INITIAL_SECTOR, INITIAL_VALUES),
          investments: buildInvestmentsFromTemplate(INITIAL_SECTOR),
          financement: DEFAULT_FINANCEMENT,
          sectorCode: INITIAL_SECTOR,
          sectorValues: INITIAL_VALUES,
        }),
    }),
    { name: 'bpb-project-store', version: 2 }
  )
);

// Exporter les helpers pour usage externe
export { buildHypothesesFromSector, buildInvestmentsFromTemplate };
export { SECTORS };
