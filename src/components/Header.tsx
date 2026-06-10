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
    <header className="header">
      <div className="header-inner">
        <div className="header-logo">
          <div className="header-logo-icon">💰</div>
          <span>Daily Expenses</span>
        </div>

        <nav className="header-nav">
          <button
            className={`header-nav-btn${page === 'dashboard' ? ' active' : ''}`}
            onClick={() => onNavigate('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`header-nav-btn${page === 'expenses' ? ' active' : ''}`}
            onClick={() => onNavigate('expenses')}
          >
            All Expenses
          </button>
        </nav>

        <div className="header-actions">
          <button className="btn btn-primary btn-sm" onClick={onAddExpense}>
            + Add
          </button>
          <div className="header-user">
            <span className="header-email">{user?.email}</span>
            <div className="avatar">{initial}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout} title="Sign out">
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
