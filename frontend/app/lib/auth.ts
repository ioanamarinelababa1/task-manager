/**
 * Stores only non-sensitive display data (user id + email) in sessionStorage.
 * JWTs are stored exclusively in httpOnly cookies set by the backend —
 * they are never accessible from JavaScript, which eliminates the XSS
 * attack vector that would exist if tokens were stored in localStorage.
 *
 * sessionStorage is used instead of localStorage so data is cleared
 * automatically when the browser tab is closed.
 */
const USER_KEY = 'tm_user';

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
}
