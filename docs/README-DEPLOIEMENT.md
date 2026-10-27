# Déploiement

## Stack obligatoire respectée
- Frontend: React 18 + TypeScript + Vite 6.4.4
- Styles: Tailwind v4
- DB: Supabase PostgreSQL + Auth + Realtime + Storage
- Backend: Cloudflare Workers
- Hosting: Cloudflare Pages
- Exports PDF/Excel
- Langue: français, Devise: FCFA XOF, OHADA

## Installation
npm i
cp .env.example .env
npm run dev -> http://localhost:5173

## Supabase
supabase db push
Politiques RLS incluses dans migrations/0001_initial.sql

## Workers
wrangler deploy workers/src/index.ts
