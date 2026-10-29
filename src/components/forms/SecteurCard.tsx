import { useState } from 'react';
import { SECTORS } from '../../lib/mockup-data';
import { useProjectStore } from '../../store/projectStore';
import { FormSection, FormField, inputClass } from './FormSection';

interface Props {
  onSelect?: (code: string) => void;
}

export function SecteurCard({ onSelect }: Props) {
  const sectorCode = useProjectStore((s) => s.sectorCode);
  const sectorValues = useProjectStore((s) => s.sectorValues);
  const applySectorTemplate = useProjectStore((s) => s.applySectorTemplate);
  const updateSectorValue = useProjectStore((s) => s.updateSectorValue);

  const [preview, setPreview] = useState(sectorCode);
  const sector = SECTORS.find((s) => s.code === preview) || SECTORS[0];
  const isApplied = preview === sectorCode;

  const handleApply = () => {
    if (isApplied) {
      // Déjà appliqué → on passe juste à l'étape suivante
      if (onSelect) onSelect(sectorCode);
      return;
    }
    if (
      confirm(
        `Appliquer le secteur "${sector.name}" ?\n\n` +
          `⚠️ Les hypothèses, charges et investissements seront remplacés par les valeurs du secteur.\n` +
          `Le financement et les infos promoteur sont conservés.`,
      )
    ) {
      applySectorTemplate(preview);
      if (onSelect) onSelect(preview);
    }
  };

  // Prévisualisation des KPIs sectoriels (à partir des valeurs actuelles si preview === sectorCode, sinon defaults)
  const previewValues =
    preview === sectorCode
      ? sectorValues
      : Object.fromEntries(sector.fields.map((f) => [f.key, f.default]));
  const kpis = sector.kpisSpecifiques(previewValues);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">🏭 Secteur d'activité</h2>
        <p className="text-sm text-slate-500 mt-1">
          13 filières Bénin / Afrique de l'Ouest — Le choix du secteur reconfigure tout le business plan
        </p>
      </div>

      {/* Grille des 13 secteurs */}
      <FormSection title="1. Choisir un secteur" icon="🎯">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {SECTORS.map((s) => {
            const selected = s.code === preview;
            const applied = s.code === sectorCode;
            return (
              <button
                key={s.code}
                type="button"
                onClick={() => setPreview(s.code)}
                className={`relative p-3 rounded-xl border-2 text-left transition ${
                  selected
                    ? 'border-[#0F172A] bg-[#0F172A] text-white shadow-lg'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {applied && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] bg-emerald-500 px-1.5 py-0.5 rounded-full text-white font-bold">
                    ACTIF
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${
                      selected ? 'bg-white' : 'bg-slate-100'
                    }`}
                  >
                    {s.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-xs truncate">{s.name}</div>
                    <div className={`text-[10px] truncate ${selected ? 'text-white/70' : 'text-slate-500'}`}>
                      {s.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {!isApplied && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            ⚠️ Le secteur <b>{sector.name}</b> n'est pas encore appliqué. Clique sur
            "Appliquer ce secteur" ci-dessous pour recharger les hypothèses, charges et
            investissements associés.
          </div>
        )}
      </FormSection>

      {/* Aperçu des KPIs sectoriels */}
      <FormSection title={`2. KPIs sectoriels — ${sector.name}`} icon="📊">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <div
              key={i}
              className={`rounded-xl border p-3 ${
                kpi.color === 'accent'
                  ? 'border-emerald-200 bg-emerald-50'
                  : kpi.color === 'danger'
                  ? 'border-red-200 bg-red-50'
                  : kpi.color === 'amber'
                  ? 'border-amber-200 bg-amber-50'
                  : kpi.color === 'blue'
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wide text-slate-600 font-medium">
                {kpi.label}
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900">{kpi.value}</div>
              {kpi.hint && <div className="text-[10px] text-slate-500 mt-0.5">{kpi.hint}</div>}
            </div>
          ))}
        </div>
      </FormSection>

      {/* Champs sectoriels */}
      <FormSection title={`3. Champs — ${sector.name}`} icon="⚙️">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sector.fields.map((field) => (
            <FormField key={field.key} label={field.label} unit={field.unit}>
              <div className="relative">
                <input
                  type="number"
                  value={previewValues[field.key] ?? field.default}
                  onChange={(e) => {
                    if (preview !== sectorCode) {
                      // Modifier les valeurs en preview n'a pas d'effet tant qu'on n'a pas appliqué
                      return;
                    }
                    updateSectorValue(field.key, Number(e.target.value));
                  }}
                  disabled={preview !== sectorCode}
                  className={`${inputClass} ${preview !== sectorCode ? 'opacity-60 cursor-not-allowed' : ''}`}
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
        {preview !== sectorCode && (
          <p className="text-[11px] text-slate-500">
            ℹ️ Clique sur "Appliquer ce secteur" pour pouvoir modifier ces valeurs.
          </p>
        )}
      </FormSection>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={handleApply}
          className={`px-4 py-2 rounded-xl text-white text-sm font-medium ${
            isApplied
              ? 'bg-[#0F172A] hover:bg-black'
              : 'bg-[#10B981] hover:bg-emerald-600'
          }`}
        >
          {isApplied ? 'Valider ce secteur →' : '✅ Appliquer ce secteur →'}
        </button>
      </div>
    </div>
  );
}
