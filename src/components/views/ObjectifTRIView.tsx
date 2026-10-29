import { useEffect, useMemo, useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { computeFinancialResult, fmtFCFA } from '../../lib/financial-statements-engine';
import { computeLevers, type LeverResult } from '../../lib/goal-seek';

function readSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem('bpb-settings') || '{}');
    return {
      tauxActualisation: Number(raw.tauxActualisation ?? 6),
      dureeEtude: Number(raw.dureeEtude ?? 7),
    };
  } catch {
    return { tauxActualisation: 6, dureeEtude: 7 };
  }
}

function fmtValue(value: number, unit: 'FCFA' | '%'): string {
  if (unit === '%') return value.toFixed(1) + ' %';
  return fmtFCFA(value) + ' FCFA';
}

const VERDICT_STYLES: Record<string, { label: string; className: string }> = {
  deja_atteint: { label: '✅ Déjà atteint', className: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  realiste:     { label: '🟢 Réaliste',     className: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  agressif:     { label: '🟡 À justifier',  className: 'bg-amber-50 border-amber-200 text-amber-700' },
  difficile:    { label: '🟠 Difficile',    className: 'bg-orange-50 border-orange-200 text-orange-700' },
  impossible:   { label: '🔴 Irréaliste',   className: 'bg-red-50 border-red-200 text-red-700' },
};

export function ObjectifTRIView() {
  const hypotheses = useProjectStore((s) => s.hypotheses);
  const investments = useProjectStore((s) => s.investments);
  const financement = useProjectStore((s) => s.financement);
  const sectorCode = useProjectStore((s) => s.sectorCode);
  const updateHypothese = useProjectStore((s) => s.updateHypothese);
  const updateFinancement = useProjectStore((s) => s.updateFinancement);
  const updateInvestment = useProjectStore((s) => s.updateInvestment);

  const [targetTRIRaw, setTargetTRIRaw] = useState(15);
  const [validatedTRI, setValidatedTRI] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [appliedKey, setAppliedKey] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const settings = readSettings();
  const taux = settings.tauxActualisation / 100;
  const horizon = settings.dureeEtude;

  const currentResult = useMemo(
    () => computeFinancialResult(hypotheses, investments, financement, sectorCode, taux, horizon),
    [hypotheses, investments, financement, sectorCode, taux, horizon],
  );
  const currentTRI = currentResult.kpis.tri;
  const triIsValid = Number.isFinite(currentTRI);

  const levers = useMemo(() => {
    if (validatedTRI === null || !triIsValid) return null;
    return computeLevers(validatedTRI, currentTRI, hypotheses, investments, financement, sectorCode, taux, horizon);
  }, [validatedTRI, currentTRI, hypotheses, investments, financement, sectorCode, taux, horizon, triIsValid]);

  useEffect(() => {
    if (isCalculating) setIsCalculating(false);
  }, [levers, isCalculating]);

  const handleValidate = () => {
    if (isCalculating || !triIsValid) return;
    setIsCalculating(true);
    requestAnimationFrame(() => setValidatedTRI(targetTRIRaw));
  };

  const hasChanged = validatedTRI === null || validatedTRI !== targetTRIRaw;
  const dejaAtteint = validatedTRI !== null && triIsValid && currentTRI >= validatedTRI - 0.01;
  const gap = validatedTRI !== null ? validatedTRI - currentTRI : 0;

  const applyLever = (lever: LeverResult) => {
    if (lever.requiredValue === null) return;
    switch (lever.key) {
      case 'caMensuel':
        updateHypothese('caMensuel', Math.round(lever.requiredValue));
        break;
      case 'investTotal': {
        const total = investments.reduce((s, i) => s + i.cost, 0);
        const factor = total > 0 ? lever.requiredValue / total : 1;
        investments.forEach((i) => updateInvestment(i.id, { cost: Math.round(i.cost * factor) }));
        break;
      }
      case 'pctAchats':
        updateHypothese('pctAchats', Math.round(lever.requiredValue * 10) / 10);
        break;
      case 'masseSalariale':
        updateHypothese('masseSalariale', Math.round(lever.requiredValue));
        break;
      case 'emprunt':
        updateFinancement('empruntMontant', Math.round(lever.requiredValue));
        break;
    }
    setAppliedKey(lever.key);
    setTimeout(() => setAppliedKey(null), 2500);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">🎯 Objectif de rentabilité</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Saisissez un TRI cible puis cliquez sur <b>Valider</b>.
          </p>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium">
          Taux {settings.tauxActualisation} % · Horizon {horizon} ans
        </span>
      </div>

      {/* Erreur : TRI non calculable */}
      {!triIsValid && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-800">⚠️ Le TRI actuel ne peut pas être calculé</h3>
          <p className="text-xs text-red-700 mt-1">
            Les hypothèses ou investissements sont probablement incomplets. Remplis d'abord l'Assistant (Infos, Secteur, Hypothèses, Investissements, Financement) avant de revenir ici.
          </p>
        </div>
      )}

      {/* Saisie cible + bouton Valider */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">TRI cible</label>
            <div className="relative">
              <input
                type="number" step="0.5" min={0} max={200}
                value={targetTRIRaw}
                onChange={(e) => setTargetTRIRaw(Number(e.target.value))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleValidate(); }}
                disabled={!triIsValid}
                className="w-32 px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold disabled:bg-slate-100"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleValidate}
            disabled={isCalculating || !triIsValid || (!hasChanged && levers !== null)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              isCalculating
                ? 'bg-slate-100 text-slate-400 cursor-wait'
                : (!triIsValid || (!hasChanged && levers !== null))
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#0F172A] text-white hover:bg-black'
            }`}
          >
            {isCalculating ? '⏳ Calcul…' : 'Valider'}
          </button>
          <div className="flex-1 min-w-[200px] pl-3 border-l border-slate-200">
            <div className="text-xs text-slate-500">TRI actuel du projet</div>
            <div className="mt-0.5 text-lg font-semibold text-slate-900">
              {triIsValid ? currentTRI.toFixed(2) + ' %' : '⚠️ Non calculable'}
              {triIsValid && validatedTRI !== null && (
                dejaAtteint
                  ? <span className="ml-2 text-emerald-600 text-sm">✅ Dépasse la cible de {(currentTRI - validatedTRI).toFixed(2)} pts</span>
                  : <span className="ml-2 text-amber-600 text-sm">Manque {gap.toFixed(2)} pts</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* État initial */}
      {validatedTRI === null && triIsValid && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-sm font-medium text-slate-700">
            Saisissez un TRI cible ci-dessus, puis cliquez sur <b>Valider</b>.
          </p>
        </div>
      )}

      {/* Déjà atteint : message clair */}
      {validatedTRI !== null && dejaAtteint && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="text-sm font-semibold text-emerald-800">
            🎉 Votre projet dépasse déjà la cible
          </h3>
          <p className="text-xs text-emerald-700 mt-1">
            TRI actuel <b>{currentTRI.toFixed(2)} %</b> ≥ cible <b>{validatedTRI} %</b>. Aucun levier nécessaire.
            Essayez une cible plus haute (ex: {Math.round(currentTRI + 5)} %) pour voir les leviers.
          </p>
        </div>
      )}

      {/* Tableau des leviers — affiché si au moins un levier a une valeur requise différente */}
      {validatedTRI !== null && levers !== null && !dejaAtteint && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Leviers pour atteindre {validatedTRI} %</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Chaque levier est calculé indépendamment (les autres paramètres restent inchangés).
              </p>
            </div>
            <button type="button" onClick={() => { setValidatedTRI(null); setAppliedKey(null); }}
              className="text-[11px] text-slate-500 hover:text-slate-800 underline">
              ↺ Effacer
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-500">
                  <th className="px-3 py-2">Levier</th>
                  <th className="px-3 py-2 text-right">Actuel</th>
                  <th className="px-3 py-2 text-right">Requis</th>
                  <th className="px-3 py-2 text-right">Écart</th>
                  <th className="px-3 py-2">Verdict</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {levers.map((lever) => {
                  const style = VERDICT_STYLES[lever.verdict];
                  const canApply = lever.requiredValue !== null && Math.abs(lever.gapPercent) > 0.5;
                  return (
                    <tr key={lever.key} className="border-t border-slate-100">
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900">{lever.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 max-w-xs">{lever.description}</div>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{fmtValue(lever.currentValue, lever.unit)}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-semibold">
                        {lever.requiredValue !== null ? fmtValue(lever.requiredValue, lever.unit) : '—'}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {lever.requiredValue !== null ? (
                          <span className={lever.gapPercent > 0 ? 'text-emerald-700' : 'text-red-700'}>
                            {lever.gapPercent > 0 ? '+' : ''}{lever.gapPercent.toFixed(1)} %
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-medium ${style.className}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button type="button" disabled={!canApply} onClick={() => applyLever(lever)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                            canApply
                              ? appliedKey === lever.key ? 'bg-emerald-100 text-emerald-700' : 'bg-[#0F172A] text-white hover:bg-black'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}>
                          {appliedKey === lever.key ? '✅ Appliqué' : 'Appliquer'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Encart debug (pliable) */}
      {validatedTRI !== null && triIsValid && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <button type="button" onClick={() => setShowDebug(!showDebug)}
            className="text-[11px] text-slate-500 hover:text-slate-800 font-mono">
            {showDebug ? '▼' : '▶'} Debug valeurs
          </button>
          {showDebug && (
            <div className="mt-2 text-[10px] font-mono text-slate-600 space-y-0.5">
              <div>currentTRI = {currentTRI.toFixed(4)} %</div>
              <div>validatedTRI = {validatedTRI} %</div>
              <div>dejaAtteint = {String(dejaAtteint)}</div>
              <div>gap = {gap.toFixed(4)} pts</div>
              <div>levers !== null = {String(levers !== null)}</div>
              {levers && levers.map((l) => (
                <div key={l.key}>{l.key}: current={l.currentValue}, required={l.requiredValue}, gap={l.gapPercent.toFixed(2)}%, verdict={l.verdict}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
