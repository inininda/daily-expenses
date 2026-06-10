import { cn, btnCls } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';

export type Page = 'dashboard' | 'expenses';

interface HeaderProps {
  page: Page;
  onNavigate: (page: Page) => void;
  onAddExpense: () => void;
}

export function Header({ page, onNavigate, onAddExpense }: HeaderProps) {
  const { user, logout } = useAuth();
  const initial = (user?.email?.[0] ?? 'U').toUpperCase();

  return (
    <header className="sticky top-0 z-[100] bg-surface border-b border-border backdrop-blur-sm">
      <div className="max-w-[1080px] mx-auto px-3 sm:px-6 h-[58px] flex items-center gap-2 sm:gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-[15px] text-tx-heading whitespace-nowrap shrink-0">
          <div className="w-[30px] h-[30px] bg-accent rounded-lg flex items-center justify-center text-[15px]">
            💰
          </div>
          <span className="hidden sm:inline">Daily Expenses</span>
        </div>

        {/* Nav */}
        <nav className="flex gap-0.5">
          {(['dashboard', 'expenses'] as Page[]).map((p) => (
            <button
              key={p}
              className={cn(
                'px-2.5 sm:px-3.5 py-1.5 rounded-lg border-0 text-[13px] sm:text-[13.5px] font-medium cursor-pointer transition-colors whitespace-nowrap',
                page === p
                  ? 'bg-accent/10 text-accent'
                  : 'bg-transparent text-tx-muted hover:bg-surface-2 hover:text-tx-heading'
              )}
              onClick={() => onNavigate(p)}
            >
              {/* Shorter labels on mobile */}
              {p === 'dashboard' ? (
                <><span className="sm:hidden">Home</span><span className="hidden sm:inline">Dashboard</span></>
              ) : (
                <><span className="sm:hidden">Expenses</span><span className="hidden sm:inline">All Expenses</span></>
              )}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          <button className={btnCls('primary', 'sm')} onClick={onAddExpense}>
            + Add
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="hidden md:block text-[13px] text-tx-muted max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
              {user?.email}
            </span>
            <div
              className="w-[30px] h-[30px] rounded-full bg-accent text-white flex items-center justify-center text-[12px] font-bold shrink-0 cursor-pointer"
              title={user?.email}
            >
              {initial}
            </div>
          </div>

          {/* Sign out hidden on small screens — avatar shows the email via title */}
          <button className={cn(btnCls('ghost', 'sm'), 'hidden sm:inline-flex')} onClick={logout}>
            Sign out
          </button>
          {/* Icon-only sign out for mobile */}
          <button
            className="sm:hidden flex items-center justify-center w-[30px] h-[30px] rounded-lg text-tx-muted hover:bg-surface-2 hover:text-tx-heading transition-colors"
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
          >
            ↩
          </button>
        </div>

      </div>
    </header>
  );
}
