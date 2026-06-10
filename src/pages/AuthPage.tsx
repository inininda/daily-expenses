import { useState } from 'react';
import type { FormEvent } from 'react';
import { login, signup } from '../api/auth';
import { btnCls, cn, INPUT, LABEL } from '../utils/cn';
import { useTheme } from '../contexts/ThemeContext';
import type { User } from '../types';

interface AuthPageProps {
  onSuccess: (user: User) => void;
}

type Mode = 'login' | 'signup';

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const { theme, toggle: toggleTheme } = useTheme();
  const switchMode = (m: Mode) => { setMode(m); setError(''); setInfo(''); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await login(email, password);
        onSuccess(data.user);
      } else {
        const data = await signup(email, password, name || undefined);
        if (data.session) {
          onSuccess(data.user);
        } else {
          setInfo('Check your inbox and confirm your email, then sign in here.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh flex items-center justify-center p-4 bg-bg relative">
      <button
        className="fixed top-4 right-4 w-[34px] h-[34px] flex items-center justify-center rounded-lg text-tx-muted hover:bg-surface-2 hover:text-tx-heading transition-colors border border-border bg-surface cursor-pointer text-[16px]"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <div className="bg-surface border border-border rounded-2xl p-8 w-full max-w-[400px] shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.05)]">

        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-[42px] h-[42px] bg-accent rounded-xl flex items-center justify-center text-[22px]">
            💰
          </div>
          <span className="text-[20px] font-bold text-tx-heading">Daily Expenses</span>
        </div>

        <div className="flex bg-surface-2 rounded-lg p-[3px] mb-5">
          {(['login', 'signup'] as Mode[]).map((m) => (
            <button
              key={m} type="button"
              className={cn(
                'flex-1 py-2 rounded border-0 text-[13.5px] font-medium cursor-pointer transition-[background,color] duration-150',
                mode === m ? 'bg-surface text-tx-heading shadow-sm' : 'bg-transparent text-tx-muted'
              )}
              onClick={() => switchMode(m)}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {error && (
          <div className="px-3.5 py-2.5 bg-danger-bg border border-danger/20 rounded-lg text-danger text-[13px] mb-4">
            {error}
          </div>
        )}

        {info && (
          <div className="px-3.5 py-2.5 bg-accent/10 border border-accent/25 rounded-lg text-accent text-[13px] mb-4">
            {info}
          </div>
        )}

        <form className="flex flex-col gap-[14px]" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="flex flex-col gap-1.5">
              <label className={LABEL} htmlFor="auth-name">
                Name <span className="font-normal text-tx-muted text-[12px]">(optional)</span>
              </label>
              <input id="auth-name" className={INPUT} type="text" placeholder="Jane Doe"
                value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className={LABEL} htmlFor="auth-email">Email</label>
            <input id="auth-email" className={INPUT} type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required autoFocus autoComplete="email" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={LABEL} htmlFor="auth-password">Password</label>
            <input id="auth-password" className={INPUT} type="password"
              placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
              value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={mode === 'signup' ? 8 : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>

          <button type="submit" className={btnCls('primary', 'default', 'w-full justify-center mt-1')} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
