
import poultry from './definitions/poultry.json'
import anacarde from './definitions/anacarde.json'
import { SectorDefinition } from '../../types/sector'

const registry: Record<string,SectorDefinition> = {
  poultry: poultry as any,
  anacarde: anacarde as any
}

// 12 secteurs - 10 autres génériques pour MVP extensible
const generic = (code:string,name:string,fields:any[]): SectorDefinition => ({
  sector_code: code,
  sector_name: name,
  description: `${name} - modèle OHADA`,
  currency: 'XOF',
  production_models: ['standard'],
  assumption_fields: fields,
  revenue_rules: [{key:'ca',label:'Chiffre d affaires',formula:'volume * prix_unitaire',unit:'FCFA'}],
  cost_rules: [{key:'achats',label:'Achats',formula:'volume * cout_unitaire',type:'variable'}],
  kpis: [{key:'marge',label:'Marge brute',formula:'ca - achats',unit:'FCFA'}],
  default_investments: [{key:'equip',label:'Equipements',category:'equipements',duration_months:60}],
  risks: [{key:'marche',label:'Risque marché',impact:'medium'}],
  document_sections: ['resume','marche','financier'],
  charts: ['ca','tresorerie']
})

registry['agriculture'] = generic('agriculture','Agriculture',[
  {key:'superficie_ha',label:'Superficie',type:'number',unit:'ha',required:true},
  {key:'rendement_t_ha',label:'Rendement',type:'number',unit:'t/ha',default:3},
  {key:'prix_t',label:'Prix vente',type:'currency',unit:'FCFA/t',default:250000},
  {key:'cout_intrants_ha',label:'Intrants / ha',type:'currency',unit:'FCFA',default:85000}
])
registry['agro_industrie'] = generic('agro_industrie','Agro-industrie',[
  {key:'capacite_t_jour',label:'Capacité t/j',type:'number',unit:'t/j',required:true},
  {key:'taux_utilisation',label:'Taux utilisation',type:'percentage',default:0.7},
  {key:'prix_vente_kg',label:'Prix vente',type:'currency',unit:'FCFA/kg',default:800}
])
registry['commerce'] = generic('commerce','Commerce général',[
  {key:'stock_initial',label:'Stock initial',type:'currency',unit:'FCFA',required:true},
  {key:'rotation_stock',label:'Rotation/an',type:'number',default:6},
  {key:'marge_commerciale',label:'Marge',type:'percentage',default:0.25}
])
registry['import_export'] = generic('import_export','Import-Export',[
  {key:'valeur_import',label:'Valeur import',type:'currency',unit:'FCFA',required:true},
  {key:'taux_douane',label:'Droits de douane',type:'percentage',default:0.15},
  {key:'frais_transit',label:'Frais transit',type:'currency',unit:'FCFA',default:500000}
])
registry['restauration'] = generic('restauration','Restauration',[
  {key:'nb_couverts_jour',label:'Couverts/jour',type:'number',required:true},
  {key:'ticket_moyen',label:'Ticket moyen',type:'currency',unit:'FCFA',default:3500},
  {key:'jours_ouverture',label:'Jours ouverts/mois',type:'number',default:26}
])
registry['btp'] = generic('btp','BTP',[
  {key:'nb_chantiers_an',label:'Chantiers/an',type:'number',required:true},
  {key:'ca_moyen_chantier',label:'CA moyen/chantier',type:'currency',unit:'FCFA',default:15000000},
  {key:'retenue_garantie',label:'Retenue garantie',type:'percentage',default:0.05}
])
registry['transport'] = generic('transport','Transport',[
  {key:'nb_vehicules',label:'Flotte',type:'number',required:true},
  {key:'km_mensuel',label:'Km/mois/véhicule',type:'number',default:5000},
  {key:'prix_km',label:'Prix/km',type:'currency',unit:'FCFA',default:500}
])
registry['services'] = generic('services','Services',[
  {key:'effectif_facturable',label:'Effectif facturable',type:'number',required:true},
  {key:'tjm',label:'TJM',type:'currency',unit:'FCFA',default:75000},
  {key:'taux_utilisation',label:'Taux utilisation',type:'percentage',default:0.65}
])
registry['elevage_autre'] = generic('elevage_autre','Élevage autre',[
  {key:'cheptel',label:'Cheptel initial',type:'number',required:true},
  {key:'taux_croissance',label:'Croissance/an',type:'percentage',default:0.2},
  {key:'prix_vente_tete',label:'Prix/tête',type:'currency',unit:'FCFA',default:150000}
])
registry['transformation_agro'] = generic('transformation_agro','Transformation agroalimentaire',[
  {key:'capacite_installee',label:'Capacité installée',type:'number',unit:'kg/j',required:true},
  {key:'rendement_matiere',label:'Rendement matière',type:'percentage',default:0.85},
  {key:'cout_matiere_kg',label:'Coût matière/kg',type:'currency',unit:'FCFA',default:300}
])

export const sectorEngine = {
  list: () => Object.values(registry),
  get: (code:string) => registry[code],
  getFields: (code:string, model?:string) => registry[code]?.assumption_fields ?? [],
  evaluateFormula: (formula:string, vars:Record<string,number>) => {
    try {
      const fn = new Function(...Object.keys(vars), `return ${formula}`)
      return fn(...Object.values(vars))
    } catch { return 0 }
  }
}
