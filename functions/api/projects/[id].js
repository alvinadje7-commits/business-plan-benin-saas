function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequest(context) {
  const { request, env, params } = context;
  const id = params.id;
  const base = env.VITE_NEON_DATA_API_URL;
  if (!id) return json({ error: 'ID manquant' }, 400);
  if (!base) return json({ error: 'VITE_NEON_DATA_API_URL manquant' }, 500);

  try {
    if (request.method === 'GET') {
      const res = await fetch(`${base}/projects?id=eq.${encodeURIComponent(id)}&select=*`);
      if (!res.ok) return json({ error: 'Neon GET failed', status: res.status }, res.status);
      const rows = await res.json();
      if (!rows[0]) return json({ error: 'Projet introuvable' }, 404);
      return json(rows[0]);
    }

    if (request.method === 'PATCH' || request.method === 'PUT') {
      const body = await request.json();
      const res = await fetch(`${base}/projects?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({
          name: body.name,
          sector: body.sector,
          data: body.data,
          updated_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        return json({ error: 'Neon PATCH failed', detail: errText, status: res.status }, res.status);
      }
      const raw = await res.text();
      const result = raw ? JSON.parse(raw) : null;
      return json(Array.isArray(result) ? result[0] : result);
    }

    if (request.method === 'DELETE') {
      const res = await fetch(`${base}/projects?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) return json({ error: 'Neon DELETE failed', status: res.status }, res.status);
      return json({ success: true, id });
    }

    return json({ error: 'Méthode non supportée', method: request.method }, 405);
  } catch (e) {
    return json({ error: 'Erreur proxy', detail: String(e) }, 500);
  }
}
