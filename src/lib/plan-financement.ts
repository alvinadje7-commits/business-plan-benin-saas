// ============================================================
// Plan de financement — Ressources vs Emplois par année
// ============================================================

export interface PlanFinancementInput {
  durationYears: number;
  apportsCapital: number[];
  emprunts: number[];
  subventions: number[];
  caf: number[];
  dettesFiscales: number[];
  investissements: number[];
  variationBFR: number[];
  remboursements: number[];
  dividendes: number[];
}

export interface PlanFinancementYear {
  year: number;
  ressources: {
    apportsCapital: number;
    emprunts: number;
    subventions: number;
    caf: number;
    dettesFiscales: number;
    total: number;
  };
  emplois: {
    investissements: number;
    variationBFR: number;
    remboursements: number;
    dividendes: number;
    total: number;
  };
  solde: number;
  soldeCumule: number;
}

export interface PlanFinancementResult {
  years: PlanFinancementYear[];
  totalRessources: number;
  totalEmplois: number;
  soldeFinal: number;
}

function g(a: number[], i: number): number {
  return a[i] ?? 0;
}

export function computePlanFinancement(input: PlanFinancementInput): PlanFinancementResult {
  const years: PlanFinancementYear[] = [];
  let cumul = 0;

  for (let y = 0; y < input.durationYears; y++) {
    const ressources = {
      apportsCapital: g(input.apportsCapital, y),
      emprunts: g(input.emprunts, y),
      subventions: g(input.subventions, y),
      caf: g(input.caf, y),
      dettesFiscales: g(input.dettesFiscales, y),
    };
    const rTotal = ressources.apportsCapital + ressources.emprunts + ressources.subventions + ressources.caf + ressources.dettesFiscales;

    const emplois = {
      investissements: g(input.investissements, y),
      variationBFR: g(input.variationBFR, y),
      remboursements: g(input.remboursements, y),
      dividendes: g(input.dividendes, y),
    };
    const eTotal = emplois.investissements + emplois.variationBFR + emplois.remboursements + emplois.dividendes;

    const solde = rTotal - eTotal;
    cumul += solde;

    years.push({
      year: y + 1,
      ressources: { ...ressources, total: rTotal },
      emplois: { ...emplois, total: eTotal },
      solde,
      soldeCumule: cumul,
    });
  }

  return {
    years,
    totalRessources: years.reduce((s, y) => s + y.ressources.total, 0),
    totalEmplois: years.reduce((s, y) => s + y.emplois.total, 0),
    soldeFinal: cumul,
  };
}
