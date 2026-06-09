const BASE_URL = import.meta.env.VITE_API_URL || 'https://vivero-madra.onrender.com';
function getToken() {
  return localStorage.getItem('vivero_token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get:    (path)       => request('GET',    path),
  post:   (path, body) => request('POST',   path, body),
  patch:  (path, body) => request('PATCH',  path, body),
  delete: (path)       => request('DELETE', path),
};

// ── Auth ──────────────────────────────────────────────
export async function loginApi(email, password) {
  const data = await api.post('/auth/login', { email, password });
  localStorage.setItem('vivero_token', data.access_token);
  localStorage.setItem('vivero_user', JSON.stringify(data.user));
  return data.user;
}

export function logoutApi() {
  localStorage.removeItem('vivero_token');
  localStorage.removeItem('vivero_user');
}

export function getSavedUser() {
  const raw = localStorage.getItem('vivero_user');
  return raw ? JSON.parse(raw) : null;
}

// ── Registro ──────────────────────────────────────────
export function registerApi(name, email, password) {
  return api.post('/users', { name, email, password });
}

// ── Personal ──────────────────────────────────────────
export function getPersonalApi()              { return api.get('/users'); }
export function crearPersonalApi(data)        { return api.post('/users', data); }
export function actualizarPersonalApi(id, data) { return api.patch(`/users/${id}`, data); }
export function eliminarPersonalApi(id)       { return api.delete(`/users/${id}`); }

// ── Plantas / Productos ───────────────────────────────
export function getPlantasApi()              { return api.get('/products'); }
export function crearPlantaApi(data)         { return api.post('/products', data); }
export function actualizarPlantaApi(id, data){ return api.patch(`/products/${id}`, data); }
export function eliminarPlantaApi(id)        { return api.delete(`/products/${id}`); }

// ── Ventas / Movimientos ──────────────────────────────
export function getMovimientosApi()          { return api.get('/sales'); }
export function crearVentaApi(userId, productId, quantity) {
  return api.post('/sales', { userId, items: [{ productId, quantity }] });
}
