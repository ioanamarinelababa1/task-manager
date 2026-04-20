/**
 * Stores non-sensitive display data (user id + email) and, as a fallback for
 * browsers that block cross-domain cookies (iOS Safari ITP), the access token
 * itself. Both live in sessionStorage so they are cleared when the tab closes.
 *
 * Preferred path: httpOnly cookie set by the backend (never readable from JS).
 * Fallback path:  sessionStorage token sent as Authorization: Bearer header.
 */
const USER_KEY = 'tm_user';
const TOKEN_KEY = 'tm_access_token';

export interface AuthUser {
  id: number;
  email: string;
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser): void {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}
