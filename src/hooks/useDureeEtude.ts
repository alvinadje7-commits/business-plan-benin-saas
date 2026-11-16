// ============================================================
// Hook source unique de durée d'étude (années)
// Dérivé de financement.empruntDuree (années), arrondi supérieur
// Fallback à 7 ans si pas d'emprunt
// ============================================================
import { useProjectStore } from '../store/projectStore';

export function useDureeEtude(): number {
  const dureeEmprunt = useProjectStore((s) => s.financement?.empruntDuree);
  const n = Number(dureeEmprunt || 0);
  if (!isFinite(n) || n <= 0) return 7;
  return Math.max(1, Math.ceil(n));
}
