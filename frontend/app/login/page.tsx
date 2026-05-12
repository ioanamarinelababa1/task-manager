'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser } from '../lib/api';
import { setUser } from '../lib/auth';

type Mode = 'login' | 'register';

const FEATURES = [
  'Secure JWT authentication',
  'Real-time task tracking',
  'Works on all devices',
] as const;

const inputBase =
  'w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:bg-white';

// ─── Reusable icons ─────────────────────────────────────────────────────────

function MailIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

// ─── Brand panel (gradient left half on desktop) ─────────────────────────────

function BrandPanel() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-12 text-white">
      {/* Logo */}
      <div className="flex flex-col items-center text-center mb-12">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 ring-1 ring-white/20 mb-6"
          style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.3))' }}
        >
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

        <h1
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ textShadow: '0 2px 16px rgba(0,0,0,0.25)' }}
        >
          Task Manager
        </h1>
        <p
          className="text-base text-white/70 font-light leading-relaxed"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}
        >
          Organize your work, simplify your life
        </p>
      </div>

      {/* Feature list */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {FEATURES.map((feature) => (
          <div key={feature} className="flex items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span
              className="text-sm font-medium text-white/90"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.15)' }}
            >
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function AuthPage() {
  const router = useRouter();

  // Layout + animation state
  const [mode, setMode] = useState<Mode>('login');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Shared form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Page mount + desktop detection
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const onMq = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', onMq);
    return () => {
      clearTimeout(t);
      mq.removeEventListener('change', onMq);
    };
  }, []);

  function switchMode(next: Mode) {
    if (next === mode || isTransitioning) return;
    setIsTransitioning(true);
    setMode(next);
    // Reset form
    setEmail('');
    setPassword('');
    setConfirm('');
    setError('');
    setShowPassword(false);
    setShowConfirm(false);
    setTimeout(() => setIsTransitioning(false), 500);
  }

  // ── Auth handlers (logic unchanged from original) ────────────────────────

  async function handleLoginSubmit(e: React.FormEvent) {
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

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter.');
      return;
    }
    if (!/\d/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await registerUser(email, password);
      setUser(data.user);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  // ── Panel slide transform (desktop only) ─────────────────────────────────

  const panelTransition = 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)';

  const brandStyle: React.CSSProperties = {
    transition: panelTransition,
    opacity: isTransitioning ? 0.88 : 1,
    transform: isDesktop && mode === 'register' ? 'translateX(100%)' : 'translateX(0%)',
  };

  const formStyle: React.CSSProperties = {
    transition: panelTransition,
    opacity: isTransitioning ? 0.88 : 1,
    transform: isDesktop && mode === 'register' ? 'translateX(-100%)' : 'translateX(0%)',
  };

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── Left: brand panel (desktop only) ──────────────────────────── */}
      <div
        className="hidden lg:block w-1/2 shrink-0 bg-gradient-to-br from-violet-600 to-indigo-700"
        style={brandStyle}
      >
        <BrandPanel />
      </div>

      {/* ── Right: form panel ─────────────────────────────────────────── */}
      <div
        className="flex flex-1 items-center justify-center bg-white p-8 min-h-screen"
        style={formStyle}
      >
        {/* Page mount fade-in */}
        <div
          className={`w-full max-w-sm transition-all duration-[400ms] ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          {/* key={mode} triggers slideDown animation on every mode switch */}
          <div key={mode} style={{ animation: 'slideDown 0.35s ease-out' }}>

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="mt-1.5 text-sm text-gray-500">
                {mode === 'login'
                  ? 'Sign in to your Task Manager account'
                  : 'Start organizing your work today'}
              </p>
            </div>

            {/* Error alert */}
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

            {/* Form */}
            <form
              onSubmit={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <MailIcon />
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
                    <LockIcon />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'Min. 8 chars, uppercase, number' : '••••••••'}
                    className={`${inputBase} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {/* Confirm password — register only */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <ShieldIcon />
                    </span>
                    <input
                      id="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputBase} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                </div>
              )}

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
                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                  </span>
                ) : mode === 'login' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Mode switch link */}
            <p className="mt-8 text-center text-sm text-gray-500">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="font-medium text-violet-600 hover:text-violet-700 transition-colors"
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-medium text-violet-600 hover:text-violet-700 transition-colors"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
