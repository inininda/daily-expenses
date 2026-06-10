import { apiRequest } from './client';
import type { Expense, ExpenseInput, ExpenseSummary, ExpenseListResponse, ExpenseFilters } from '../types';

export async function getExpenses(filters: ExpenseFilters = {}): Promise<ExpenseListResponse> {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.date_from) params.set('date_from', filters.date_from);
  if (filters.date_to) params.set('date_to', filters.date_to);
  if (filters.limit !== undefined) params.set('limit', String(filters.limit));
  if (filters.offset !== undefined) params.set('offset', String(filters.offset));
  if (filters.order_dir) params.set('order_dir', filters.order_dir);
  const qs = params.toString();
  return apiRequest<ExpenseListResponse>(`/expenses${qs ? `?${qs}` : ''}`);
}

export async function getExpenseSummary(
  options: { period?: string; date_from?: string; date_to?: string }
): Promise<ExpenseSummary> {
  const params = new URLSearchParams();
  if (options.period) params.set('period', options.period);
  if (options.date_from) params.set('date_from', options.date_from);
  if (options.date_to) params.set('date_to', options.date_to);
  return apiRequest<ExpenseSummary>(`/expenses/summary?${params.toString()}`);
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  return apiRequest<Expense>('/expenses', { method: 'POST', body: input });
}

export async function updateExpense(id: string, input: Partial<ExpenseInput>): Promise<Expense> {
  return apiRequest<Expense>(`/expenses/${id}`, { method: 'PUT', body: input });
}

export async function deleteExpense(id: string): Promise<void> {
  await apiRequest<null>(`/expenses/${id}`, { method: 'DELETE' });
}
