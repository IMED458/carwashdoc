/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import MainLayout from './components/MainLayout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ExpensesList from './components/ExpensesList';
import PayrollList from './components/PayrollList';
import SuppliersList from './components/SuppliersList';
import PaymentsList from './components/PaymentsList';
import TranchesList from './components/TranchesList';
import ReportsPanel from './components/ReportsPanel';
import SettingsPanel from './components/SettingsPanel';
import TechDocsPanel from './components/TechDocsPanel';

import { useAuth } from './context/AuthContext';
import { useCollection, useDocState } from './hooks/useFirestore';
import { addItem, updateItem } from './services/firestore';
import { DEFAULT_TAX_SETTINGS, DEFAULT_BUDGET } from './data/defaults';
import {
  Expense,
  ExpenseStatus,
  Category,
  Supplier,
  Payment,
  Document,
  PayrollOrIndividualService,
  Comment,
  StatusHistory,
  Tranche,
  TaxSettings,
  Notification,
  User,
} from './types';

export default function App() {
  const { currentUser, loading, error, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Firestore realtime კოლექციები
  const expenses = useCollection<Expense>('expenses');
  const categories = useCollection<Category>('categories');
  const suppliers = useCollection<Supplier>('suppliers');
  const payments = useCollection<Payment>('payments');
  const documents = useCollection<Document>('documents');
  const payrollList = useCollection<PayrollOrIndividualService>('payroll');
  const comments = useCollection<Comment>('comments');
  const history = useCollection<StatusHistory>('history');
  const tranches = useCollection<Tranche>('tranches');
  const notifications = useCollection<Notification>('notifications');
  const users = useCollection<User>('users');
  const [taxSettings, saveTaxSettings] = useDocState<TaxSettings>(
    'settings',
    'tax',
    DEFAULT_TAX_SETTINGS,
  );
  const [budgetDoc] = useDocState<{ initialBudget: number }>('settings', 'budget', {
    initialBudget: DEFAULT_BUDGET,
  });

  // ავტორიზაციის მდგომარეობა
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3 font-sans">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="text-xs text-slate-400 font-semibold">იტვირთება...</span>
        {error && <span className="text-xs text-red-500 font-semibold">{error}</span>}
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  const currentUserRole = currentUser.role;
  const currentUserName = currentUser.name;
  const currentUserId = currentUser.id;

  const totalBudget = budgetDoc.initialBudget || DEFAULT_BUDGET;
  const totalSpent = payments
    .filter((p) => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  const fail = (e: unknown) => {
    console.error(e);
    alert('ოპერაცია ვერ შესრულდა. სცადეთ თავიდან.');
  };

  // ხარჯის დამატება
  const handleAddExpense = (
    newExp: Omit<Expense, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>,
  ) => {
    const timestamp = new Date().toISOString();
    addItem('expenses', {
      ...newExp,
      createdAt: timestamp,
      createdBy: currentUserId,
      updatedAt: timestamp,
      updatedBy: currentUserId,
    })
      .then((newId) =>
        addItem('history', {
          expenseId: newId,
          fromStatus: ExpenseStatus.Draft,
          toStatus: newExp.status,
          changedBy: currentUserName,
          changeDate: timestamp,
          comment: 'ხარჯი შეიქმნა ახალი ჩანაწერით.',
        }),
      )
      .catch(fail);
  };

  // ხარჯის სტატუსის განახლება
  const handleUpdateExpenseStatus = (
    expenseId: string,
    newStatus: ExpenseStatus,
    commentText?: string,
  ) => {
    const timestamp = new Date().toISOString();
    const exp = expenses.find((e) => e.id === expenseId);
    if (!exp) return;

    updateItem('expenses', expenseId, {
      status: newStatus,
      updatedAt: timestamp,
      updatedBy: currentUserId,
    }).catch(fail);

    addItem('history', {
      expenseId,
      fromStatus: exp.status,
      toStatus: newStatus,
      changedBy: currentUserName,
      changeDate: timestamp,
      comment: commentText || '',
    }).catch(fail);

    if (commentText) {
      addItem('comments', {
        expenseId,
        userName: currentUserName,
        userRole: currentUserRole,
        text: commentText,
        createdAt: timestamp,
      }).catch(fail);
    }
  };

  // კომენტარის დამატება
  const handleAddComment = (expenseId: string, text: string) => {
    addItem('comments', {
      expenseId,
      userName: currentUserName,
      userRole: currentUserRole,
      text,
      createdAt: new Date().toISOString(),
    }).catch(fail);
  };

  // დოკუმენტის დამატება
  const handleAddDocument = (
    newDoc: Omit<Document, 'id' | 'uploadDate' | 'uploadedBy' | 'version'>,
  ) => {
    addItem('documents', {
      ...newDoc,
      uploadDate: new Date().toISOString(),
      uploadedBy: currentUserName,
      version: 1,
    }).catch(fail);
  };

  // გადახდის დამატება
  const handleAddPayment = (newPay: Omit<Payment, 'id' | 'createdAt'>) => {
    addItem('payments', {
      ...newPay,
      createdAt: new Date().toISOString(),
    }).catch(fail);
  };

  // მიმწოდებლის დამატება
  const handleAddSupplier = (newSup: Omit<Supplier, 'id' | 'createdAt'>) => {
    addItem('suppliers', {
      ...newSup,
      createdAt: new Date().toISOString(),
    }).catch(fail);
  };

  // ტრანშის დამატება
  const handleAddTranche = (
    newTr: Omit<Tranche, 'id' | 'createdAt' | 'trancheNumber'>,
  ) => {
    addItem('tranches', {
      ...newTr,
      trancheNumber: tranches.length + 1,
      createdAt: new Date().toISOString(),
    }).catch(fail);
  };

  // ხელფასის/ფიზ.პირის სტატუსის განახლება
  const handleUpdatePayrollStatus = (
    id: string,
    updates: Partial<PayrollOrIndividualService>,
  ) => {
    updateItem('payroll', id, updates as object).catch(fail);
  };

  // ხელფასის/ფიზ.პირის დამატება
  const handleAddPayroll = (
    newPayr: Omit<PayrollOrIndividualService, 'id' | 'createdAt'>,
  ) => {
    addItem('payroll', {
      ...newPayr,
      createdAt: new Date().toISOString(),
    }).catch(fail);
  };

  // ბიუჯეტის კატეგორიის დამატება
  const handleAddCategory = (newCat: Omit<Category, 'id'>) => {
    addItem('categories', {
      ...newCat,
      comment: 'ხელით დამატებული ბიუჯეტის კატეგორია',
      createdAt: new Date().toISOString(),
    }).catch(fail);
  };

  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentUserRole={currentUserRole}
      currentUserName={currentUserName}
      totalBudget={totalBudget}
      totalSpent={totalSpent}
      onLogout={logout}
    >
      {activeTab === 'dashboard' && (
        <Dashboard
          expenses={expenses}
          categories={categories}
          payments={payments}
          tranches={tranches}
          notifications={notifications}
          onNavigate={setActiveTab}
        />
      )}

      {activeTab === 'expenses' && (
        <ExpensesList
          expenses={expenses}
          categories={categories}
          suppliers={suppliers}
          tranches={tranches}
          payments={payments}
          documents={documents}
          comments={comments}
          history={history}
          currentUserRole={currentUserRole}
          currentUserName={currentUserName}
          onAddExpense={handleAddExpense}
          onUpdateExpenseStatus={handleUpdateExpenseStatus}
          onAddComment={handleAddComment}
          onAddDocument={handleAddDocument}
          onAddPayment={handleAddPayment}
        />
      )}

      {activeTab === 'payroll' && (
        <PayrollList
          payrollList={payrollList}
          taxSettings={taxSettings}
          currentUserRole={currentUserRole}
          onAddPayroll={handleAddPayroll}
          onUpdatePayrollStatus={handleUpdatePayrollStatus}
        />
      )}

      {activeTab === 'suppliers' && (
        <SuppliersList
          suppliers={suppliers}
          expenses={expenses}
          currentUserRole={currentUserRole}
          onAddSupplier={handleAddSupplier}
        />
      )}

      {activeTab === 'payments' && <PaymentsList payments={payments} expenses={expenses} />}

      {activeTab === 'tranches' && (
        <TranchesList
          tranches={tranches}
          currentUserRole={currentUserRole}
          onAddTranche={handleAddTranche}
        />
      )}

      {activeTab === 'reports' && (
        <ReportsPanel
          expenses={expenses}
          categories={categories}
          suppliers={suppliers}
          payments={payments}
          documents={documents}
          payrollList={payrollList}
          tranches={tranches}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsPanel
          currentUserRole={currentUserRole}
          currentUserName={currentUserName}
          currentUserId={currentUserId}
          users={users}
          taxSettings={taxSettings}
          categories={categories}
          onUpdateTaxSettings={saveTaxSettings}
          onAddCategory={handleAddCategory}
        />
      )}

      {activeTab === 'docs' && <TechDocsPanel />}
    </MainLayout>
  );
}
