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
      <div className="max-w-[1080px] mx-auto px-6 h-[58px] flex items-center gap-5">

        <div className="flex items-center gap-2 font-bold text-[15px] text-tx-heading whitespace-nowrap">
          <div className="w-[30px] h-[30px] bg-accent rounded-lg flex items-center justify-center text-[15px]">
            💰
          </div>
          <span className="hidden sm:inline">Daily Expenses</span>
        </div>

        <nav className="flex gap-0.5">
          {(['dashboard', 'expenses'] as Page[]).map((p) => (
            <button
              key={p}
              className={cn(
                'px-3.5 py-1.5 rounded-lg border-0 text-[13.5px] font-medium cursor-pointer transition-colors',
                page === p
                  ? 'bg-accent/10 text-accent'
                  : 'bg-transparent text-tx-muted hover:bg-surface-2 hover:text-tx-heading'
              )}
              onClick={() => onNavigate(p)}
            >
              {p === 'dashboard' ? 'Dashboard' : 'All Expenses'}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <button className={btnCls('primary', 'sm')} onClick={onAddExpense}>
            + Add
          </button>
          <div className="flex items-center gap-2">
            <span className="hidden md:block text-[13px] text-tx-muted max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">
              {user?.email}
            </span>
            <div className="w-[30px] h-[30px] rounded-full bg-accent text-white flex items-center justify-center text-[12px] font-bold shrink-0">
              {initial}
            </div>
          </div>
          <button className={btnCls('ghost', 'sm')} onClick={logout}>
            Sign out
          </button>
        </div>

      </div>
    </header>
  );
}
