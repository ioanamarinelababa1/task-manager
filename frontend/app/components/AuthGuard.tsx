'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '../lib/api';
import { setUser } from '../lib/auth';

/**
 * Calls GET /auth/me to verify the httpOnly access_token cookie is still valid.
 * On 401 (expired or missing token) redirects to /login.
 * Shows a spinner during the check to prevent a flash of the authenticated UI.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getMe()
      .then((user) => {
        // Persist non-sensitive user info in sessionStorage for display purposes
        setUser(user);
        setReady(true);
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
