
# LIVRABLES - Business Plan Bénin SaaS

Contenu du ZIP:
- src/ : code complet React 18 + TS + Vite 6.4.4 + Tailwind v4
- supabase/migrations/0001_initial.sql : schéma + RLS
- src/modules/sectors/definitions/ : JSON secteurs (poultry, anacarde + 10 génériques extensibles)
- src/lib/calculations/financial-engine.ts : moteur OHADA
- src/modules/sectors/engine.ts : moteur sectoriel dynamique
- workers/src/index.ts : Worker Cloudflare PDF/Excel
- artifact-demo.html : démo live interactive

Installation:
npm i
cp .env.example .env
npm run dev

Démo: ouvrir artifact-demo.html dans navigateur ou utiliser le preview Meta AI
