/**
 * All requests use `credentials: 'include'` so the browser automatically
 * attaches the httpOnly access_token cookie (preferred, XSS-safe path).
 *
 * As a fallback for browsers that block cross-domain cookies (iOS Safari ITP),
 * the access token returned by login/register is also stored in sessionStorage
 * and sent as an Authorization: Bearer header on every request.
 *
 * On a 401 the client silently calls POST /auth/refresh to get a new
 * access token (the refresh token cookie is sent automatically) and retries
 * the original request once. If the refresh also fails the user is redirected
 * to /login.
 */
import { Task, TaskFormData, AuthResponse } from './types';
import { clearUser, getToken, setToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

// Returns Authorization: Bearer header when a token is stored in sessionStorage.
// This is the fallback for mobile Safari where cross-domain cookies are blocked.
function bearerHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Core fetch wrapper with silent token refresh ─────────────────────────────

async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const opts: RequestInit = {
    ...options,
    credentials: 'include',
    headers: { ...bearerHeaders(), ...(options.headers as Record<string, string> ?? {}) },
  };
  let res = await fetch(url, opts);

  if (res.status === 401) {
    // Attempt a silent refresh using the refresh_token httpOnly cookie
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshRes.ok) {
      // Retry original request — new access_token cookie is now set
      res = await fetch(url, opts);
    } else {
      // Refresh token expired or invalid — force re-login
      clearUser();
      window.location.replace('/login');
    }
  }

  return res;
}

// ── Auth endpoints (no retry wrapper — handle errors directly) ───────────────

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: JSON_HEADERS,
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body.message;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Invalid credentials'));
  }
  const data: AuthResponse = await res.json();
  // Save token as Bearer fallback for browsers that block cross-domain cookies.
  if (data.access_token) setToken(data.access_token);
  return data;
}

export async function registerUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: JSON_HEADERS,
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body.message;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Registration failed'));
  }
  const data: AuthResponse = await res.json();
  if (data.access_token) setToken(data.access_token);
  return data;
}

export async function logoutUser(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function getMe(): Promise<{ id: number; email: string }> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: 'include',
    headers: bearerHeaders(),
  });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

// ── Task endpoints ────────────────────────────────────────────────────────────

export async function fetchTasks(): Promise<Task[]> {
  const res = await apiFetch(`${API_BASE}/tasks`);
  if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.statusText}`);
  return res.json();
}

export async function createTask(data: TaskFormData): Promise<Task> {
  const res = await apiFetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create task: ${res.statusText}`);
  return res.json();
}

export async function updateTask(id: number, data: Partial<TaskFormData>): Promise<Task> {
  // Strip undefined and empty-string values so the backend never receives invalid dueDate/category
  const payload = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined && v !== ''),
  );
  const url = `${API_BASE}/tasks/${String(id)}`;
  console.log('[updateTask] id=%o url=%s body=%s', id, url, JSON.stringify(payload));
  const res = await apiFetch(url, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = (body as { message?: string | string[] }).message;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : (msg ?? `Failed to update task: ${res.statusText}`));
  }
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  const res = await apiFetch(`${API_BASE}/tasks/${String(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete task: ${res.statusText}`);
}
