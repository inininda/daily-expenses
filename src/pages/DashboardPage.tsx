import { useState, useEffect } from 'react';
import { getExpenses, getExpenseSummary, deleteExpense } from '../api/expenses';
import { getCategoryColor, getCategoryEmoji } from '../utils/categories';
import { formatAmount, formatDate, formatMonthYear } from '../utils/format';
import type { Expense, ExpenseSummary } from '../types';

interface DashboardPageProps {
  onEdit: (expense: Expense) => void;
  onNavigateToExpenses: () => void;
  refreshKey: number;
}

const PERIODS = [
  { value: 'day', label: 'Today' },
  { value: 'month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'year', label: 'This Year' },
];

export function DashboardPage({ onEdit, onNavigateToExpenses, refreshKey }: DashboardPageProps) {
  const [period, setPeriod] = useState('month');
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [recent, setRecent] = useState<Expense[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setSummaryLoading(true);
    setError('');
    getExpenseSummary({ period })
      .then(setSummary)
      .catch((e) => setError(e.message))
      .finally(() => setSummaryLoading(false));
  }, [period, refreshKey]);

  useEffect(() => {
    setRecentLoading(true);
    getExpenses({ limit: 8 })
      .then((res) => setRecent(res.expenses))
      .catch((e) => setError(e.message))
      .finally(() => setRecentLoading(false));
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    setDeletingId(id);
    try {
      await deleteExpense(id);
      setRecent((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const categories = summary
    ? Object.entries(summary.by_category).sort((a, b) => b[1].total - a[1].total)
    : [];

  const maxCategoryTotal = categories.length > 0 ? categories[0][1].total : 1;

  const daysInPeriod = summary
    ? Math.max(1, Math.ceil(
        (new Date(summary.date_to).getTime() - new Date(summary.date_from).getTime()) /
          86400000
      ) + 1)
    : 1;

  const dailyAvg = summary ? summary.total_amount / daysInPeriod : 0;

  const periodLabel = summary
    ? period === 'day'
      ? 'Today'
      : `${formatMonthYear(summary.date_from)}${period === 'year' || period === 'last_year' ? '' : ''}`
    : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          {summary && <p className="page-subtitle">{periodLabel}</p>}
        </div>
        <div className="period-tabs">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className={`period-tab${period === p.value ? ' active' : ''}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="error-message" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Spent</div>
          {summaryLoading ? (
            <div className="stat-skeleton" />
          ) : (
            <>
              <div className="stat-value">
                {summary ? formatAmount(summary.total_amount) : '$0.00'}
              </div>
              <div className="stat-sub">
                {PERIODS.find((p) => p.value === period)?.label ?? period}
              </div>
            </>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-label">Transactions</div>
          {summaryLoading ? (
            <div className="stat-skeleton" />
          ) : (
            <>
              <div className="stat-value">{summary?.count ?? 0}</div>
              <div className="stat-sub">expenses recorded</div>
            </>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-label">Daily Average</div>
          {summaryLoading ? (
            <div className="stat-skeleton" />
          ) : (
            <>
              <div className="stat-value">{formatAmount(dailyAvg)}</div>
              <div className="stat-sub">per day</div>
            </>
          )}
        </div>
      </div>

      {/* Bottom grid */}
      <div className="dashboard-grid">
        {/* Category Breakdown */}
        <div className="card">
          <div className="card-title">By Category</div>
          {summaryLoading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : categories.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-title">No data yet</div>
              <div className="empty-state-desc">Add expenses to see breakdown</div>
            </div>
          ) : (
            <div className="category-bars">
              {categories.map(([cat, { total, count }]) => (
                <div key={cat} className="category-bar-item">
                  <div className="category-bar-header">
                    <div className="category-bar-name">
                      <span
                        className="category-dot"
                        style={{ background: getCategoryColor(cat) }}
                      />
                      <span>
                        {getCategoryEmoji(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </span>
                    </div>
                    <div>
                      <span className="category-bar-amount">{formatAmount(total)}</span>
                      <span className="category-bar-count"> · {count}</span>
                    </div>
                  </div>
                  <div className="category-bar-track">
                    <div
                      className="category-bar-fill"
                      style={{
                        width: `${(total / maxCategoryTotal) * 100}%`,
                        background: getCategoryColor(cat),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <div className="card-header-row">
            <div className="card-title">Recent Expenses</div>
            <button className="btn btn-ghost btn-sm" onClick={onNavigateToExpenses}>
              View all →
            </button>
          </div>

          {recentLoading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : recent.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-state-icon">🧾</div>
              <div className="empty-state-title">No expenses yet</div>
              <div className="empty-state-desc">Add your first expense to get started</div>
            </div>
          ) : (
            <div className="expense-list">
              {recent.map((expense) => (
                <div key={expense.id} className="expense-item">
                  <div
                    className="expense-icon"
                    style={{ background: `${getCategoryColor(expense.category)}18` }}
                  >
                    {getCategoryEmoji(expense.category)}
                  </div>
                  <div className="expense-info">
                    <div className="expense-desc">
                      {expense.description || expense.category}
                    </div>
                    <div className="expense-meta">
                      <span>{formatDate(expense.expense_date)}</span>
                      <span className="meta-dot">·</span>
                      <span
                        className="cat-badge"
                        style={{
                          background: `${getCategoryColor(expense.category)}18`,
                          color: getCategoryColor(expense.category),
                        }}
                      >
                        {expense.category}
                      </span>
                    </div>
                  </div>
                  <div className="expense-amount">{formatAmount(expense.amount)}</div>
                  <div className="expense-actions">
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => onEdit(expense)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => handleDelete(expense.id)}
                      disabled={deletingId === expense.id}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
