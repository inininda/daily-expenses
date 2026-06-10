import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  getExpenses,
  getExpenseSummary,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../api/expenses';
import { useAuth } from '../contexts/AuthContext';
import type { ExpenseFilters, ExpenseInput } from '../types';

const PAGE_SIZE = 1;

export const expenseKeys = {
  all: ['expenses'] as const,
  list: (filters: ExpenseFilters) => ['expenses', 'list', filters] as const,
  infinite: (filters: Omit<ExpenseFilters, 'offset' | 'limit'>) => ['expenses', 'infinite', filters] as const,
  summary: (period: string) => ['expenses', 'summary', period] as const,
  recent: () => ['expenses', 'recent'] as const,
};

export function useSummary(period: string) {
  return useQuery({
    queryKey: expenseKeys.summary(period),
    queryFn: () => getExpenseSummary({ period }),
  });
}

export function useRecentExpenses() {
  return useQuery({
    queryKey: expenseKeys.recent(),
    queryFn: () => getExpenses({ limit: 8 }).then((r) => r.expenses),
  });
}

export function useExpenseList(filters: ExpenseFilters) {
  return useQuery({
    queryKey: expenseKeys.list(filters),
    queryFn: () => getExpenses(filters),
  });
}

export function useInfiniteExpenses(filters: Omit<ExpenseFilters, 'offset' | 'limit'>) {
  return useInfiniteQuery({
    queryKey: expenseKeys.infinite(filters),
    queryFn: ({ pageParam }) =>
      getExpenses({ ...filters, limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const next = lastPage.offset + lastPage.limit;
      return next < lastPage.total ? next : undefined;
    },
  });
}

function useInvalidateExpenses() {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
    [queryClient]
  );
}

export function useCreateExpense() {
  const invalidate = useInvalidateExpenses();
  return useMutation({ mutationFn: createExpense, onSuccess: invalidate });
}

export function useUpdateExpense() {
  const invalidate = useInvalidateExpenses();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ExpenseInput> }) =>
      updateExpense(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteExpense() {
  const invalidate = useInvalidateExpenses();
  return useMutation({ mutationFn: deleteExpense, onSuccess: invalidate });
}

export function useLogout() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  return useCallback(async () => {
    queryClient.clear();
    await logout();
  }, [logout, queryClient]);
}
