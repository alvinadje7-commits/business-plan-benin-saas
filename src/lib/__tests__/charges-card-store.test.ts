// Test P0.3 — ChargesCard alimente le store
import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../../store/projectStore';

describe('Store — charges persistées', () => {
  beforeEach(() => { useProjectStore.getState().reset(); });

  it('updateSalaryLines recalcule masseSalariale', () => {
    const st = useProjectStore.getState();
    const avant = st.hypotheses.masseSalariale;
    st.updateSalaryLines([
      { id: 's1', poste: 'Test', monthly: 500000, socialCharges: 1, fiscalCharges: 1, recruitments: [{ year: 1, count: 1 }] },
    ]);
    const apres = useProjectStore.getState().hypotheses.masseSalariale;
    expect(apres).toBeGreaterThan(avant);
    expect(apres).toBeGreaterThanOrEqual(500000 * 12);
  });

  it('updateExternalCharges recalcule pctChargesExt', () => {
    const st = useProjectStore.getState();
    st.updateExternalCharges([{ id: 'e1', label: 'Loyer', monthly: 1_000_000 }]);
    const apres = useProjectStore.getState().hypotheses.pctChargesExt;
    expect(apres).toBeGreaterThan(0);
  });

  it('updateTaxLines stocke les taxes', () => {
    const st = useProjectStore.getState();
    st.updateTaxLines([{ id: 't1', label: 'Patente', monthly: 50000 }]);
    expect(useProjectStore.getState().taxLines.length).toBe(1);
  });
});
