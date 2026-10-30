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
import { SECTORS, getSectorConfig, getDefaultSectorValues, buildHypothesesForSector, getActiveInvestmentTemplates } from '../lib/sectors-config';

const INITIAL_SECTOR = 'aviculture';
const INITIAL_VALUES = getDefaultSectorValues(INITIAL_SECTOR);

function buildInvestmentsFromTemplate(sectorCode: string, variantKey?: string): Investment[] {
  const sector = getSectorConfig(sectorCode);
  const templates = getActiveInvestmentTemplates(sector, variantKey);
  return templates.map((inv, i) => ({
    ...inv,
    id: `inv-${sectorCode}-${i}-${Date.now()}`,
  }));
}

function buildHypothesesFromSector(
  sectorCode: string,
  values: Record<string, number>,
  variantKey?: string,
): Hypotheses {
  const sector = getSectorConfig(sectorCode);
  const derived = buildHypothesesForSector(sector, values, variantKey);
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

export interface ProjectListItem {
  id: string;
  name: string;
  sector: string | null;
  created_at: string;
  updated_at?: string;
}

interface ProjectState {
  info: GeneralInfo;
  hypotheses: Hypotheses;
  investments: Investment[];
  financement: Financement;
  sectorCode: string;
  sectorVariant: string;
  sectorValues: Record<string, number>;

  currentProjectId: string | null;
  isSaving: boolean;
  isLoading: boolean;
  syncError: string | null;
  lastSavedAt: string | null;

  updateInfo: <K extends keyof GeneralInfo>(k: K, v: GeneralInfo[K]) => void;
  updateHypothese: <K extends keyof Hypotheses>(k: K, v: Hypotheses[K]) => void;
  updateSaisonnalite: (index: number, v: number) => void;
  updateInvestment: (id: string, patch: Partial<Investment>) => void;
  addInvestment: (inv: Investment) => void;
  removeInvestment: (id: string) => void;
  updateFinancement: <K extends keyof Financement>(k: K, v: Financement[K]) => void;
  applySectorTemplate: (code: string, variantKey?: string) => void;
  updateSectorValue: (key: string, value: number) => void;
  setSelectedSector: (code: string) => void;
  setVariant: (variantKey: string) => void;
  loadProject: (name: string, sector: string) => void;

  saveCurrentProject: () => Promise<{ id: string }>;
  loadProjectById: (id: string) => Promise<void>;
  listProjects: () => Promise<ProjectListItem[]>;
  deleteProjectById: (id: string) => Promise<void>;

  reset: () => void;
}

const DEV_KEY = 'bpb-projects-full';
function devList(): any[] {
  try { return JSON.parse(localStorage.getItem(DEV_KEY) || '[]'); } catch { return []; }
}
function devSave(payload: any, id?: string): any {
  const list = devList();
  const now = new Date().toISOString();
  if (id) {
    const idx = list.findIndex((p) => p.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...payload, updated_at: now };
      localStorage.setItem(DEV_KEY, JSON.stringify(list));
      return list[idx];
    }
  }
  const created = { id: 'local-' + Date.now(), ...payload, created_at: now, updated_at: now };
  list.push(created);
  localStorage.setItem(DEV_KEY, JSON.stringify(list));
  return created;
}
function devGet(id: string): any | undefined {
  return devList().find((p) => p.id === id);
}
function devDelete(id: string): void {
  localStorage.setItem(DEV_KEY, JSON.stringify(devList().filter((p) => p.id !== id)));
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      info: DEFAULT_GENERAL_INFO,
      hypotheses: buildHypothesesFromSector(INITIAL_SECTOR, INITIAL_VALUES),
      investments: buildInvestmentsFromTemplate(INITIAL_SECTOR),
      financement: DEFAULT_FINANCEMENT,
      sectorCode: INITIAL_SECTOR,
      sectorVariant: getSectorConfig(INITIAL_SECTOR).defaultVariant ?? '',
      sectorValues: INITIAL_VALUES,

      currentProjectId: null,
      isSaving: false,
      isLoading: false,
      syncError: null,
      lastSavedAt: null,

      updateInfo: (k, v) => set((s) => ({ info: { ...s.info, [k]: v } })),
      updateHypothese: (k, v) => set((s) => ({ hypotheses: { ...s.hypotheses, [k]: v } })),
      updateSaisonnalite: (index, v) => set((s) => {
        const next = [...s.hypotheses.saisonnalite];
        next[index] = v;
        return { hypotheses: { ...s.hypotheses, saisonnalite: next } };
      }),
      updateInvestment: (id, patch) => set((s) => ({
        investments: s.investments.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      })),
      addInvestment: (inv) => set((s) => ({ investments: [...s.investments, inv] })),
      removeInvestment: (id) => set((s) => ({ investments: s.investments.filter((i) => i.id !== id) })),
      updateFinancement: (k, v) => set((s) => ({ financement: { ...s.financement, [k]: v } })),

      applySectorTemplate: (code, variantKey) => {
        const sectorCfg = getSectorConfig(code);
        const effectiveVariant = variantKey ?? sectorCfg.defaultVariant ?? '';
        const values = getDefaultSectorValues(code, effectiveVariant);
        const newHyp = buildHypothesesFromSector(code, values, effectiveVariant);
        const newInv = buildInvestmentsFromTemplate(code, effectiveVariant);
        const prev = get().hypotheses;
        newHyp.saisonnalite = prev.saisonnalite;
        newHyp.croissanceA2 = prev.croissanceA2;
        newHyp.croissanceA3 = prev.croissanceA3;
        set((s) => ({
          sectorCode: code,
          sectorVariant: effectiveVariant,
          sectorValues: values,
          hypotheses: newHyp,
          investments: newInv,
          info: { ...s.info, sectorCode: code },
        }));
      },

      updateSectorValue: (key, value) => set((s) => {
        const newValues = { ...s.sectorValues, [key]: value };
        const newHyp = buildHypothesesFromSector(s.sectorCode, newValues, s.sectorVariant);
        newHyp.saisonnalite = s.hypotheses.saisonnalite;
        newHyp.croissanceA2 = s.hypotheses.croissanceA2;
        newHyp.croissanceA3 = s.hypotheses.croissanceA3;
        return { sectorValues: newValues, hypotheses: newHyp };
      }),

      setSelectedSector: (code) => get().applySectorTemplate(code),

      setVariant: (variantKey) => {
        const code = get().sectorCode;
        get().applySectorTemplate(code, variantKey);
      },

      loadProject: (name, sector) => set((s) => ({
        info: { ...s.info, projectName: name, sectorCode: sector },
        sectorCode: sector,
      })),

      saveCurrentProject: async () => {
        const state = get();
        set({ isSaving: true, syncError: null });
        try {
          const payload = {
            name: state.info.projectName || 'Projet sans nom',
            sector: state.sectorCode,
            data: {
              info: state.info,
              hypotheses: state.hypotheses,
              investments: state.investments,
              financement: state.financement,
              sectorCode: state.sectorCode,
              sectorVariant: state.sectorVariant,
              sectorValues: state.sectorValues,
            },
          };

          // ── Mode DEV : localStorage direct (pas de Cloudflare Function en local)
          if (import.meta.env.DEV) {
            const saved = devSave(payload, state.currentProjectId || undefined);
            set({ currentProjectId: saved.id, lastSavedAt: saved.updated_at, isSaving: false });
            return { id: saved.id };
          }

          // ── Mode PROD : API Cloudflare + Neon
          const isUpdate = !!state.currentProjectId;
          const url = isUpdate ? `/api/projects/${state.currentProjectId}` : '/api/projects';
          const method = isUpdate ? 'PATCH' : 'POST';
          const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            throw new Error(errBody.error || errBody.detail || 'Erreur API ' + res.status);
          }

          const result = await res.json();
          const savedId = result.id || state.currentProjectId;
          set({ currentProjectId: savedId, lastSavedAt: new Date().toISOString(), isSaving: false });
          return { id: savedId };
        } catch (e) {
          set({ syncError: (e as Error).message, isSaving: false });
          throw e;
        }
      },

      loadProjectById: async (id) => {
        set({ isLoading: true, syncError: null });
        try {
          let proj: any;

          // ── Mode DEV
          if (import.meta.env.DEV) {
            proj = devGet(id);
            if (!proj) throw new Error('Projet introuvable (local)');
          } else {
            const res = await fetch(`/api/projects/${id}`);
            if (!res.ok) throw new Error('Erreur chargement (HTTP ' + res.status + ')');
            proj = await res.json();
          }
          const d = proj.data || {};
          set((s) => ({
            currentProjectId: proj.id,
            info: d.info || { ...s.info, projectName: proj.name },
            hypotheses: d.hypotheses || s.hypotheses,
            investments: d.investments || s.investments,
            financement: d.financement || s.financement,
            sectorCode: d.sectorCode || proj.sector || s.sectorCode,
            sectorVariant: (d as any).sectorVariant || (d.sectorCode ? (getSectorConfig(d.sectorCode).defaultVariant ?? '') : s.sectorVariant),
            sectorValues: d.sectorValues || s.sectorValues,
            isLoading: false,
            lastSavedAt: proj.updated_at || proj.created_at || null,
          }));
        } catch (e) {
          set({ syncError: (e as Error).message, isLoading: false });
          throw e;
        }
      },

      listProjects: async () => {
        set({ isLoading: true, syncError: null });
        try {
          // ── Mode DEV
          if (import.meta.env.DEV) {
            const list = devList().sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
            set({ isLoading: false });
            return list;
          }

          // ── Mode PROD
          const res = await fetch('/api/projects');
          if (!res.ok) throw new Error('Erreur liste (HTTP ' + res.status + ')');
          const data = await res.json();
          set({ isLoading: false });
          return Array.isArray(data) ? data : [];
        } catch (e) {
          set({ syncError: (e as Error).message, isLoading: false });
          throw e;
        }
      },

      deleteProjectById: async (id) => {
        try {
          // ── Mode DEV
          if (import.meta.env.DEV) {
            devDelete(id);
          } else {
            const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erreur suppression (HTTP ' + res.status + ')');
          }
          if (get().currentProjectId === id) {
            set({ currentProjectId: null, lastSavedAt: null });
          }
        } catch (e) {
          set({ syncError: (e as Error).message });
          throw e;
        }
      },

      reset: () => set({
        currentProjectId: null,
        info: DEFAULT_GENERAL_INFO,
        hypotheses: buildHypothesesFromSector(INITIAL_SECTOR, INITIAL_VALUES),
        investments: buildInvestmentsFromTemplate(INITIAL_SECTOR),
        financement: DEFAULT_FINANCEMENT,
        sectorCode: INITIAL_SECTOR,
        sectorVariant: getSectorConfig(INITIAL_SECTOR).defaultVariant ?? '',
        sectorValues: INITIAL_VALUES,
        lastSavedAt: null,
        syncError: null,
      }),
    }),
    {
      name: 'bpb-project-store',
      version: 4,
      partialize: (s) => ({
        info: s.info,
        hypotheses: s.hypotheses,
        investments: s.investments,
        financement: s.financement,
        sectorCode: s.sectorCode,
        sectorVariant: s.sectorVariant,
        sectorValues: s.sectorValues,
        currentProjectId: s.currentProjectId,
        lastSavedAt: s.lastSavedAt,
      }),
    }
  )
);

export { buildHypothesesFromSector, buildInvestmentsFromTemplate };
export { SECTORS };
