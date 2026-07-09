import React, { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import MainLayout from './components/MainLayout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ExpensesList from './components/ExpensesList';
import SuppliersList, { SupplierForm } from './components/SuppliersList';
import PaymentsList from './components/PaymentsList';
import ReportsPanel from './components/ReportsPanel';
import SettingsPanel from './components/SettingsPanel';
import SignaturesPage from './components/signatures/SignaturesPage';

import { useAuth } from './context/AuthContext';
import { useCollection, useDocState } from './hooks/useFirestore';
import { addItem, updateItem, deleteItem } from './services/firestore';
import { uploadFileTo } from './services/storage';
import { DEFAULT_BUDGET, DEFAULT_EXPENSE_CATEGORIES, canEdit } from './data/defaults';
import {
  INITIAL_BUDGET_SETTINGS,
  INITIAL_TAX_SETTINGS,
} from './data/initialData';
import {
  Category,
  Comment,
  Document as GrantDocument,
  Expense,
  ExpenseStatus,
  Notification,
  Payment,
  PayrollOrIndividualService,
  StatusHistory,
  Supplier,
  TaxSettings,
  User,
} from './types';

const nowIso = () => new Date().toISOString();

const normalizeStatus = (status?: string): ExpenseStatus => {
  const legacy: Record<string, ExpenseStatus> = {
    draft: ExpenseStatus.Draft,
    approved: ExpenseStatus.Approved,
    paid: ExpenseStatus.Paid,
    rejected: ExpenseStatus.Rejected,
  };
  if (!status) return ExpenseStatus.Draft;
  return legacy[status] || (Object.values(ExpenseStatus).includes(status as ExpenseStatus) ? (status as ExpenseStatus) : ExpenseStatus.Draft);
};

const normalizeExpense = (expense: Expense): Expense => ({
  ...expense,
  description: expense.description || expense.note || '',
  categoryId: expense.categoryId || expense.category || '',
  supplierId: expense.supplierId || expense.supplier || '',
  amountNoVat: Number(expense.amountNoVat ?? expense.amount ?? 0),
  vat: Number(expense.vat ?? 0),
  amountWithVat: Number(expense.amountWithVat ?? expense.amount ?? 0),
  responsiblePerson: expense.responsiblePerson || expense.createdByName || '',
  projectStage: expense.projectStage || '',
  status: normalizeStatus(expense.status as unknown as string),
  createdAt: expense.createdAt || nowIso(),
  createdBy: expense.createdBy || expense.createdByName || '',
  updatedAt: expense.updatedAt || expense.createdAt || nowIso(),
  updatedBy: expense.updatedBy || expense.createdByName || '',
});

const normalizePayment = (payment: Payment): Payment => ({
  ...payment,
  paymentDate: payment.paymentDate || payment.date || '',
  paymentMethod: payment.paymentMethod || payment.method || 'bank',
  payerAccount: payment.payerAccount || '',
  recipientName: payment.recipientName || '',
  purpose: payment.purpose || payment.note || '',
  fee: Number(payment.fee ?? 0),
  status: payment.status || 'approved',
  createdAt: payment.createdAt || nowIso(),
});

export default function App() {
  const { currentUser, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const expensesRaw = useCollection<Expense>('expenses');
  const categoriesRaw = useCollection<Category>('categories');
  const suppliersRaw = useCollection<Supplier>('suppliers');
  const paymentsRaw = useCollection<Payment>('payments');
  const documents = useCollection<GrantDocument>('documents');
  const comments = useCollection<Comment>('comments');
  const history = useCollection<StatusHistory>('statusHistory');
  const payrollList = useCollection<PayrollOrIndividualService>('payroll');
  const users = useCollection<User>('users');
  const [budgetDoc, saveBudget] = useDocState('settings', 'budget', {
    ...INITIAL_BUDGET_SETTINGS,
    initialBudget: DEFAULT_BUDGET,
  });
  const [taxSettings] = useDocState<TaxSettings>('settings', 'taxes', INITIAL_TAX_SETTINGS);

  const expenses = useMemo(
    () => expensesRaw.map(normalizeExpense),
    [expensesRaw],
  );
  const categories = useMemo(
    () => (categoriesRaw.length ? categoriesRaw : DEFAULT_EXPENSE_CATEGORIES),
    [categoriesRaw],
  );
  const suppliers = useMemo(
    () => suppliersRaw,
    [suppliersRaw],
  );
  const payments = useMemo(
    () => paymentsRaw.map(normalizePayment),
    [paymentsRaw],
  );

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
  const totalSpent = payments
    .filter((p) => p.status === 'approved')
    .reduce((s, p) => s + p.amount + (p.fee || 0), 0);
  const notifications: Notification[] = expenses
    .filter((e) => e.status === ExpenseStatus.DocumentsMissing || e.status === ExpenseStatus.NeedsCorrection)
    .map((e) => ({
      id: `notif-${e.id}`,
      type: e.status === ExpenseStatus.NeedsCorrection ? 'error' : 'warning',
      message: `${e.title}: ${e.status === ExpenseStatus.NeedsCorrection ? 'საჭიროა კორექცია' : 'აკლია დოკუმენტები'}`,
      isRead: false,
      createdAt: e.updatedAt || e.createdAt,
      expenseId: e.id,
    }));

  const fail = (e: unknown) => {
    console.error(e);
    const code = (e as { code?: string })?.code;
    if (code === 'permission-denied') {
      alert(
        'Firestore-ის წვდომა აკრძალულია.\n\nგამოაქვეყნეთ წესები Firebase Console-ში:\nFirestore → Rules → allow read, write: if true; → Publish',
      );
    } else {
      const msg = (e as { message?: string })?.message || 'უცნობი შეცდომა';
      alert('ოპერაცია ვერ შესრულდა: ' + msg);
    }
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) =>
    addItem('expenses', {
      ...expense,
      category: categories.find((c) => c.id === expense.categoryId)?.name || expense.categoryId,
      supplier: suppliers.find((s) => s.id === expense.supplierId)?.name || expense.supplierId,
      amount: expense.amountWithVat,
      date: expense.invoiceDate || nowIso().slice(0, 10),
      createdAt: nowIso(),
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      updatedAt: nowIso(),
      updatedBy: currentUser.id,
    }).catch(fail);

  const updateExpense = (expenseId: string, expense: Partial<Expense>) =>
    updateItem('expenses', expenseId, {
      ...expense,
      category: expense.categoryId
        ? categories.find((c) => c.id === expense.categoryId)?.name || expense.categoryId
        : expense.category,
      supplier: expense.supplierId
        ? suppliers.find((s) => s.id === expense.supplierId)?.name || expense.supplierId
        : expense.supplier,
      amount: expense.amountWithVat,
      date: expense.invoiceDate || nowIso().slice(0, 10),
      updatedAt: nowIso(),
      updatedBy: currentUser.id,
    }).catch(fail);

  const deleteExpense = (expenseId: string) => deleteItem('expenses', expenseId).catch(fail);

  const updateExpenseStatus = (expenseId: string, newStatus: ExpenseStatus, comment?: string) => {
    const expense = expenses.find((e) => e.id === expenseId);
    updateItem('expenses', expenseId, {
      status: newStatus,
      updatedAt: nowIso(),
      updatedBy: currentUser.id,
    }).catch(fail);
    if (expense) {
      addItem('statusHistory', {
        expenseId,
        fromStatus: expense.status,
        toStatus: newStatus,
        changedBy: currentUser.name,
        changeDate: nowIso(),
        comment: comment || '',
      }).catch(fail);
    }
  };

  const addComment = (expenseId: string, text: string) =>
    addItem('comments', {
      expenseId,
      userName: currentUser.name,
      userRole: role,
      text,
      createdAt: nowIso(),
    }).catch(fail);

  const addDocument = async (
    document: Omit<GrantDocument, 'id' | 'uploadDate' | 'uploadedBy' | 'version'>,
    file?: File | null,
  ) => {
    try {
      let fileUrl = document.fileUrl || '';
      if (file) {
        const safe = file.name.replace(/[^\w.\-]+/g, '_');
        fileUrl = await uploadFileTo(`documents/${document.expenseId}/${Date.now()}_${safe}`, file);
      }
      await addItem('documents', {
        ...document,
        fileUrl,
        uploadDate: nowIso(),
        uploadedBy: currentUser.name,
        version: 1,
      });
    } catch (e) {
      fail(e);
    }
  };
  const deleteDocument = (documentId: string) => deleteItem('documents', documentId).catch(fail);

  const addPayment = (payment: Omit<Payment, 'id' | 'createdAt'>) =>
    addItem('payments', {
      ...payment,
      date: payment.paymentDate,
      method: payment.paymentMethod,
      createdAt: nowIso(),
    }).catch(fail);

  const updatePayment = (paymentId: string, payment: Partial<Payment>) =>
    updateItem('payments', paymentId, {
      ...payment,
      date: payment.paymentDate,
      method: payment.paymentMethod,
    }).catch(fail);

  const deletePayment = (paymentId: string) => deleteItem('payments', paymentId).catch(fail);

  const addSupplier = (f: SupplierForm) =>
    addItem('suppliers', { ...f, createdAt: nowIso() }).catch(fail);
  const updateSupplier = (id: string, f: SupplierForm) => updateItem('suppliers', id, f).catch(fail);
  const deleteSupplier = (id: string) => deleteItem('suppliers', id).catch(fail);

  const addPayroll = (payroll: Omit<PayrollOrIndividualService, 'id' | 'createdAt'>) =>
    addItem('payroll', { ...payroll, createdAt: nowIso() }).catch(fail);
  const updatePayrollStatus = (id: string, updates: Partial<PayrollOrIndividualService>) =>
    updateItem('payroll', id, updates).catch(fail);

  const addCategory = (name: string, plannedBudget: number) =>
    addItem('categories', {
      name,
      plannedBudget,
      description: '',
      isAllowedGrant: true,
      comment: '',
      createdAt: nowIso(),
    }).catch(fail);
  const deleteCategory = (id: string) => deleteItem('categories', id).catch(fail);
  const updateBudget = (amount: number) =>
    saveBudget({ ...budgetDoc, initialBudget: amount }).catch(fail);

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
          documents={documents}
          tranches={[]}
          notifications={notifications}
          onNavigate={setActiveTab}
        />
      )}

      {activeTab === 'expenses' && (
        <ExpensesList
          expenses={expenses}
          categories={categories}
          suppliers={suppliers}
          tranches={[]}
          payments={payments}
          documents={documents}
          comments={comments}
          history={history}
          currentUserRole={role}
          currentUserName={currentUser.name}
          onAddExpense={addExpense}
          onUpdateExpense={updateExpense}
          onUpdateAudit={(id, comment) => updateItem('expenses', id, { auditComment: comment }).catch(fail)}
          onDeleteExpense={deleteExpense}
          onUpdateExpenseStatus={updateExpenseStatus}
          onAddComment={addComment}
          onAddDocument={addDocument}
          onDeleteDocument={deleteDocument}
          onAddPayment={addPayment}
        />
      )}

      {activeTab === 'suppliers' && (
        <SuppliersList
          suppliers={suppliers}
          expenses={expenses}
          canEdit={editable}
          onAdd={addSupplier}
          onUpdate={updateSupplier}
          onDelete={deleteSupplier}
        />
      )}

      {activeTab === 'payments' && (
        <PaymentsList
          payments={payments}
          expenses={expenses}
          canEdit={editable}
          onUpdate={updatePayment}
          onDelete={deletePayment}
        />
      )}

      {activeTab === 'signatures' && (
        <SignaturesPage currentUser={{ id: currentUser.id, name: currentUser.name }} />
      )}

      {activeTab === 'reports' && (
        <ReportsPanel
          expenses={expenses}
          categories={categories}
          suppliers={suppliers}
          payments={payments}
          documents={documents}
          payrollList={payrollList}
          tranches={[]}
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
