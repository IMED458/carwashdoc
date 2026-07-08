/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import MainLayout from './components/MainLayout';
import Dashboard from './components/Dashboard';
import ExpensesList from './components/ExpensesList';
import PayrollList from './components/PayrollList';
import SuppliersList from './components/SuppliersList';
import PaymentsList from './components/PaymentsList';
import TranchesList from './components/TranchesList';
import ReportsPanel from './components/ReportsPanel';
import SettingsPanel from './components/SettingsPanel';
import TechDocsPanel from './components/TechDocsPanel';

// Import initial dataset and types
import { 
  MOCK_USERS, 
  INITIAL_EXPENSES, 
  INITIAL_CATEGORIES, 
  INITIAL_SUPPLIERS, 
  INITIAL_PAYMENTS, 
  INITIAL_DOCUMENTS, 
  INITIAL_PAYROLL_SERVICES, 
  INITIAL_COMMENTS, 
  INITIAL_STATUS_HISTORY, 
  INITIAL_TRANCHES, 
  INITIAL_TAX_SETTINGS,
  INITIAL_NOTIFICATIONS
} from './data/initialData';
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
  UserRole,
  Notification
} from './types';

export default function App() {
  // Navigation active tab state
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Application Data states
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('admin');
  const [currentUserName, setCurrentUserName] = useState<string>('გიორგი იმედაშვილი');

  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCUMENTS);
  const [payrollList, setPayrollList] = useState<PayrollOrIndividualService[]>(INITIAL_PAYROLL_SERVICES);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [history, setHistory] = useState<StatusHistory[]>(INITIAL_STATUS_HISTORY);
  const [tranches, setTranches] = useState<Tranche[]>(INITIAL_TRANCHES);
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(INITIAL_TAX_SETTINGS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  // Math totals for MainLayout
  const totalBudget = 50000;
  const totalSpent = payments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  // Callback: Add Expense
  const handleAddExpense = (newExp: Omit<Expense, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    const generatedId = `exp-${expenses.length + 1}`;
    const timestamp = new Date().toISOString();
    
    const createdExpense: Expense = {
      ...newExp,
      id: generatedId,
      createdAt: timestamp,
      createdBy: 'u-1',
      updatedAt: timestamp,
      updatedBy: 'u-1'
    };

    setExpenses(prev => [createdExpense, ...prev]);

    // Log status history
    const statusLog: StatusHistory = {
      id: `h-${history.length + 1}`,
      expenseId: generatedId,
      fromStatus: ExpenseStatus.Draft,
      toStatus: newExp.status,
      changedBy: currentUserName,
      changeDate: timestamp,
      comment: 'ხარჯი შეიქმნა ახალი ჩანაწერით.'
    };
    setHistory(prev => [statusLog, ...prev]);
  };

  // Callback: Update Expense Status
  const handleUpdateExpenseStatus = (expenseId: string, newStatus: ExpenseStatus, commentText?: string) => {
    const timestamp = new Date().toISOString();
    
    setExpenses(prev => prev.map(exp => {
      if (exp.id === expenseId) {
        // Append history audit trail
        const historyItem: StatusHistory = {
          id: `h-${history.length + 1}`,
          expenseId,
          fromStatus: exp.status,
          toStatus: newStatus,
          changedBy: currentUserName,
          changeDate: timestamp,
          comment: commentText || undefined
        };
        setHistory(prevHist => [historyItem, ...prevHist]);

        // Append comment if written
        if (commentText) {
          const newComment: Comment = {
            id: `com-${comments.length + 1}`,
            expenseId,
            userName: currentUserName,
            userRole: currentUserRole,
            text: commentText,
            createdAt: timestamp
          };
          setComments(prevComments => [...prevComments, newComment]);
        }

        return {
          ...exp,
          status: newStatus,
          updatedAt: timestamp,
          updatedBy: 'u-1'
        };
      }
      return exp;
    }));
  };

  // Callback: Add Comment
  const handleAddComment = (expenseId: string, text: string) => {
    const timestamp = new Date().toISOString();
    const newComment: Comment = {
      id: `com-${comments.length + 1}`,
      expenseId,
      userName: currentUserName,
      userRole: currentUserRole,
      text,
      createdAt: timestamp
    };
    setComments(prev => [...prev, newComment]);
  };

  // Callback: Add Document
  const handleAddDocument = (newDoc: Omit<Document, 'id' | 'uploadDate' | 'uploadedBy' | 'version'>) => {
    const generatedId = `doc-${documents.length + 1}`;
    const timestamp = new Date().toISOString();

    const createdDoc: Document = {
      ...newDoc,
      id: generatedId,
      uploadDate: timestamp,
      uploadedBy: currentUserName,
      version: 1
    };

    setDocuments(prev => [...prev, createdDoc]);
  };

  // Callback: Add Payment
  const handleAddPayment = (newPay: Omit<Payment, 'id' | 'createdAt'>) => {
    const generatedId = `pay-${payments.length + 1}`;
    const timestamp = new Date().toISOString();

    const createdPayment: Payment = {
      ...newPay,
      id: generatedId,
      createdAt: timestamp
    };

    setPayments(prev => [...prev, createdPayment]);
  };

  // Callback: Add Supplier
  const handleAddSupplier = (newSup: Omit<Supplier, 'id' | 'createdAt'>) => {
    const generatedId = `sup-${suppliers.length + 1}`;
    const timestamp = new Date().toISOString();

    const createdSupplier: Supplier = {
      ...newSup,
      id: generatedId,
      createdAt: timestamp
    };

    setSuppliers(prev => [...prev, createdSupplier]);
  };

  // Callback: Add Tranche
  const handleAddTranche = (newTr: Omit<Tranche, 'id' | 'createdAt' | 'trancheNumber'>) => {
    const generatedId = `tr-${tranches.length + 1}`;
    const timestamp = new Date().toISOString();

    const createdTranche: Tranche = {
      ...newTr,
      id: generatedId,
      trancheNumber: tranches.length + 1,
      createdAt: timestamp
    };

    setTranches(prev => [...prev, createdTranche]);
  };

  // Callback: Update Payroll status
  const handleUpdatePayrollStatus = (id: string, updates: Partial<PayrollOrIndividualService>) => {
    setPayrollList(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...updates
        };
      }
      return item;
    }));
  };

  // Callback: Add Payroll Freelance contract
  const handleAddPayroll = (newPayr: Omit<PayrollOrIndividualService, 'id' | 'createdAt'>) => {
    const generatedId = `payr-${payrollList.length + 1}`;
    const timestamp = new Date().toISOString();

    const createdPayroll: PayrollOrIndividualService = {
      ...newPayr,
      id: generatedId,
      createdAt: timestamp
    };

    setPayrollList(prev => [...prev, createdPayroll]);
  };

  // Callback: Add Category
  const handleAddCategory = (newCat: Omit<Category, 'id'>) => {
    const generatedId = `cat-${categories.length + 1}`;
    const createdCat: Category = {
      ...newCat,
      id: generatedId,
      comment: 'ხელით დამატებული ბიუჯეტის კატეგორია',
      createdAt: new Date().toISOString()
    };
    setCategories(prev => [...prev, createdCat]);
  };

  // Handle active Switch roles in settings
  const handleUpdateRole = (role: UserRole) => {
    setCurrentUserRole(role);
    const matchedUser = MOCK_USERS.find(u => u.role === role);
    if (matchedUser) {
      setCurrentUserName(matchedUser.name);
    }
  };

  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentUserRole={currentUserRole}
      currentUserName={currentUserName}
      totalBudget={totalBudget}
      totalSpent={totalSpent}
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

      {activeTab === 'payments' && (
        <PaymentsList 
          payments={payments}
          expenses={expenses}
        />
      )}

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
          taxSettings={taxSettings}
          categories={categories}
          onUpdateRole={handleUpdateRole}
          onUpdateTaxSettings={setTaxSettings}
          onAddCategory={handleAddCategory}
        />
      )}

      {activeTab === 'docs' && (
        <TechDocsPanel />
      )}
    </MainLayout>
  );
}
