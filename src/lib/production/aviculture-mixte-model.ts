// ============================================================
// Aviculture — MIXTE (chair + ponte)
// Composition : chairModel + pondeuseModel avec effectifs séparés
// ============================================================
import type {
  ProductionContext, ProductionModel, CostLine, MonthlyQuantities,
  TechnicalSheetLine, SectorKPI,
} from './types';
import { num } from './types';
import { chairModel } from './aviculture-chair-model';
import { pondeuseModel } from './aviculture-pondeuse-model';

function ctxChair(ctx: ProductionContext): ProductionContext {
  return { ...ctx, sectorValues: { ...ctx.sectorValues, effectif: num(ctx, 'nbSujetsChairSepare', 2000) } };
}
function ctxPonte(ctx: ProductionContext): ProductionContext {
  return { ...ctx, sectorValues: { ...ctx.sectorValues, effectif: num(ctx, 'nbSujetsPonteSepare', 3000) } };
}

function sumArrays(a: number[], b: number[]): number[] {
  const len = Math.max(a.length, b.length);
  const out = new Array(len).fill(0);
  for (let i = 0; i < len; i++) out[i] = (a[i] ?? 0) + (b[i] ?? 0);
  return out;
}

function mergeCosts(a: CostLine[], b: CostLine[]): CostLine[] {
  const map: Record<string, CostLine> = {};
  for (const c of a) map[c.key] = { key: c.key, label: c.label, values: [...c.values] };
  for (const c of b) {
    if (map[c.key]) map[c.key].values = sumArrays(map[c.key].values, c.values);
    else map[c.key] = { key: c.key, label: c.label, values: [...c.values] };
  }
  return Object.values(map);
}

function mergeQuantities(a: MonthlyQuantities, b: MonthlyQuantities): MonthlyQuantities {
  const out: MonthlyQuantities = {};
  for (const k of Object.keys(a)) out[k] = [...a[k]];
  for (const k of Object.keys(b)) {
    if (out[k]) out[k] = sumArrays(out[k], b[k]);
    else out[k] = [...b[k]];
  }
  return out;
}

export const mixteModel: ProductionModel = {
  computeMonthlyRevenue(ctx) {
    return sumArrays(
      chairModel.computeMonthlyRevenue(ctxChair(ctx)),
      pondeuseModel.computeMonthlyRevenue(ctxPonte(ctx)),
    );
  },
  computeMonthlyVariableCosts(ctx) {
    return mergeCosts(
      chairModel.computeMonthlyVariableCosts(ctxChair(ctx)),
      pondeuseModel.computeMonthlyVariableCosts(ctxPonte(ctx)),
    );
  },
  computeMonthlyQuantities(ctx) {
    return mergeQuantities(
      chairModel.computeMonthlyQuantities(ctxChair(ctx)),
      pondeuseModel.computeMonthlyQuantities(ctxPonte(ctx)),
    );
  },
  getTechnicalSheet(ctx): TechnicalSheetLine[] {
    const nbChair = num(ctx, 'nbSujetsChairSepare', 2000);
    const nbPonte = num(ctx, 'nbSujetsPonteSepare', 3000);
    const repartition = num(ctx, 'repartitionPontePct', 60);
    return [
      { label: 'Atelier chair',            value: `${nbChair} sujets/an` },
      { label: 'Atelier ponte',            value: `${nbPonte} sujets` },
      { label: 'Part CA œufs',             value: `${repartition} %` },
      { label: 'Personnel supplémentaire', value: `${num(ctx, 'personnelSupplementaire', 2)} pers` },
      ...chairModel.getTechnicalSheet(ctxChair(ctx)).slice(0, 3),
      ...pondeuseModel.getTechnicalSheet(ctxPonte(ctx)).slice(0, 3),
    ];
  },
  getSectorKPIs(ctx): SectorKPI[] {
    const repartition = num(ctx, 'repartitionPontePct', 60);
    return [
      { label: 'Part CA œufs',   value: String(repartition),     unit: '%' },
      { label: 'Part CA chair',  value: String(100 - repartition), unit: '%' },
      { label: 'Effectif chair', value: num(ctx, 'nbSujetsChairSepare', 2000), unit: 'sujets/an' },
      { label: 'Effectif ponte', value: num(ctx, 'nbSujetsPonteSepare', 3000), unit: 'sujets' },
    ];
  },
};
