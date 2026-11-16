import { neon } from '@neondatabase/serverless';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequest(context) {
  const { request, env, params } = context;
  const id = params.id;
  const databaseUrl = env.DATABASE_URL;

  if (!id) return json({ error: 'ID manquant' }, 400);
  if (!databaseUrl) return json({ error: 'DATABASE_URL manquante' }, 500);

  const sql = neon(databaseUrl);

  try {
    if (request.method === 'GET') {
      const rows = await sql`SELECT * FROM projects WHERE id = ${id}::uuid`;
      if (!rows[0]) return json({ error: 'Projet introuvable' }, 404);
      return json(rows[0]);
    }

    if (request.method === 'PATCH' || request.method === 'PUT') {
      let body;
      try { body = await request.json(); }
      catch (e) { return json({ error: 'Body JSON invalide', detail: String(e) }, 400); }

      const rows = await sql`
        UPDATE projects
        SET name = ${body.name},
            sector = ${body.sector},
            data = ${JSON.stringify(body.data || {})}::jsonb,
            updated_at = NOW()
        WHERE id = ${id}::uuid
        RETURNING *
      `;
      if (!rows[0]) return json({ error: 'Projet introuvable' }, 404);
      return json(rows[0]);
    }

    if (request.method === 'DELETE') {
      const rows = await sql`DELETE FROM projects WHERE id = ${id}::uuid RETURNING id`;
      if (!rows[0]) return json({ error: 'Projet introuvable' }, 404);
      return json({ success: true, id });
    }

    return json({ error: 'Méthode non supportée', method: request.method }, 405);
  } catch (e) {
    console.error('[DB error]', e);
    return json({ error: 'Erreur base de données', detail: String(e) }, 500);
  }
}
