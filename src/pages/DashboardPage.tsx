import { useState, useEffect } from 'react';
import { getExpenses, getExpenseSummary, deleteExpense } from '../api/expenses';
import { getCategoryColor, getCategoryEmoji } from '../utils/categories';
import { formatAmount, formatDate, formatMonthYear } from '../utils/format';
import { btnCls, cn } from '../utils/cn';
import type { Expense, ExpenseSummary } from '../types';

interface DashboardPageProps {
  onEdit: (expense: Expense) => void;
  onNavigateToExpenses: () => void;
  refreshKey: number;
}

const PERIODS = [
  { value: 'day',        label: 'Today' },
  { value: 'month',      label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'year',       label: 'This Year' },
];

const Spinner = () => (
  <div className="flex items-center justify-center p-12">
    <div className="w-[22px] h-[22px] border-[2.5px] border-border border-t-accent rounded-full animate-spinner" />
  </div>
);

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
  const maxTotal = categories.length > 0 ? categories[0][1].total : 1;
  const days = summary
    ? Math.max(1, Math.ceil((new Date(summary.date_to).getTime() - new Date(summary.date_from).getTime()) / 86400000) + 1)
    : 1;
  const dailyAvg = summary ? summary.total_amount / days : 0;
  const periodLabel = summary ? (period === 'day' ? 'Today' : formatMonthYear(summary.date_from)) : '';

  const stats = [
    { label: 'Total Spent',    value: summary ? formatAmount(summary.total_amount) : '$0.00', sub: PERIODS.find(p => p.value === period)?.label ?? period },
    { label: 'Transactions',   value: String(summary?.count ?? 0),                            sub: 'expenses recorded' },
    { label: 'Daily Average',  value: formatAmount(dailyAvg),                                 sub: 'per day' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-tx-heading tracking-tight">Dashboard</h1>
          {summary && <p className="text-[13px] text-tx-muted mt-0.5">{periodLabel}</p>}
        </div>
        <div className="flex gap-[3px] bg-surface border border-border p-[3px] rounded-lg">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className={cn(
                'px-[13px] py-[5px] border-0 rounded text-[12.5px] font-medium cursor-pointer transition-colors whitespace-nowrap',
                period === p.value ? 'bg-accent/10 text-accent' : 'bg-transparent text-tx-muted hover:text-tx-heading'
              )}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="px-[15px] py-[11px] bg-danger-bg border border-danger/20 rounded-lg text-danger text-[13px] mb-4">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[14px] mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-xl p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.07em] text-tx-muted mb-2">{s.label}</div>
            {summaryLoading ? (
              <div className="h-8 bg-surface-2 rounded-lg w-3/5 animate-pulse-fade" />
            ) : (
              <>
                <div className="text-[26px] font-bold text-tx-heading tracking-tight leading-[1.1]">{s.value}</div>
                <div className="text-[12px] text-tx-muted mt-[5px]">{s.sub}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.07em] text-tx-muted mb-4">By Category</div>
          {summaryLoading ? <Spinner /> : categories.length === 0 ? (
            <div className="text-center py-6 text-tx-muted">
              <div className="text-[38px] mb-3">📊</div>
              <div className="text-[14px] font-semibold text-tx-heading mb-1">No data yet</div>
              <div className="text-[13px]">Add expenses to see breakdown</div>
            </div>
          ) : (
            <div className="flex flex-col gap-[14px]">
              {categories.map(([cat, { total, count }]) => (
                <div key={cat} className="flex flex-col gap-[5px]">
                  <div className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-[7px] font-medium text-tx-heading">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: getCategoryColor(cat) }} />
                      <span>{getCategoryEmoji(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-tx-heading">{formatAmount(total)}</span>
                      <span className="text-tx-muted text-[12px]"> · {count}</span>
                    </div>
                  </div>
                  <div className="h-[5px] bg-surface-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${(total / maxTotal) * 100}%`,
                      background: getCategoryColor(cat),
                      transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.07em] text-tx-muted">Recent Expenses</div>
            <button className={btnCls('ghost', 'sm')} onClick={onNavigateToExpenses}>View all →</button>
          </div>
          {recentLoading ? <Spinner /> : recent.length === 0 ? (
            <div className="text-center py-6 text-tx-muted">
              <div className="text-[38px] mb-3">🧾</div>
              <div className="text-[14px] font-semibold text-tx-heading mb-1">No expenses yet</div>
              <div className="text-[13px]">Add your first expense to get started</div>
            </div>
          ) : (
            <div className="flex flex-col">
              {recent.map((expense) => (
                <div key={expense.id} className="flex items-center gap-3 py-[11px] border-b border-border-light last:border-b-0 group">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[16px] shrink-0"
                    style={{ background: `${getCategoryColor(expense.category)}18` }}>
                    {getCategoryEmoji(expense.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-medium text-tx-heading whitespace-nowrap overflow-hidden text-ellipsis capitalize">
                      {expense.description || expense.category}
                    </div>
                    <div className="flex items-center gap-[5px] mt-0.5 text-[12px] text-tx-muted">
                      <span>{formatDate(expense.expense_date)}</span>
                      <span className="opacity-40">·</span>
                      <span className="inline-flex items-center px-[7px] py-0.5 rounded-full text-[11px] font-semibold capitalize"
                        style={{ background: `${getCategoryColor(expense.category)}18`, color: getCategoryColor(expense.category) }}>
                        {expense.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-[14px] font-semibold text-tx-heading whitespace-nowrap">
                    {formatAmount(expense.amount)}
                  </div>
                  <div className="flex gap-0.5 opacity-100 lg:opacity-0 transition-opacity lg:group-hover:opacity-100">
                    <button className={btnCls('ghost', 'icon')} onClick={() => onEdit(expense)} title="Edit">✏️</button>
                    <button className={btnCls('ghost', 'icon')} onClick={() => handleDelete(expense.id)}
                      disabled={deletingId === expense.id} title="Delete">🗑️</button>
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
