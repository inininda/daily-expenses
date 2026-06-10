export interface User {
  id: string;
  email: string;
  role?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description?: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInput {
  amount: number;
  category: string;
  description?: string;
  expense_date: string;
}

export interface ExpenseSummary {
  period: string;
  date_from: string;
  date_to: string;
  total_amount: number;
  count: number;
  by_category: Record<string, { total: number; count: number }>;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  total: number;
  limit: number;
  offset: number;
}

export interface ExpenseFilters {
  category?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
  order_dir?: 'asc' | 'desc';
}
