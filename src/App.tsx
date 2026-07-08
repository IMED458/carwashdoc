import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import MainLayout from './components/MainLayout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ExpensesList, { ExpenseForm } from './components/ExpensesList';
import SuppliersList, { SupplierForm } from './components/SuppliersList';
import PaymentsList, { PaymentForm } from './components/PaymentsList';
import SettingsPanel from './components/SettingsPanel';

import { useAuth } from './context/AuthContext';
import { useCollection, useDocState } from './hooks/useFirestore';
import { addItem, updateItem, deleteItem } from './services/firestore';
import { DEFAULT_BUDGET, canEdit } from './data/defaults';
import { Expense, Category, Supplier, Payment, User } from './types';

export default function App() {
  const { currentUser, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const expenses = useCollection<Expense>('expenses');
  const categories = useCollection<Category>('categories');
  const suppliers = useCollection<Supplier>('suppliers');
  const payments = useCollection<Payment>('payments');
  const users = useCollection<User>('users');
  const [budgetDoc, saveBudget] = useDocState<{ initialBudget: number }>('settings', 'budget', {
    initialBudget: DEFAULT_BUDGET,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3 font-sans">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="text-xs text-slate-400 font-semibold">იტვირთება...</span>
      </div>
    );
  }

  if (!currentUser) return <Login />;

  const role = currentUser.role;
  const editable = canEdit(role);
  const totalBudget = budgetDoc.initialBudget || DEFAULT_BUDGET;
  const totalSpent = payments.reduce((s, p) => s + p.amount, 0);

  const fail = (e: unknown) => {
    console.error(e);
    alert('ოპერაცია ვერ შესრულდა. შეამოწმეთ ინტერნეტი და სცადეთ თავიდან.');
  };

  // ხარჯები
  const addExpense = (f: ExpenseForm) =>
    addItem('expenses', { ...f, createdByName: currentUser.name, createdAt: new Date().toISOString() }).catch(fail);
  const updateExpense = (id: string, f: ExpenseForm) => updateItem('expenses', id, { ...f }).catch(fail);
  const deleteExpense = (id: string) => deleteItem('expenses', id).catch(fail);

  // მიმწოდებლები
  const addSupplier = (f: SupplierForm) =>
    addItem('suppliers', { ...f, createdAt: new Date().toISOString() }).catch(fail);
  const deleteSupplier = (id: string) => deleteItem('suppliers', id).catch(fail);

  // გადახდები
  const addPayment = (f: PaymentForm) =>
    addItem('payments', { ...f, createdAt: new Date().toISOString() }).catch(fail);
  const deletePayment = (id: string) => deleteItem('payments', id).catch(fail);

  // კატეგორიები & ბიუჯეტი
  const addCategory = (name: string, plannedBudget: number) =>
    addItem('categories', { name, plannedBudget, createdAt: new Date().toISOString() }).catch(fail);
  const deleteCategory = (id: string) => deleteItem('categories', id).catch(fail);
  const updateBudget = (amount: number) => saveBudget({ initialBudget: amount }).catch(fail);

  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentUserRole={role}
      currentUserName={currentUser.name}
      totalBudget={totalBudget}
      totalSpent={totalSpent}
      onLogout={logout}
    >
      {activeTab === 'dashboard' && (
        <Dashboard
          expenses={expenses}
          categories={categories}
          payments={payments}
          totalBudget={totalBudget}
          onNavigate={setActiveTab}
        />
      )}

      {activeTab === 'expenses' && (
        <ExpensesList
          expenses={expenses}
          categories={categories}
          suppliers={suppliers}
          canEdit={editable}
          onAdd={addExpense}
          onUpdate={updateExpense}
          onDelete={deleteExpense}
        />
      )}

      {activeTab === 'suppliers' && (
        <SuppliersList
          suppliers={suppliers}
          canEdit={editable}
          onAdd={addSupplier}
          onDelete={deleteSupplier}
        />
      )}

      {activeTab === 'payments' && (
        <PaymentsList
          payments={payments}
          expenses={expenses}
          canEdit={editable}
          onAdd={addPayment}
          onDelete={deletePayment}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsPanel
          currentUserRole={role}
          currentUserId={currentUser.id}
          users={users}
          categories={categories}
          totalBudget={totalBudget}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
          onUpdateBudget={updateBudget}
        />
      )}
    </MainLayout>
  );
}
