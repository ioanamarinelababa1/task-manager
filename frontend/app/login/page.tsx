'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser } from '../lib/api';
import { setToken, setUser } from '../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      setToken(data.access_token);
      setUser(data.user);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 mb-4 shadow-lg shadow-violet-200">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="3" width="3.5" height="18" rx="1.5" fill="#c4b5fd"/>
              <rect x="6" y="3" width="14" height="18" rx="1.5" fill="white" opacity="0.95"/>
              <circle cx="6" cy="7.5"  r="1.2" fill="none" stroke="#7c3aed" strokeWidth="1.2"/>
              <circle cx="6" cy="12"   r="1.2" fill="none" stroke="#7c3aed" strokeWidth="1.2"/>
              <circle cx="6" cy="16.5" r="1.2" fill="none" stroke="#7c3aed" strokeWidth="1.2"/>
              <rect x="9.5" y="7"  width="7"   height="1.2" rx="0.6" fill="#7c3aed" opacity="0.5"/>
              <rect x="9.5" y="10" width="8.5" height="1.2" rx="0.6" fill="#7c3aed" opacity="0.5"/>
              <rect x="9.5" y="13" width="6.5" height="1.2" rx="0.6" fill="#7c3aed" opacity="0.5"/>
              <rect x="9.5" y="16" width="8"   height="1.2" rx="0.6" fill="#7c3aed" opacity="0.5"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Task Manager</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-red-200 mb-4">
              <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 active:bg-violet-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-violet-600 hover:text-violet-700">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
