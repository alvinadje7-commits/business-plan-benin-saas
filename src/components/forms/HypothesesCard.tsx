import { useMemo, useState } from 'react';
import { AccordionGroup, FormSection, FormField, inputClass } from './FormSection';
import { computeSIG, computeBFR, fmtFCFA, fmtFCFAsigned } from '../../lib/sig-engine';
import { useProjectStore } from '../../store/projectStore';
import { getSectorConfig, getSectorGroups } from '../../lib/sectors-config';
import type { Hypotheses, SIG } from '../../types/project';

const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

interface Props {
  onValidate?: (h: Hypotheses, sig: SIG) => void;
}

interface FieldStat {
  key: string;
  label: string;
  unit?: string;
  description?: string;
  value: number;
  default: number;
  min?: number;
  max?: number;
  modified: boolean;
  outOfRange: boolean;
}

export function HypothesesCard({ onValidate }: Props) {
  const h = useProjectStore((s) => s.hypotheses);
  const sectorCode = useProjectStore((s) => s.sectorCode);
  const sectorValues = useProjectStore((s) => s.sectorValues);
  const update = useProjectStore((s) => s.updateHypothese);
  const updateSaison = useProjectStore((s) => s.updateSaisonnalite);
  const updateSectorValue = useProjectStore((s) => s.updateSectorValue);

  const sector = getSectorConfig(sectorCode);
  const groups = getSectorGroups(sector);

  const sig = computeSIG(h);
  const bfr = computeBFR(h, sig.ca);
  const moyenneSaison = h.saisonnalite.reduce((s, v) => s + v, 0) / 12;
  const caA2 = sig.ca * (1 + h.croissanceA2 / 100);
  const caA3 = caA2 * (1 + h.croissanceA3 / 100);

  // Calcule les stats par champ (modifié / hors plage)
  const fieldStats = useMemo<Record<string, FieldStat>>(() => {
    const map: Record<string, FieldStat> = {};
    for (const f of sector.fields) {
      const val = sectorValues[f.key] ?? f.default;
      const modified = Math.abs(val - f.default) > 0.001;
      const outOfRange =
        (f.min !== undefined && val < f.min) || (f.max !== undefined && val > f.max);
      map[f.key] = {
        key: f.key,
        label: f.label,
        unit: f.unit,
        description: f.description,
        value: val,
        default: f.default,
        min: f.min,
        max: f.max,
        modified,
        outOfRange,
      };
    }
    return map;
  }, [sector, sectorValues]);

  // Stats globales
  const allFields = Object.values(fieldStats);
  const totalFields = allFields.length;
  const modifiedCount = allFields.filter((f) => f.modified).length;
  const warningCount = allFields.filter((f) => f.outOfRange).length;

  // Stats par groupe
  const groupsWithStats = groups.map((g, index) => {
    const groupFields = sector.fields
      .filter((f) => (f.group ?? 'default') === g.id)
      .map((f) => fieldStats[f.key]);
    const modCount = groupFields.filter((f) => f.modified).length;
    const hasWarning = groupFields.some((f) => f.outOfRange);
    return {
      ...g,
      fields: groupFields,
      badge: `${modCount}/${groupFields.length}`,
      hasWarning,
      defaultOpen: index === 0,
    };
  });

  const sectorKpis = sector.kpisSpecifiques(sectorValues);

  const handleValidate = () => {
    if (onValidate) onValidate(h, sig);
    else alert(`✅ Hypothèses validées\nRN Année 1 : ${fmtFCFA(sig.resultatNet)} FCFA`);
  };

  const Row = ({ label, value, bold, separator }: {
    label: string; value: number; bold?: boolean; separator?: boolean;
  }) => (
    <div
      className={`flex items-center justify-between px-3 py-2 ${
        separator ? 'border-t border-slate-300 mt-1 pt-2' : ''
      } ${bold ? 'font-semibold' : ''} text-slate-800`}
    >
      <span className="text-sm">{label}</span>
      <span className="text-sm tabular-nums">
        {fmtFCFAsigned(value)} <span className="text-[11px] text-slate-400">FCFA</span>
      </span>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            📊 Hypothèses — {sector.icon} {sector.name}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Scénario <b>Normal</b> • Champs sectoriels groupés + ajustements
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
            {modifiedCount}/{totalFields} ajustés
          </span>
          {warningCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
              ⚠️ {warningCount} hors plage
            </span>
          )}
        </div>
      </div>

      {/* KPIs sectoriels temps réel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {sectorKpis.map((kpi, i) => (
          <div
            key={i}
            className={`rounded-lg border p-2.5 ${
              kpi.color === 'accent' ? 'border-emerald-200 bg-emerald-50'
              : kpi.color === 'danger' ? 'border-red-200 bg-red-50'
              : kpi.color === 'amber' ? 'border-amber-200 bg-amber-50'
              : 'border-slate-200 bg-white'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wide text-slate-600 font-medium truncate">
              {kpi.label}
            </div>
            <div className="mt-0.5 text-sm font-bold text-slate-900 truncate">{kpi.value}</div>
            {kpi.hint && <div className="text-[10px] text-slate-500 mt-0.5 truncate">{kpi.hint}</div>}
          </div>
        ))}
      </div>

      {/* Accordéons par groupe */}
      <div className="space-y-2">
        {groupsWithStats.map((g) => (
          <AccordionGroup
            key={g.id}
            title={g.label}
            icon={g.icon}
            description={g.description}
            badge={g.badge}
            hasWarning={g.hasWarning}
            defaultOpen={g.defaultOpen}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {g.fields.map((f) => (
                <FormField
                  key={f.key}
                  label={f.label}
                  unit={f.unit}
                  hint={f.description}
                  warning={
                    f.outOfRange
                      ? `Hors plage recommandée (${f.min ?? '—'} – ${f.max ?? '—'})`
                      : undefined
                  }
                >
                  <div className="relative">
                    <input
                      type="number"
                      value={f.value}
                      onChange={(e) => updateSectorValue(f.key, Number(e.target.value))}
                      className={`${inputClass} ${
                        f.outOfRange ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-200' : ''
                      }`}
                    />
                    {f.unit && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        {f.unit}
                      </span>
                    )}
                  </div>
                </FormField>
              ))}
            </div>
          </AccordionGroup>
        ))}
      </div>

      {/* Croissance & saisonnalité */}
      <FormSection title="Croissance & saisonnalité" icon="📈">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="CA mensuel calculé (A1)" unit="FCFA" hint="Dérivé du secteur">
            <div className={`${inputClass} bg-slate-50 font-semibold text-slate-700`}>
              {fmtFCFA(h.caMensuel)}
            </div>
          </FormField>
          <FormField label="Croissance A2" unit="%" required>
            <input type="number" value={h.croissanceA2}
              onChange={(e) => update('croissanceA2', Number(e.target.value))}
              className={inputClass} />
          </FormField>
          <FormField label="Croissance A3" unit="%" required>
            <input type="number" value={h.croissanceA3}
              onChange={(e) => update('croissanceA3', Number(e.target.value))}
              className={inputClass} />
          </FormField>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-700">Saisonnalité mensuelle</label>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
              Math.abs(moyenneSaison - 1) < 0.02 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              moy = {moyenneSaison.toFixed(2)}
            </span>
          </div>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-1.5">
            {MOIS.map((m, i) => (
              <div key={m} className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 mb-1">{m}</span>
                <input type="number" step={0.1} value={h.saisonnalite[i]}
                  onChange={(e) => updateSaison(i, Number(e.target.value))}
                  className="w-full px-1 py-1.5 rounded-md border border-slate-200 text-xs text-center focus:outline-none focus:border-slate-400" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 grid grid-cols-3 gap-2 text-xs">
          <div><span className="text-slate-500">CA A1 :</span> <b>{fmtFCFA(sig.ca)} FCFA</b></div>
          <div><span className="text-slate-500">CA A2 :</span> <b>{fmtFCFA(caA2)} FCFA</b></div>
          <div><span className="text-slate-500">CA A3 :</span> <b>{fmtFCFA(caA3)} FCFA</b></div>
        </div>
      </FormSection>

      {/* BFR */}
      <FormSection title="BFR — Besoin en Fonds de Roulement" icon="📦">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Durée de stockage" unit="jours">
            <input type="number" value={h.joursStockage}
              onChange={(e) => update('joursStockage', Number(e.target.value))} className={inputClass} />
          </FormField>
          <FormField label="Délai clients" unit="jours">
            <input type="number" value={h.joursClients}
              onChange={(e) => update('joursClients', Number(e.target.value))} className={inputClass} />
          </FormField>
          <FormField label="Délai fournisseurs" unit="jours">
            <input type="number" value={h.joursFournisseurs}
              onChange={(e) => update('joursFournisseurs', Number(e.target.value))} className={inputClass} />
          </FormField>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
          <div className="flex justify-between"><span>Stocks</span><b>{fmtFCFA(bfr.stocks)} FCFA</b></div>
          <div className="flex justify-between"><span>+ Créances clients</span><b>{fmtFCFA(bfr.clients)} FCFA</b></div>
          <div className="flex justify-between"><span>− Dettes fournisseurs</span><b>{fmtFCFA(bfr.fournisseurs)} FCFA</b></div>
          <div className="flex justify-between pt-2 border-t border-slate-300 font-semibold text-sm">
            <span>BFR initial</span><span className="text-emerald-700">{fmtFCFA(bfr.bfr)} FCFA</span>
          </div>
        </div>
      </FormSection>

      {/* Cascade SIG */}
      <FormSection title="Cascade des SIG en temps réel" icon="📊">
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50">
            <Row label="Chiffre d'affaires" value={sig.ca} bold />
            <Row label="− Achats consommés" value={-sig.achats} />
            <Row label="= Marge commerciale" value={sig.marge} bold separator />
            <Row label="− Charges externes" value={-sig.chargesExt} />
            <Row label="= Valeur ajoutée" value={sig.valeurAjoutee} bold separator />
            <Row label="− Charges de personnel" value={-sig.personnel} />
            <Row label="= EBE" value={sig.ebe} bold separator />
            <Row label="− Dotations aux amortissements" value={-sig.amortissements} />
            <Row label="= Résultat d'exploitation" value={sig.resultatExpl} bold separator />
            <Row label="+/− Résultat financier" value={sig.resultatFin} />
            <Row label="= Résultat avant impôt" value={sig.resultatAvantImpot} bold separator />
            <Row label="− Impôt sur les sociétés (30 %)" value={-sig.impot} />
          </div>
          <div className={`flex items-center justify-between px-3 py-3 border-t-2 ${
            sig.resultatNet >= 0 ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'
          }`}>
            <span className="text-sm font-bold uppercase tracking-wide">= Résultat net</span>
            <span className={`text-base font-bold tabular-nums ${
              sig.resultatNet >= 0 ? 'text-emerald-800' : 'text-red-800'
            }`}>
              {fmtFCFAsigned(sig.resultatNet)} <span className="text-xs">FCFA</span>
              {sig.resultatNet >= 0 ? ' ✅' : ' ⚠️'}
            </span>
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={handleValidate}
          className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-black">
          Valider les hypothèses →
        </button>
      </div>
    </div>
  );
}
