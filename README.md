
# Business Plan Bénin - SaaS OHADA

Stack: React 18 + TS + Vite 6.4.4 + Tailwind v4 + Supabase + Cloudflare Workers/Pages

## Architecture
- `src/modules/sectors/engine.ts` : moteur sectoriel dynamique (12 secteurs)
- `src/lib/calculations/financial-engine.ts` : moteur financier central (compte résultat, bilan, trésorerie, VAN/TRI, alertes cohérence)
- `supabase/migrations` : schéma PostgreSQL avec RLS
- `workers/src` : exports PDF/Excel + recalcul serveur

## Secteurs livrés
Aviculture, Anacarde, Agriculture, Agro-industrie, Commerce, Import-Export, Restauration, BTP, Transport, Services, Élevage autre, Transformation agro

## Lancer
```bash
npm i
cp .env.example .env
npm run dev
```

## Déploiement Cloudflare
- Frontend: Cloudflare Pages `npm run build` -> dist
- Workers: `wrangler deploy workers/src/index.ts`

## Exports
PDF via jsPDF-autotable (Worker), Excel via ExcelJS (formules visibles)

## Fiscalité Bénin
TVA 18%, IS 30%, CNSS 6.4%, SYSCOHADA

## RLS
Un utilisateur ne voit que projets de son organisation. Owner > consultant > analyste > invité. Liens partagés avec expiration + password.

## Ajout secteur
Ajouter un JSON dans `src/modules/sectors/definitions/` + enregistrer dans engine.ts. Aucune modification UI nécessaire.
