import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { createExpense, updateExpense } from '../api/expenses';
import { CATEGORY_LIST } from '../utils/categories';
import { todayStr } from '../utils/format';
import type { Expense, ExpenseInput } from '../types';

interface ExpenseFormProps {
  expense?: Expense | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ExpenseForm({ expense, onSuccess, onCancel }: ExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [customCategory, setCustomCategory] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayStr());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!expense) return;
    setAmount(String(expense.amount));
    const isKnown = CATEGORY_LIST.includes(expense.category.toLowerCase());
    if (isKnown) {
      setCategory(expense.category.toLowerCase());
      setUseCustom(false);
    } else {
      setCustomCategory(expense.category);
      setUseCustom(true);
    }
    setDescription(expense.description ?? '');
    setDate(expense.expense_date);
  }, [expense]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    const finalCategory = useCustom ? customCategory.trim() : category;
    if (!finalCategory) {
      setError('Category is required');
      return;
    }

    const input: ExpenseInput = {
      amount: parsedAmount,
      category: finalCategory,
      description: description.trim() || undefined,
      expense_date: date,
    };

    setLoading(true);
    try {
      if (expense) {
        await updateExpense(expense.id, input);
      } else {
        await createExpense(input);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="ef-amount">Amount</label>
        <input
          id="ef-amount"
          className="form-input"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="ef-category">Category</label>
          <select
            id="ef-category"
            className="form-input"
            value={useCustom ? '_custom' : category}
            onChange={(e) => {
              if (e.target.value === '_custom') {
                setUseCustom(true);
              } else {
                setUseCustom(false);
                setCategory(e.target.value);
              }
            }}
          >
            {CATEGORY_LIST.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
            <option value="_custom">Custom...</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="ef-date">Date</label>
          <input
            id="ef-date"
            className="form-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      {useCustom && (
        <div className="form-group">
          <label className="form-label" htmlFor="ef-custom">Custom Category</label>
          <input
            id="ef-custom"
            className="form-input"
            type="text"
            placeholder="e.g. gym, coffee, gifts..."
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            required
          />
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="ef-desc">
          Description <span className="form-optional">(optional)</span>
        </label>
        <input
          id="ef-desc"
          className="form-input"
          type="text"
          placeholder="What was this for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : expense ? 'Update Expense' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}
