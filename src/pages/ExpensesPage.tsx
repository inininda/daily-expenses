import { useState, useEffect } from 'react';
import { getCategoryColor, getCategoryEmoji, CATEGORY_LIST } from '../utils/categories';
import { formatAmount, formatDate } from '../utils/format';
import { btnCls, cn } from '../utils/cn';
import { useInfiniteExpenses, useDeleteExpense } from '../hooks/useExpenses';
import { ConfirmModal } from '../components/ConfirmModal';
import type { Expense } from '../types';

interface ExpensesPageProps {
  onEdit: (expense: Expense) => void;
}

const FILTER_INPUT =
  'px-[11px] py-2 border border-border rounded-lg bg-surface text-tx-heading text-[13px] outline-none transition-[border-color] duration-150 focus:border-accent font-[inherit]';

const Spinner = () => (
  <div className="flex items-center justify-center p-12">
    <div className="w-[22px] h-[22px] border-[2.5px] border-border border-t-accent rounded-full animate-spinner" />
  </div>
);

export function ExpensesPage({ onEdit }: ExpensesPageProps) {
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setCurrentPage(0);
  }, [filterCategory, filterFrom, filterTo]);

  const filters = {
    category: filterCategory || undefined,
    date_from: filterFrom || undefined,
    date_to: filterTo || undefined,
  };

  const { data, isLoading, isFetching, fetchNextPage, hasNextPage, error } =
    useInfiniteExpenses(filters);

  const deleteMutation = useDeleteExpense();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const pageLimit = data?.pages[0]?.limit ?? 20;
  const expenses = data?.pages[currentPage]?.expenses ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const totalPages = Math.ceil(total / pageLimit);
  const showingFrom = total === 0 ? 0 : currentPage * pageLimit + 1;
  const showingTo = Math.min((currentPage + 1) * pageLimit, total);
  const hasFilters = filterCategory || filterFrom || filterTo;

  // True while fetching a page we haven't loaded yet
  const isLoadingPage = isLoading || (data?.pages[currentPage] === undefined && isFetching);

  const handleNext = () => {
    if (currentPage >= (data?.pages.length ?? 0) - 1 && hasNextPage) {
      fetchNextPage();
    }
    setCurrentPage((p) => p + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setCurrentPage((p) => p - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => setConfirmId(id);

  const errorMsg =
    (error as Error)?.message ||
    (deleteMutation.error as Error)?.message ||
    '';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-tx-heading tracking-tight">All Expenses</h1>
          <p className="text-[13px] text-tx-muted mt-0.5">{total} expense{total !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-end gap-2 sm:gap-3 mb-5 flex-wrap">
        {[
          { label: 'Category', content: (
            <select className={cn(FILTER_INPUT, 'pr-2')} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All categories</option>
              {CATEGORY_LIST.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          )},
          { label: 'From', content: (
            <input className={FILTER_INPUT} type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
          )},
          { label: 'To', content: (
            <input className={FILTER_INPUT} type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
          )},
        ].map(({ label, content }) => (
          <div key={label} className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-tx-muted">{label}</label>
            {content}
          </div>
        ))}
        {hasFilters && (
          <button className={btnCls('ghost', 'sm')} onClick={() => { setFilterCategory(''); setFilterFrom(''); setFilterTo(''); }}>
            Clear filters
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="px-[15px] py-[11px] bg-danger-bg border border-danger/20 rounded-lg text-danger text-[13px] mb-4">
          {errorMsg}
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl">
        {isLoadingPage ? <Spinner /> : expenses.length === 0 ? (
          <div className="text-center py-12 px-6 text-tx-muted">
            <div className="text-[38px] mb-3">🧾</div>
            <div className="text-[14px] font-semibold text-tx-heading mb-[5px]">No expenses found</div>
            <div className="text-[13px]">{hasFilters ? 'Try clearing your filters' : 'Add your first expense to get started'}</div>
          </div>
        ) : (
          <div className="flex flex-col">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center gap-3 px-5 py-[11px] border-b border-border-light last:border-b-0 group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[16px] shrink-0"
                  style={{ background: `${getCategoryColor(expense.category)}18` }}>
                  {getCategoryEmoji(expense.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-tx-heading capitalize">
                    {expense.description || expense.category}
                  </div>
                  <div className="flex items-center gap-[5px] mt-0.5 text-[12px] text-tx-muted">
                    <span className="whitespace-nowrap">{formatDate(expense.expense_date)}</span>
                    <span className="opacity-40">·</span>
                    <span className="inline-flex items-center px-[7px] py-0.5 rounded-full text-[11px] font-semibold capitalize"
                      style={{ background: `${getCategoryColor(expense.category)}18`, color: getCategoryColor(expense.category) }}>
                      {expense.category}
                    </span>
                  </div>
                </div>
                <div className="text-[14px] font-semibold text-tx-heading whitespace-nowrap">{formatAmount(expense.amount)}</div>
                <div className="flex gap-0.5 opacity-100 lg:opacity-0 transition-opacity lg:group-hover:opacity-100">
                  <button className={btnCls('ghost', 'icon')} onClick={() => onEdit(expense)} title="Edit">✏️</button>
                  <button
                    className={btnCls('ghost', 'icon')}
                    onClick={() => handleDelete(expense.id)}
                    disabled={deleteMutation.isPending && deleteMutation.variables === expense.id}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoadingPage && total > pageLimit && (
          <div className="flex items-center justify-between px-5 py-[14px] border-t border-border-light">
            <span className="text-[13px] text-tx-muted">Showing {showingFrom}–{showingTo} of {total}</span>
            <div className="flex items-center gap-2">
              <button className={btnCls('secondary', 'sm')} onClick={handlePrev} disabled={currentPage === 0}>← Prev</button>
              <span className="text-[13px] text-tx-muted">{currentPage + 1} / {totalPages}</span>
              <button className={btnCls('secondary', 'sm')} onClick={handleNext} disabled={currentPage + 1 >= totalPages}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {confirmId && (
        <ConfirmModal
          title="Delete expense?"
          description="This action cannot be undone."
          onConfirm={() => { deleteMutation.mutate(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
