import { useState } from 'react';

interface Settings {
  organisation: string;
  rccm: string;
  ifu: string;
  devise: 'XOF' | 'EUR' | 'USD';
  tauxIS: number;
  tauxTVA: number;
  tauxCNSS: number;
}

const DEFAULT_SETTINGS: Settings = {
  organisation: 'Cabinet Expert Bénin',
  rccm: 'RB/COT/23 B 12345',
  ifu: '3202312345678',
  devise: 'XOF',
  tauxIS: 30,
  tauxTVA: 18,
  tauxCNSS: 20,
};

export function ParametresView() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('bpb-settings') || '{}') };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setSettings((p) => ({ ...p, [k]: v }));

  const save = () => {
    localStorage.setItem('bpb-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const reset = () => {
    if (!confirm('Réinitialiser tous les paramètres ?')) return;
    localStorage.removeItem('bpb-settings');
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">⚙️ Paramètres</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organisation, contexte fiscal et préférences
          </p>
        </div>
        <button
          onClick={reset}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white hover:bg-slate-50"
        >
          ↺ Réinitialiser
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Organisation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Nom de l'organisation</label>
            <input
              value={settings.organisation}
              onChange={(e) => update('organisation', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">RCCM</label>
            <input
              value={settings.rccm}
              onChange={(e) => update('rccm', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">IFU</label>
            <input
              value={settings.ifu}
              onChange={(e) => update('ifu', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Devise</label>
            <select
              value={settings.devise}
              onChange={(e) => update('devise', e.target.value as Settings['devise'])}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            >
              <option value="XOF">XOF (FCFA)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Contexte fiscal (SYSCOHADA)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Impôt sur les sociétés</label>
            <div className="relative">
              <input
                type="number"
                value={settings.tauxIS}
                onChange={(e) => update('tauxIS', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">TVA</label>
            <div className="relative">
              <input
                type="number"
                value={settings.tauxTVA}
                onChange={(e) => update('tauxTVA', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Charges sociales (CNSS)</label>
            <div className="relative">
              <input
                type="number"
                value={settings.tauxCNSS}
                onChange={(e) => update('tauxCNSS', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          className={`px-4 py-2 rounded-lg text-xs font-semibold ${
            saved ? 'bg-emerald-100 text-emerald-700' : 'bg-[#0F172A] text-white hover:bg-black'
          }`}
        >
          {saved ? '✅ Enregistré' : '💾 Enregistrer les paramètres'}
        </button>
      </div>
    </div>
  );
}
