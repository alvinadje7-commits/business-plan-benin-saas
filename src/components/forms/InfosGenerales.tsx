import { useState } from 'react';
import { SECTORS } from '../../lib/mockup-data';
import { FormSection, FormField, inputClass, grid2 } from './FormSection';
import {
  LEGAL_FORMS,
  BENIN_CITIES,
  CONTEXT_FISCAL,
  DEFAULT_GENERAL_INFO,
  type GeneralInfo,
  type LegalForm,
  type Shareholder,
} from '../../types/project';

interface Props {
  onSave?: (data: GeneralInfo) => void;
}

export function InfosGenerales({ onSave }: Props) {
  const [info, setInfo] = useState<GeneralInfo>(DEFAULT_GENERAL_INFO);

  const update = <K extends keyof GeneralInfo>(key: K, value: GeneralInfo[K]) => {
    setInfo((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (onSave) onSave(info);
    else alert('💾 Infos générales enregistrées (mode démo)\nDans la version finale : synchronisation Neon.');
  };

  // --- Gestion des associés ---
  const updateShareholder = (id: string, patch: Partial<Shareholder>) => {
    setInfo((prev) => ({
      ...prev,
      shareholders: prev.shareholders.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };
  const addShareholder = () => {
    const id = 'sh' + Date.now();
    setInfo((prev) => ({
      ...prev,
      shareholders: [...prev.shareholders, { id, name: '', parts: 0, percent: 0, amount: 0 }],
    }));
  };
  const removeShareholder = (id: string) => {
    setInfo((prev) => ({
      ...prev,
      shareholders: prev.shareholders.filter((s) => s.id !== id),
    }));
  };

  const totalPercent = info.shareholders.reduce((sum, s) => sum + (s.percent || 0), 0);
  const percentOk = Math.abs(totalPercent - 100) < 0.01;

  return (
    <div className="space-y-5">
      {/* En-tête de carte */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">📋 Infos générales</h2>
        <p className="text-sm text-slate-500 mt-1">
          Identité du projet, promoteur et cadre juridique OHADA
        </p>
      </div>

      {/* 1. Identité du projet */}
      <FormSection title="1. Identité du projet" icon="🎯">
        <div className={grid2}>
          <FormField label="Nom du projet" required>
            <input
              type="text"
              value={info.projectName}
              onChange={(e) => update('projectName', e.target.value)}
              className={inputClass}
              placeholder="Ex : Élevage Poulets 5000 sujets"
            />
          </FormField>
          <FormField label="Secteur d'activité" required>
            <select
              value={info.sectorCode}
              onChange={(e) => update('sectorCode', e.target.value)}
              className={inputClass}
            >
              {SECTORS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className={grid2}>
          <FormField label="Date de démarrage" required>
            <input
              type="date"
              value={info.startDate}
              onChange={(e) => update('startDate', e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Localisation" required>
            <select
              value={info.location}
              onChange={(e) => update('location', e.target.value)}
              className={inputClass}
            >
              {BENIN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Résumé exécutif" hint="200 mots maximum — qui, quoi, combien, où, quand">
          <textarea
            rows={3}
            maxLength={1200}
            value={info.summary}
            onChange={(e) => update('summary', e.target.value)}
            className={inputClass}
            placeholder="Projet d'élevage avicole moderne à Parakou, capacité 5000 sujets/cycle…"
          />
        </FormField>
      </FormSection>

      {/* 2. Porteur / Promoteur */}
      <FormSection title="2. Porteur / Promoteur" icon="👤">
        <div className={grid2}>
          <FormField label="Nom & Prénom(s)" required>
            <input type="text" value={info.promoterName}
              onChange={(e) => update('promoterName', e.target.value)}
              className={inputClass} />
          </FormField>
          <FormField label="Date de naissance" required>
            <input type="date" value={info.birthDate}
              onChange={(e) => update('birthDate', e.target.value)}
              className={inputClass} />
          </FormField>
        </div>
        <div className={grid2}>
          <FormField label="Email" required>
            <input type="email" value={info.email}
              onChange={(e) => update('email', e.target.value)}
              className={inputClass} placeholder="vous@exemple.bj" />
          </FormField>
          <FormField label="Téléphone" required>
            <input type="tel" value={info.phone}
              onChange={(e) => update('phone', e.target.value)}
              className={inputClass} placeholder="+229 97 XX XX XX" />
          </FormField>
        </div>
        <div className={grid2}>
          <FormField label="Fonction actuelle">
            <input type="text" value={info.currentRole}
              onChange={(e) => update('currentRole', e.target.value)}
              className={inputClass} />
          </FormField>
          <FormField label="Expérience / CV synthétique">
            <input type="text" value={info.experience}
              onChange={(e) => update('experience', e.target.value)}
              className={inputClass} placeholder="Ex : 8 ans en agro-business" />
          </FormField>
        </div>
      </FormSection>

      {/* 3. Forme juridique */}
      <FormSection title="3. Forme juridique (OHADA)" icon="⚖️">
        <FormField label="Forme sociale" required>
          <div className="flex flex-wrap gap-2">
            {LEGAL_FORMS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => update('legalForm', f.value as LegalForm)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                  info.legalForm === f.value
                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
                title={f.note}
              >
                {f.label}
              </button>
            ))}
          </div>
        </FormField>

        <div className={grid2}>
          <FormField
            label="Capital social"
            required
            hint={
              LEGAL_FORMS.find((f) => f.value === info.legalForm)?.note
            }
          >
            <div className="relative">
              <input
                type="number"
                value={info.capital}
                onChange={(e) => update('capital', Number(e.target.value))}
                className={inputClass}
                min={0}
                step={100000}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">FCFA</span>
            </div>
          </FormField>
          <FormField label="Total réparti">
            <div className={`${inputClass} bg-slate-50 flex items-center justify-between`}>
              <span className="text-sm font-medium">{totalPercent.toFixed(1)} %</span>
              {percentOk ? (
                <span className="text-xs text-emerald-600 font-medium">✅ 100 %</span>
              ) : (
                <span className="text-xs text-amber-600 font-medium">⚠️ doit faire 100 %</span>
              )}
            </div>
          </FormField>
        </div>

        {/* Tableau des associés */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-700">Répartition du capital</label>
            <button
              type="button"
              onClick={addShareholder}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              + Ajouter un associé
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-xs uppercase">Associé</th>
                  <th className="text-right px-3 py-2 font-medium text-xs uppercase w-24">Parts</th>
                  <th className="text-right px-3 py-2 font-medium text-xs uppercase w-24">%</th>
                  <th className="text-right px-3 py-2 font-medium text-xs uppercase w-40">Montant (FCFA)</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {info.shareholders.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={s.name}
                        onChange={(e) => updateShareholder(s.id, { name: e.target.value })}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-400"
                        placeholder="Nom de l'associé"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={s.parts}
                        onChange={(e) => updateShareholder(s.id, { parts: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 text-sm text-right focus:outline-none focus:border-slate-400"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={s.percent}
                        onChange={(e) => updateShareholder(s.id, { percent: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 text-sm text-right focus:outline-none focus:border-slate-400"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={s.amount}
                        onChange={(e) => updateShareholder(s.id, { amount: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 text-sm text-right focus:outline-none focus:border-slate-400"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeShareholder(s.id)}
                        className="text-red-400 hover:text-red-600 text-sm"
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FormSection>

      {/* 4. Identifiants officiels */}
      <FormSection title="4. Identifiants officiels (Bénin)" icon="📇">
        <div className={grid2}>
          <FormField label="RCCM">
            <input type="text" value={info.rccm}
              onChange={(e) => update('rccm', e.target.value)}
              className={inputClass} placeholder="RB/COT/26 B 12345" />
          </FormField>
          <FormField label="IFU">
            <input type="text" value={info.ifu}
              onChange={(e) => update('ifu', e.target.value)}
              className={inputClass} placeholder="3202312345678" />
          </FormField>
        </div>
        <FormField label="Adresse du siège social">
          <input type="text" value={info.address}
            onChange={(e) => update('address', e.target.value)}
            className={inputClass} />
        </FormField>
      </FormSection>

      {/* Contexte fiscal */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-2">
          ⓘ Contexte fiscal (pré-rempli, modifiable)
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-emerald-900">
          <span className="px-3 py-1 rounded-lg bg-white border border-emerald-200">
            Devise : <b>{CONTEXT_FISCAL.currency}</b>
          </span>
          <span className="px-3 py-1 rounded-lg bg-white border border-emerald-200">
            IS : <b>{CONTEXT_FISCAL.taxRate} %</b>
          </span>
          <span className="px-3 py-1 rounded-lg bg-white border border-emerald-200">
            TVA : <b>{CONTEXT_FISCAL.vatRate} %</b>
          </span>
          <span className="px-3 py-1 rounded-lg bg-white border border-emerald-200">
            CNSS : <b>{CONTEXT_FISCAL.socialRate} %</b>
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50"
        >
          💾 Enregistrer le brouillon
        </button>
      </div>
    </div>
  );
}
