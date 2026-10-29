import { neon } from '@neondatabase/serverless';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const databaseUrl = env.DATABASE_URL;
  
  if (!databaseUrl) {
    return json({ error: 'DATABASE_URL manquante dans les variables d\'environnement' }, 500);
  }

  const sql = neon(databaseUrl);

  try {
    if (request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return json({ error: 'Body JSON invalide', detail: String(e) }, 400);
      }

      const name = body.name || 'Sans titre';
      const sector = body.sector || null;
      const data = body.data || {};

      // Requête SQL directe (sécurisée contre les injections)
      const result = await sql`
        INSERT INTO projects (name, sector, data)
        VALUES (${name}, ${sector}, ${JSON.stringify(data)}::jsonb)
        RETURNING *
      `;
      return json(result[0], 201);
    }

    if (request.method === 'GET') {
      const result = await sql`
        SELECT id, name, sector, created_at, updated_at
        FROM projects
        ORDER BY created_at DESC
      `;
      return json(result);
    }

    return json({ error: 'Méthode non supportée', method: request.method }, 405);
  } catch (e) {
    console.error('[DB error]', e);
    return json({ error: 'Erreur base de données', detail: String(e) }, 500);
  }
}
