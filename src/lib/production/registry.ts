// ============================================================
// Registry — un ProductionModel par code secteur
// Fallback = linearModel pour éviter tout crash
// ============================================================
import { batchModel } from './batch-model';
import { linearModel } from './linear-model';
import { seasonalModel } from './seasonal-model';
import { projectModel } from './project-model';
import { tjmModel } from './tjm-model';
import { capacityModel } from './capacity-model';
import type { ProductionModel } from './types';

const registry: Record<string, ProductionModel> = {
  // Pattern A — Multi-bandes / cycles
  'aviculture':         batchModel,
  'anacarde':           batchModel,
  'agro-industrie':     batchModel,
  'elevage-autre':      batchModel,
  'transformation-agro': batchModel,

  // Pattern B — Linéaire mensuel
  'commerce-general':   linearModel,
  'commerce':           linearModel,
  'import-export':      linearModel,
  'transport':          linearModel,

  // Pattern C — Saisonnier
  'agriculture':        seasonalModel,

  // Pattern D — Projet / chantier
  'btp':                projectModel,

  // Pattern E — TJM / capacité
  'services':           tjmModel,

  // Pattern F — Couverts / lots
  'restauration':       capacityModel,
  'immobilier':         capacityModel,
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

export function getProductionModel(sectorCode: string): ProductionModel {
  const n = normalize(sectorCode);
  const direct = registry[n];
  if (direct) return direct;
  // Fallback safe : pas de crash, juste un modèle générique
  return linearModel;
}

export function listRegisteredSectors(): string[] {
  return Object.keys(registry);
}
