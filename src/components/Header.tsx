import { useState, useEffect, useRef } from 'react';
import { cn, btnCls } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import { useLogout } from '../hooks/useExpenses';
import { useTheme } from '../contexts/ThemeContext';

export type Page = 'dashboard' | 'expenses';

interface HeaderProps {
  page: Page;
  onNavigate: (page: Page) => void;
  onAddExpense: () => void;
}

export function Header({ page, onNavigate, onAddExpense }: HeaderProps) {
  const { user } = useAuth();
  const logout = useLogout();
  const { theme, toggle: toggleTheme } = useTheme();
  const initial = (user?.email?.[0] ?? 'U').toUpperCase();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-[100] bg-surface border-b border-border backdrop-blur-sm">
      <div className="max-w-[1080px] mx-auto px-3 sm:px-6 h-[58px] flex items-center gap-2 sm:gap-3">

        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-[15px] text-tx-heading whitespace-nowrap shrink-0">
          <div className="w-[30px] h-[30px] bg-accent rounded-lg flex items-center justify-center text-[15px]">
            💰
          </div>
          <span className="hidden md:inline">Daily Expenses</span>
        </div>

        {/* Nav */}
        <nav className="flex gap-0.5">
          {(['dashboard', 'expenses'] as Page[]).map((p) => (
            <button
              key={p}
              className={cn(
                'px-2.5 sm:px-3.5 py-1.5 rounded-lg border-0 text-[13px] font-medium cursor-pointer transition-colors whitespace-nowrap',
                page === p
                  ? 'bg-accent/10 text-accent'
                  : 'bg-transparent text-tx-muted hover:bg-surface-2 hover:text-tx-heading'
              )}
              onClick={() => onNavigate(p)}
            >
              {p === 'dashboard' ? (
                <><span className="md:hidden">Home</span><span className="hidden md:inline">Dashboard</span></>
              ) : (
                <><span className="md:hidden">Expenses</span><span className="hidden md:inline">All Expenses</span></>
              )}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button className={btnCls('primary', 'sm')} onClick={onAddExpense}>
            + Add
          </button>

          {/* Theme toggle */}
          <button
            className="w-[30px] h-[30px] flex items-center justify-center rounded-lg text-tx-muted hover:bg-surface-2 hover:text-tx-heading transition-colors border-0 cursor-pointer text-[16px] shrink-0"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Avatar — click to open dropdown with email + sign out */}
          <div className="relative" ref={menuRef}>
            <div
              className="w-[30px] h-[30px] rounded-full bg-accent text-white flex items-center justify-center text-[12px] font-bold shrink-0 cursor-pointer select-none"
              onClick={() => setMenuOpen((o) => !o)}
              title={user?.email}
            >
              {initial}
            </div>

            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] bg-surface border border-border rounded-xl shadow-lg overflow-hidden min-w-[190px] z-50">
                <div className="px-3 py-[10px] text-[12px] text-tx-muted border-b border-border truncate">
                  {user?.email}
                </div>
                <button
                  className="w-full px-3 py-[10px] text-left text-[13px] text-tx-heading hover:bg-surface-2 transition-colors cursor-pointer border-0 bg-transparent"
                  onClick={() => { setMenuOpen(false); logout(); }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
