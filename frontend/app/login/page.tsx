'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser } from '../lib/api';
import { setUser } from '../lib/auth';

function BrandPanel() {
  return (
    <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-700 flex-col items-center justify-center p-12 text-white">
      {/* Floating background circles */}
      <div
        aria-hidden="true"
        className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/10"
        style={{ animation: 'float 6s ease-in-out infinite' }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-1/4 -right-16 h-56 w-56 rounded-full bg-white/10"
        style={{ animation: 'float 8s ease-in-out infinite 1.5s' }}
      />
      <div
        aria-hidden="true"
        className="absolute top-2/3 left-1/3 h-28 w-28 rounded-full bg-white/10"
        style={{ animation: 'float 7s ease-in-out infinite 0.75s' }}
      />

      {/* Logo + wordmark */}
      <div className="relative flex flex-col items-center text-center mb-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 ring-1 ring-white/20 mb-6">
          <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="3" width="3.5" height="18" rx="1.5" fill="rgba(255,255,255,0.4)"/>
            <rect x="6" y="3" width="14" height="18" rx="1.5" fill="rgba(255,255,255,0.15)"/>
            <circle cx="6" cy="7.5"  r="1.2" fill="none" stroke="white" strokeWidth="1.2"/>
            <circle cx="6" cy="12"   r="1.2" fill="none" stroke="white" strokeWidth="1.2"/>
            <circle cx="6" cy="16.5" r="1.2" fill="none" stroke="white" strokeWidth="1.2"/>
            <rect x="9.5" y="7"  width="7"   height="1.2" rx="0.6" fill="white" opacity="0.9"/>
            <rect x="9.5" y="10" width="8.5" height="1.2" rx="0.6" fill="white" opacity="0.9"/>
            <rect x="9.5" y="13" width="6.5" height="1.2" rx="0.6" fill="white" opacity="0.9"/>
            <rect x="9.5" y="16" width="8"   height="1.2" rx="0.6" fill="white" opacity="0.9"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Task Manager</h1>
        <p className="text-base text-white/70 font-light leading-relaxed">
          Organize your work, simplify your life
        </p>
      </div>

      {/* Feature list */}
      <div className="relative flex flex-col gap-4 w-full max-w-xs">
        {[
          'Secure JWT authentication',
          'Real-time task tracking',
          'Works on all devices',
        ].map((feature) => (
          <div key={feature} className="flex items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-white/90">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Token is set as an httpOnly cookie by the backend — never touches JS storage
      const data = await loginUser(email, password);
      setUser(data.user);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    'w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:bg-white';

  return (
    <div className="min-h-screen flex">
      <BrandPanel />

      {/* Right: form panel */}
      <div className="flex flex-1 items-center justify-center p-8 bg-white">
        <div
          className={`w-full max-w-sm transition-all duration-[400ms] ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back</h2>
            <p className="mt-1.5 text-sm text-gray-500">Sign in to your Task Manager account</p>
          </div>

          {error && (
            <div
              className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              style={{ animation: 'slideDown 0.2s ease-out' }}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`${inputBase} pr-4`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputBase} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-violet-700 hover:to-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
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

          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-violet-600 hover:text-violet-700 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
