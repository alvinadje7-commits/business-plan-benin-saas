// ============================================================
// Registry — un ProductionModel par couple (secteur, variante)
// Fallback cascade : sectorCode:variant → sectorCode → linearModel
// ============================================================
import { batchModel } from './batch-model';
import { chairModel } from './aviculture-chair-model';
import { pondeuseModel } from './aviculture-pondeuse-model';
import { mixteModel } from './aviculture-mixte-model';
import { linearModel } from './linear-model';
import { seasonalModel } from './seasonal-model';
import { projectModel } from './project-model';
import { tjmModel } from './tjm-model';
import { capacityModel } from './capacity-model';
import { logementsModel } from './immobilier-logements-model';
import { bureauxModel } from './immobilier-bureaux-model';
import { hotelModel } from './immobilier-hotel-model';
import { logementsBureauxModel } from './immobilier-logements-bureaux-model';
import { complexeModel } from './immobilier-complexe-model';
import type { ProductionModel } from './types';

const registry: Record<string, ProductionModel> = {
  // ── Aviculture (variantes) ──
  'aviculture':          batchModel,      // legacy (compat tests/anciens projets)
  'aviculture:pondeuse': pondeuseModel,   // NOUVEAU — lit les champs pondeuse
  'aviculture:chair':    chairModel,      // NOUVEAU
  'aviculture:mixte':    mixteModel,      // NOUVEAU

  // ── Pattern A — Multi-bandes (autres secteurs) ──
  'anacarde':            batchModel,
  'agro-industrie':      batchModel,
  'elevage-autre':       batchModel,
  'transformation-agro': batchModel,

  // ── Pattern B — Linéaire ──
  'commerce-general':    linearModel,
  'commerce':            linearModel,
  'import-export':       linearModel,
  'transport':           linearModel,

  // ── Pattern C — Saisonnier ──
  'agriculture':         seasonalModel,

  // ── Pattern D — Projet ──
  'btp':                 projectModel,

  // ── Pattern E — TJM ──
  'services':            tjmModel,

  // ── Pattern F — Capacité ──
  'restauration':        capacityModel,
  'immobilier':          capacityModel,
  'immobilier:logements':           logementsModel,
  'immobilier:bureaux':             bureauxModel,
  'immobilier:hotel':               hotelModel,
  'immobilier:logements_bureaux':   logementsBureauxModel,
  'immobilier:complexe':            complexeModel,
};

function normalize(code: string): string {
  return code
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s/]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getProductionModel(sectorCode: string, sectorVariant?: string): ProductionModel {
  const n = normalize(sectorCode);
  if (sectorVariant) {
    const v = normalize(sectorVariant);
    const composite = `${n}:${v}`;
    if (registry[composite]) return registry[composite];
  }
  const direct = registry[n];
  if (direct) return direct;
  return linearModel;
}

export function listRegisteredSectors(): string[] {
  return Object.keys(registry);
}
