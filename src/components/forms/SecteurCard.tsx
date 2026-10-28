import { useState, useEffect } from 'react';
import { SECTORS } from '../../lib/mockup-data';
import { computeSectorSynthesis, fmtFCFA } from '../../lib/sector-engine';
import { FormSection, FormField, inputClass } from './FormSection';
import type { SectorSynthesis } from '../../types/project';

interface Props {
  initialSectorCode?: string;
  onSelect?: (code: string, synthesis: SectorSynthesis) => void;
}

export function SecteurCard({ initialSectorCode = 'aviculture', onSelect }: Props) {
  const [selectedCode, setSelectedCode] = useState(initialSectorCode);
  const sector = SECTORS.find((s) => s.code === selectedCode) || SECTORS[0];

  // Valeurs des champs dynamiques (initialisées aux defaults)
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(sector.fields.map((f) => [f.key, f.default])),
  );

  // Quand on change de secteur → réinitialiser les valeurs aux defaults
  useEffect(() => {
    const s = SECTORS.find((x) => x.code === selectedCode);
    if (s) setValues(Object.fromEntries(s.fields.map((f) => [f.key, f.default])));
  }, [selectedCode]);

  const synthesis = computeSectorSynthesis(selectedCode, values);

  const update = (key: string, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (onSelect) onSelect(selectedCode, synthesis);
    else alert(`✅ Secteur "${sector.name}" sélectionné\nCA annuel estimé : ${fmtFCFA(synthesis.ca)} FCFA`);
  };

  const formatUnit = (unit?: string) => {
    if (!unit) return '';
    return unit;
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">🏭 Secteur d'activité</h2>
        <p className="text-sm text-slate-500 mt-1">
          12 filières Bénin / Afrique de l'Ouest — Champs et formules auto-adaptés
        </p>
      </div>

      {/* Grille des 12 secteurs */}
      <FormSection title="1. Choisir un secteur" icon="🎯">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SECTORS.map((s) => {
            const selected = s.code === selectedCode;
            return (
              <button
                key={s.code}
                type="button"
                onClick={() => setSelectedCode(s.code)}
                className={`p-4 rounded-xl border-2 text-left transition ${
                  selected
                    ? 'border-[#0F172A] bg-[#0F172A] text-white shadow-lg'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${
                      selected ? 'bg-white' : 'bg-slate-100'
                    }`}
                  >
                    {s.icon}
                  </div>
                  {selected && (
                    <span className="text-[10px] bg-emerald-500 px-2 py-0.5 rounded-full text-white font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <div className="mt-3 font-semibold text-sm">{s.name}</div>
                <div className={`text-[11px] mt-1 ${selected ? 'text-white/70' : 'text-slate-500'}`}>
                  {s.description}
                </div>
              </button>
            );
          })}
        </div>
      </FormSection>

      {/* Champs dynamiques */}
      <FormSection title={`2. Champs — ${sector.name}`} icon="⚙️">
        {sector.fields.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            Aucun champ défini pour ce secteur (à compléter).
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sector.fields.map((field) => (
              <FormField key={field.key} label={field.label} unit={formatUnit(field.unit)}>
                <div className="relative">
                  <input
                    type="number"
                    value={values[field.key] ?? field.default}
                    onChange={(e) => update(field.key, Number(e.target.value))}
                    className={inputClass}
                  />
                  {field.unit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      {field.unit}
                    </span>
                  )}
                </div>
              </FormField>
            ))}
          </div>
        )}
      </FormSection>

      {/* Synthèse automatique */}
      <FormSection title="3. Synthèse automatique" icon="📊">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-[11px] uppercase tracking-wide text-emerald-700 font-medium">CA annuel</div>
            <div className="mt-1 text-lg font-bold text-emerald-900">{fmtFCFA(synthesis.ca)}</div>
            <div className="text-[11px] text-emerald-700">FCFA</div>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="text-[11px] uppercase tracking-wide text-blue-700 font-medium">Marge brute</div>
            <div className="mt-1 text-lg font-bold text-blue-900">{synthesis.marge.toFixed(1)} %</div>
            <div className="text-[11px] text-blue-700">estimée</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-[11px] uppercase tracking-wide text-amber-700 font-medium">BFR initial</div>
            <div className="mt-1 text-lg font-bold text-amber-900">{fmtFCFA(synthesis.bfr)}</div>
            <div className="text-[11px] text-amber-700">FCFA</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[11px] uppercase tracking-wide text-slate-700 font-medium">Emplois</div>
            <div className="mt-1 text-lg font-bold text-slate-900">{synthesis.jobs}</div>
            <div className="text-[11px] text-slate-600">directs</div>
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={handleNext}
          className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-black"
        >
          Valider le secteur →
        </button>
      </div>
    </div>
  );
}
