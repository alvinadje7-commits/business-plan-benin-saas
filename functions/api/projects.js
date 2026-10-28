export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();

  const response = await fetch(`${env.VITE_NEON_DATA_API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}
