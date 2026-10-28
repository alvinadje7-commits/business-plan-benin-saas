import type { SectorSynthesis } from '../types/project';

/**
 * Moteur simplifié de synthèse par secteur.
 * Les formules sont volontairement simples pour la démo.
 * À terme : remplacé par financial-engine.ts (calculs OHADA complets).
 */
export function computeSectorSynthesis(
  sectorCode: string,
  values: Record<string, number>,
): SectorSynthesis {
  const v = (k: string) => Number(values[k] ?? 0);
  let ca = 0;
  let marge = 30;
  let bfrMois = 1; // BFR = n mois de CA
  let jobs = 3;

  switch (sectorCode) {
    case 'aviculture': {
      const cycles = v('cycles');
      const effectif = v('effectif');
      const mortalite = v('mortalite') / 100;
      const poids = v('poids');
      const prixKg = v('prixKg');
      ca = cycles * effectif * (1 - mortalite) * poids * prixKg;
      marge = 35;
      bfrMois = 2;
      jobs = 4;
      break;
    }
    case 'anacarde': {
      ca = v('superficie') * v('rendement') * v('prixBord');
      marge = 30;
      bfrMois = 3;
      jobs = 8;
      break;
    }
    case 'agriculture': {
      ca = v('superficie') * v('rendement') * v('prixVente');
      marge = 25;
      bfrMois = 4;
      jobs = 6;
      break;
    }
    case 'agro_industrie': {
      const caBrut = v('capacite') * 12 * (v('utilisation') / 100) * v('prixPF');
      const coutMP = v('capacite') * 12 * (v('utilisation') / 100) * v('mp') / (v('rendement') / 100 || 1);
      ca = caBrut;
      marge = caBrut > 0 ? ((caBrut - coutMP) / caBrut) * 100 : 0;
      bfrMois = 2;
      jobs = 10;
      break;
    }
    case 'commerce': {
      ca = v('caCible') * 12;
      marge = v('marge');
      bfrMois = 1.5;
      jobs = 3;
      break;
    }
    case 'import_export': {
      ca = v('cif') * 12 * (1 + v('marge') / 100);
      marge = v('marge');
      bfrMois = 2;
      jobs = 4;
      break;
    }
    case 'restauration': {
      ca = v('couverts') * v('ticket') * v('jours') * 12;
      marge = 100 - v('foodCost');
      bfrMois = 1;
      jobs = 5;
      break;
    }
    case 'btp': {
      ca = v('facturation') * 12;
      marge = 100 - v('materiaux') - v('sousTraitance');
      bfrMois = 3;
      jobs = 12;
      break;
    }
    case 'transport': {
      ca = v('vehicules') * v('kmMois') * v('prixKm') * (v('remplissage') / 100) * 12;
      marge = 40;
      bfrMois = 1.5;
      jobs = v('vehicules') * 2;
      break;
    }
    case 'services': {
      ca = v('effectif') * v('tjm') * v('joursFact') * (v('utilisation') / 100) * 12;
      marge = 55;
      bfrMois = 2;
      jobs = v('effectif');
      break;
    }
    case 'elevage_autre': {
      ca = v('cheptel') * (v('croissance') / 100) * v('prixTete');
      marge = 30;
      bfrMois = 3;
      jobs = 5;
      break;
    }
    case 'transformation_agro': {
      ca = v('capacite') * v('jours') * 12 * v('prixPF');
      marge = v('prixPF') > 0 ? ((v('prixPF') - v('coutMP')) / v('prixPF')) * 100 : 0;
      bfrMois = 2;
      jobs = 8;
      break;
    }
  }

  const caMensuel = ca / 12;
  return {
    ca: Math.round(ca),
    marge: Math.max(0, Math.min(100, Math.round(marge * 10) / 10)),
    bfr: Math.round(caMensuel * bfrMois),
    jobs: Math.max(1, Math.round(jobs)),
  };
}

export function fmtFCFA(n: number): string {
  return n.toLocaleString('fr-FR');
}
