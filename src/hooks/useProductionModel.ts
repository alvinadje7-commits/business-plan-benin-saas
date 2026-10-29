import { useMemo } from 'react';
import { useProjectStore } from '../store/projectStore';
import { getProductionModel } from '../lib/production/registry';

export function useProductionModel() {
  const sectorCode = useProjectStore((s) => s.sectorCode);
  const sectorValues = useProjectStore((s) => s.sectorValues);
  const hypotheses = useProjectStore((s) => s.hypotheses);

  return useMemo(() => {
    if (!sectorCode) return null;
    const model = getProductionModel(sectorCode);
    const durationYears = (hypotheses as { dureeEtude?: number; durationYears?: number })?.dureeEtude
      ?? (hypotheses as { durationYears?: number })?.durationYears
      ?? 7;
    const ctx = { sectorCode, sectorValues, durationYears };
    return {
      model,
      durationYears,
      revenue: model.computeMonthlyRevenue(ctx),
      costs: model.computeMonthlyVariableCosts(ctx),
      quantities: model.computeMonthlyQuantities(ctx),
      technical: model.getTechnicalSheet(ctx),
      kpis: model.getSectorKPIs(ctx),
    };
  }, [sectorCode, sectorValues, hypotheses]);
}
