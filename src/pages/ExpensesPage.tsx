import { useState, useEffect, useCallback } from 'react';
import { getExpenses, deleteExpense } from '../api/expenses';
import { getCategoryColor, getCategoryEmoji, CATEGORY_LIST } from '../utils/categories';
import { formatAmount, formatDate } from '../utils/format';
import type { Expense } from '../types';

interface ExpensesPageProps {
  onEdit: (expense: Expense) => void;
  refreshKey: number;
}

const PAGE_SIZE = 20;

export function ExpensesPage({ onEdit, refreshKey }: ExpensesPageProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [filterCategory, setFilterCategory] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const fetch = useCallback(
    (off: number) => {
      setLoading(true);
      setError('');
      getExpenses({
        category: filterCategory || undefined,
        date_from: filterFrom || undefined,
        date_to: filterTo || undefined,
        limit: PAGE_SIZE,
        offset: off,
      })
        .then((res) => {
          setExpenses(res.expenses);
          setTotal(res.total);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    },
    [filterCategory, filterFrom, filterTo]
  );

  useEffect(() => {
    setOffset(0);
    fetch(0);
  }, [fetch, refreshKey]);

  const handlePage = (newOffset: number) => {
    setOffset(newOffset);
    fetch(newOffset);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    setDeletingId(id);
    try {
      await deleteExpense(id);
      fetch(offset);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setFilterCategory('');
    setFilterFrom('');
    setFilterTo('');
  };

  const hasFilters = filterCategory || filterFrom || filterTo;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const showingFrom = total === 0 ? 0 : offset + 1;
  const showingTo = Math.min(offset + PAGE_SIZE, total);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">All Expenses</h1>
          <p className="page-subtitle">{total} expense{total !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-item">
          <label className="filter-label">Category</label>
          <select
            className="filter-input"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {CATEGORY_LIST.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label className="filter-label">From</label>
          <input
            className="filter-input"
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label className="filter-label">To</label>
          <input
            className="filter-input"
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
          />
        </div>

        {hasFilters && (
          <div className="filter-item" style={{ alignSelf: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-message" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧾</div>
            <div className="empty-state-title">No expenses found</div>
            <div className="empty-state-desc">
              {hasFilters ? 'Try clearing your filters' : 'Add your first expense to get started'}
            </div>
          </div>
        ) : (
          <div className="expense-list expense-list-full">
            {expenses.map((expense) => (
              <div key={expense.id} className="expense-item expense-item-padded">
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

        {!loading && total > PAGE_SIZE && (
          <div className="pagination">
            <span className="pagination-info">
              Showing {showingFrom}–{showingTo} of {total}
            </span>
            <div className="pagination-controls">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handlePage(offset - PAGE_SIZE)}
                disabled={offset === 0}
              >
                ← Prev
              </button>
              <span className="pagination-page">
                {currentPage} / {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handlePage(offset + PAGE_SIZE)}
                disabled={offset + PAGE_SIZE >= total}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
