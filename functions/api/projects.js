function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const base = env.VITE_NEON_DATA_API_URL;
  if (!base) return json({ error: 'VITE_NEON_DATA_API_URL manquant' }, 500);

  try {
    if (request.method === 'POST') {
      const body = await request.json();
      const res = await fetch(`${base}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({
          name: body.name || 'Sans titre',
          sector: body.sector || null,
          data: body.data || {},
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        return json({ error: 'Neon POST failed', detail: errText, status: res.status }, res.status);
      }
      const raw = await res.text();
      const result = raw ? JSON.parse(raw) : null;
      return json(Array.isArray(result) ? result[0] : result, 201);
    }

    if (request.method === 'GET') {
      const res = await fetch(`${base}/projects?select=id,name,sector,created_at,updated_at&order=created_at.desc`);
      if (!res.ok) {
        const errText = await res.text();
        return json({ error: 'Neon GET failed', detail: errText, status: res.status }, res.status);
      }
      return json(await res.json());
    }

    return json({ error: 'Méthode non supportée', method: request.method }, 405);
  } catch (e) {
    return json({ error: 'Erreur proxy', detail: String(e) }, 500);
  }
}
