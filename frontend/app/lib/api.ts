import { Task, TaskFormData, AuthResponse } from './types';
import { getToken, clearToken } from './auth';

const API_BASE = 'http://localhost:3001';

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extra };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function handle401(res: Response): void {
  if (res.status === 401) {
    clearToken();
    window.location.replace('/login');
  }
}

// ── Auth ────────────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Invalid credentials');
  }
  return res.json();
}

export async function registerUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Registration failed');
  }
  return res.json();
}

// ── Tasks ───────────────────────────────────────────────────────────────────

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/tasks`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  handle401(res);
  if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.statusText}`);
  return res.json();
}

export async function createTask(data: TaskFormData): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  handle401(res);
  if (!res.ok) throw new Error(`Failed to create task: ${res.statusText}`);
  return res.json();
}

export async function updateTask(id: string, data: Partial<TaskFormData>): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  handle401(res);
  if (!res.ok) throw new Error(`Failed to update task: ${res.statusText}`);
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  handle401(res);
  if (!res.ok) throw new Error(`Failed to delete task: ${res.statusText}`);
}
