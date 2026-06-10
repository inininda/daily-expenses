import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Modal } from './components/Modal';
import { ExpenseForm } from './components/ExpenseForm';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import type { Page } from './components/Header';
import type { Expense } from './types';

function AppContent() {
  const { user, loading, setUser } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleAddExpense = () => {
    setEditExpense(null);
    setShowForm(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditExpense(expense);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <div className="w-[22px] h-[22px] border-[2.5px] border-border border-t-accent rounded-full animate-spinner" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSuccess={setUser} />;
  }

  return (
    <div className="min-h-svh flex flex-col bg-bg">
      <Header
        page={page}
        onNavigate={setPage}
        onAddExpense={handleAddExpense}
      />

      <main className="flex-1 w-full max-w-[1080px] mx-auto px-4 sm:px-6 pt-7 pb-20">
        {page === 'dashboard' ? (
          <DashboardPage
            key={`dash-${refreshKey}`}
            onEdit={handleEditExpense}
            onNavigateToExpenses={() => setPage('expenses')}
            refreshKey={refreshKey}
          />
        ) : (
          <ExpensesPage
            key={`exp-${refreshKey}`}
            onEdit={handleEditExpense}
            refreshKey={refreshKey}
          />
        )}
      </main>

      {showForm && (
        <Modal
          title={editExpense ? 'Edit Expense' : 'Add Expense'}
          onClose={() => setShowForm(false)}
        >
          <ExpenseForm
            expense={editExpense}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
