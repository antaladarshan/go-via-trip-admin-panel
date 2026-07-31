'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { BRAND } from '@/lib/brand';
import Logo from '@/components/brand/logo';
import TravelAuthBackground from '@/components/brand/travel-auth-background';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        setError('This account is not an admin account.');
        return;
      }
      router.replace('/');
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-10">
      <TravelAuthBackground />
      <div className="relative z-10 w-full max-w-[420px] flex flex-col gap-7 bg-surface/70 backdrop-blur-xl border border-neutral-border/60 rounded-3xl shadow-2xl p-8 sm:p-9">
        <div>
          <Logo variant="wordmark" className="h-8 w-auto mb-3" />
          <p className="text-[13px] font-semibold text-brand-red tracking-widest uppercase">
            {BRAND.productName}
          </p>
          <p className="mt-1 text-[15px] text-neutral-secondary">
            Sign in to manage the Quiliss platform.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[14px] rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-neutral-primary" htmlFor="login-email">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-secondary" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-neutral-border rounded-xl px-4 py-3 pl-11 text-[15px] text-neutral-primary bg-bg outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-neutral-primary" htmlFor="login-password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-secondary" />
              <input
                id="login-password"
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                required
                maxLength={128}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-neutral-border rounded-xl px-4 py-3 pl-11 pr-12 text-[15px] text-neutral-primary bg-bg outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-secondary"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-brand-red text-white font-semibold text-[15px] rounded-xl py-3.5 hover:bg-brand-red-dark transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
