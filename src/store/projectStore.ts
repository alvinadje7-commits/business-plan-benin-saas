import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_GENERAL_INFO,
  DEFAULT_HYPOTHESES,
  DEFAULT_INVESTMENTS,
  DEFAULT_FINANCEMENT,
  type GeneralInfo,
  type Hypotheses,
  type Investment,
  type Financement,
} from '../types/project';

interface ProjectState {
  info: GeneralInfo;
  hypotheses: Hypotheses;
  investments: Investment[];
  financement: Financement;
  selectedSector: string;

  updateInfo: <K extends keyof GeneralInfo>(k: K, v: GeneralInfo[K]) => void;
  updateHypothese: <K extends keyof Hypotheses>(k: K, v: Hypotheses[K]) => void;
  updateSaisonnalite: (index: number, v: number) => void;
  updateInvestment: (id: string, patch: Partial<Investment>) => void;
  addInvestment: (inv: Investment) => void;
  removeInvestment: (id: string) => void;
  updateFinancement: <K extends keyof Financement>(k: K, v: Financement[K]) => void;
  setSelectedSector: (code: string) => void;
  loadProject: (name: string, sector: string) => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      info: DEFAULT_GENERAL_INFO,
      hypotheses: DEFAULT_HYPOTHESES,
      investments: DEFAULT_INVESTMENTS,
      financement: DEFAULT_FINANCEMENT,
      selectedSector: 'aviculture',

      updateInfo: (k, v) =>
        set((s) => ({ info: { ...s.info, [k]: v } })),

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

      setSelectedSector: (code) => set({ selectedSector: code }),

      loadProject: (name, sector) =>
        set((s) => ({
          info: { ...s.info, projectName: name },
          selectedSector: sector,
        })),

      reset: () =>
        set({
          info: DEFAULT_GENERAL_INFO,
          hypotheses: DEFAULT_HYPOTHESES,
          investments: DEFAULT_INVESTMENTS,
          financement: DEFAULT_FINANCEMENT,
          selectedSector: 'aviculture',
        }),
    }),
    { name: 'bpb-project-store', version: 1 }
  )
);
