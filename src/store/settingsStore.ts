// ============================================================
// Settings globaux (bpb-settings) — source unique via Zustand
// Synchronisation intra-tab instantanée + inter-tab via storage event
// ============================================================
import { create } from 'zustand';

export interface AppSettings {
  organisation: string;
  rccm: string;
  ifu: string;
  devise: string;
  tauxIS: number;
  tauxTVA: number;
  tauxCNSS: number;
  tauxActualisation: number;
  dureeEtude: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  organisation: 'Mon Organisation',
  rccm: '—',
  ifu: '—',
  devise: 'XOF',
  tauxIS: 30,
  tauxTVA: 18,
  tauxCNSS: 20,
  tauxActualisation: 6,
  dureeEtude: 7,
};

const STORAGE_KEY = 'bpb-settings';

function load(): AppSettings {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { ...DEFAULT_SETTINGS, ...raw };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

interface SettingsStore extends AppSettings {
  _reload: () => void;
  _save: (partial: Partial<AppSettings>) => void;
  _reset: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...load(),
  _reload: () => set(load()),
  _save: (partial) => {
    const current = load();
    const next = { ...current, ...partial };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    set(next);
  },
  _reset: () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    set(DEFAULT_SETTINGS);
  },
}));

// Inter-tab sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) useSettingsStore.getState()._reload();
  });
}
