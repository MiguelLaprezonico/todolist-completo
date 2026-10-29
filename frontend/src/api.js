const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3333') + '/api/tasks';

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Erro ao comunicar com o servidor.');
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  list: (search, status, signal) =>
    request(`${BASE}?search=${encodeURIComponent(search)}&status=${status}`, { signal }),
  create: (body) => request(BASE, { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id) => request(`${BASE}/${id}`, { method: 'DELETE' }),
};
