import { getActiveVariant, type SectorConfig } from '../lib/sectors-config';

interface Props {
  sector: SectorConfig;
  currentVariant: string;
  onSelect: (variantKey: string) => void;
  /** "compact" = inline, "cards" = grandes cartes */
  layout?: 'compact' | 'cards';
  showWarning?: boolean;
}

export function VariantSelector({ sector, currentVariant, onSelect, layout = 'cards', showWarning = true }: Props) {
  if (!sector.variants) return null;

  const variants = Object.values(sector.variants);

  const handleChange = (key: string) => {
    if (key === currentVariant) return;
    if (confirm(
      `Changer pour "${sector.variants![key]?.label}" ?\n\n` +
      `⚠️ Les champs spécifiques à la variante seront réinitialisés.\n` +
      `Les champs communs (effectif, mortalité, aliment…) sont conservés.`
    )) {
      onSelect(key);
    }
  };

  if (layout === 'compact') {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-xs font-medium text-slate-700">Type d'élevage</label>
        <select
          value={currentVariant}
          onChange={(e) => handleChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
        >
          {variants.map((v) => (
            <option key={v.key} value={v.key}>
              {v.icon} {v.label}
            </option>
          ))}
        </select>
        {showWarning && (
          <span className="text-[10px] text-amber-700">
            ⚠️ Changement = réinitialisation des champs spécifiques
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {variants.map((v) => {
        const selected = v.key === currentVariant;
        const invTotal = v.investmentTemplates.reduce((s, i) => s + i.cost, 0);
        return (
          <button
            key={v.key}
            type="button"
            onClick={() => handleChange(v.key)}
            className={`relative p-3 rounded-xl border-2 text-left transition ${
              selected
                ? 'border-[#0F172A] bg-[#0F172A] text-white shadow-lg'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
            }`}
          >
            {selected && (
              <span className="absolute top-1.5 right-1.5 text-[9px] bg-emerald-500 px-1.5 py-0.5 rounded-full text-white font-bold">
                ACTIF
              </span>
            )}
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                selected ? 'bg-white' : 'bg-slate-100'
              }`}>
                {v.icon}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-xs truncate">{v.label}</div>
                <div className={`text-[10px] tabular-nums ${selected ? 'text-white/70' : 'text-slate-500'}`}>
                  ~{invTotal.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
            </div>
            <div className={`text-[10px] leading-snug ${selected ? 'text-white/80' : 'text-slate-600'}`}>
              {v.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/** Badge compact pour la sidebar */
export function VariantBadge({ sector, variantKey }: { sector: SectorConfig; variantKey: string }) {
  const variant = getActiveVariant(sector, variantKey);
  if (!variant) return null;
  return (
    <div className="mt-2 px-2 py-1 rounded bg-white/10 text-[10px] text-white/90 flex items-center gap-1">
      <span>{variant.icon}</span>
      <span className="truncate">{variant.label}</span>
    </div>
  );
}
