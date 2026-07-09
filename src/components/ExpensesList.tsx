/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  X, 
  Folder, 
  Building2, 
  User as UserIcon, 
  Calendar,
  Layers,
  History,
  MessageSquare,
  Upload,
  Coins,
  ArrowRight,
  Sparkles,
  Download,
  ShieldAlert,
  Pencil,
  Trash2
} from 'lucide-react';
import { 
  Expense, 
  ExpenseStatus, 
  Category, 
  Supplier, 
  Tranche, 
  Payment, 
  Document, 
  Comment, 
  StatusHistory, 
  UserRole,
  AuditLog
} from '../types';
import { STATUS_LABELS } from '../data/defaults';

interface ExpensesListProps {
  expenses: Expense[];
  categories: Category[];
  suppliers: Supplier[];
  tranches: Tranche[];
  payments: Payment[];
  documents: Document[];
  comments: Comment[];
  history: StatusHistory[];
  currentUserRole: UserRole;
  currentUserName: string;
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => void;
  onUpdateExpense: (expenseId: string, expense: Partial<Expense>) => void;
  onDeleteExpense: (expenseId: string) => void;
  onUpdateExpenseStatus: (expenseId: string, newStatus: ExpenseStatus, comment?: string) => void;
  onAddComment: (expenseId: string, text: string) => void;
  onAddDocument: (document: Omit<Document, 'id' | 'uploadDate' | 'uploadedBy' | 'version'>, file?: File | null) => void;
  onDeleteDocument: (documentId: string) => void;
  onAddPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => void;
}

export default function ExpensesList({
  expenses,
  categories,
  suppliers,
  tranches,
  payments,
  documents,
  comments,
  history,
  currentUserRole,
  currentUserName,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onUpdateExpenseStatus,
  onAddComment,
  onAddDocument,
  onDeleteDocument,
  onAddPayment
}: ExpensesListProps) {
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDocCompleteness, setSelectedDocCompleteness] = useState('all');
  
  // Modals States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'documents' | 'payments' | 'comments' | 'history'>('details');

  // New Expense Form States
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryManual, setNewCategoryManual] = useState('');
  const [newSupplier, setNewSupplier] = useState('');
  const [newSupplierManual, setNewSupplierManual] = useState('');
  const [newTranche, setNewTranche] = useState('');
  const [newInvoiceNumber, setNewInvoiceNumber] = useState('');
  const [newInvoiceDate, setNewInvoiceDate] = useState('');
  const [newAmountNoVat, setNewAmountNoVat] = useState<number>(0);
  const [newVat, setNewVat] = useState<number>(0);
  const [newAmountWithVat, setNewAmountWithVat] = useState<number>(0);
  const [newResponsible, setNewResponsible] = useState(currentUserName);
  const [newStage, setNewStage] = useState('ეტაპი 1 - მოწყობა');
  const [newInternalComment, setNewInternalComment] = useState('');
  const [hasVat, setHasVat] = useState(true);

  const canModify = currentUserRole !== 'viewer';
  const isManualCategory = newCategory === '__manual__' || categories.find(c => c.id === newCategory)?.name === 'სხვა';

  // New Document upload Form States
  const [docType, setDocType] = useState<'invoice' | 'waybill' | 'tax_doc' | 'contract' | 'acceptance_act' | 'receipt' | 'other'>('invoice');
  const [docNumber, setDocNumber] = useState('');
  const [docDate, setDocDate] = useState('');
  const [docFileName, setDocFileName] = useState('');
  const [docFileSize, setDocFileSize] = useState('');
  const [docFileType, setDocFileType] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docAmount, setDocAmount] = useState<number>(0);
  const [docComment, setDocComment] = useState('');

  // New Payment Form States
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payDate, setPayDate] = useState('');
  const [payMethod, setPayMethod] = useState<'bank' | 'cash' | 'pos' | 'other'>('bank');
  const [payerAccount, setPayerAccount] = useState('GE55TB111222333444555');
  const [recipientName, setRecipientName] = useState('');
  const [payPurpose, setPayPurpose] = useState('');
  const [payTxNumber, setPayTxNumber] = useState('');
  const [payFee, setPayFee] = useState<number>(0);
  const [payReceiptFile, setPayReceiptFile] = useState('');
  const [payComment, setPayComment] = useState('');

  // Status transition state
  const [transitionComment, setTransitionComment] = useState('');

  // VAT Auto-calculation helper
  const handleAmountNoVatChange = (noVat: number) => {
    setNewAmountNoVat(noVat);
    if (hasVat) {
      const computedVat = parseFloat((noVat * 0.18).toFixed(2));
      setNewVat(computedVat);
      setNewAmountWithVat(parseFloat((noVat + computedVat).toFixed(2)));
    } else {
      setNewVat(0);
      setNewAmountWithVat(noVat);
    }
  };

  const toggleVat = (checked: boolean) => {
    setHasVat(checked);
    if (checked) {
      const computedVat = parseFloat((newAmountNoVat * 0.18).toFixed(2));
      setNewVat(computedVat);
      setNewAmountWithVat(parseFloat((newAmountNoVat + computedVat).toFixed(2)));
    } else {
      setNewVat(0);
      setNewAmountWithVat(newAmountNoVat);
    }
  };

  // Check if an expense is Document Complete
  const checkDocumentCompleteness = (expense: Expense): { status: 'complete' | 'incomplete'; missing: string[] } => {
    const expenseDocs = documents.filter(d => d.expenseId === expense.id && d.status === 'active');
    const isIndividual = suppliers.find(s => s.id === expense.supplierId)?.type === 'individual';
    
    const missing: string[] = [];

    // For companies: requires invoice/tax_doc, contract, acceptance_act
    if (!isIndividual) {
      const hasInvoiceOrTaxDoc = expenseDocs.some(d => d.docType === 'invoice' || d.docType === 'tax_doc');
      const hasContract = expenseDocs.some(d => d.docType === 'contract');
      const hasAcceptance = expenseDocs.some(d => d.docType === 'acceptance_act');

      if (!hasInvoiceOrTaxDoc) missing.push('საგადასახადო ფაქტურა/ზედნადები (RS.GE)');
      if (!hasContract) missing.push('ხელშეკრულება');
      if (!hasAcceptance) missing.push('მიღება-ჩაბარების აქტი');
    } else {
      // For individuals: contract, acceptance_act, and transfer receipt (payment receipt)
      const hasContract = expenseDocs.some(d => d.docType === 'contract');
      const hasAcceptance = expenseDocs.some(d => d.docType === 'acceptance_act');
      const hasReceipt = expenseDocs.some(d => d.docType === 'receipt') || payments.some(p => p.expenseId === expense.id && p.status === 'approved');

      if (!hasContract) missing.push('ხელშეკრულება');
      if (!hasAcceptance) missing.push('მიღება-ჩაბარების აქტი');
      if (!hasReceipt) missing.push('ბანკის გადარიცხვის ქვითარი');
    }

    return {
      status: missing.length === 0 ? 'complete' : 'incomplete',
      missing
    };
  };

  // Filter Logic
  const filteredExpenses = expenses.filter(exp => {
    const titleMatch = exp.title.toLowerCase().includes(searchTerm.toLowerCase());
    const supplier = suppliers.find(s => s.id === exp.supplierId);
    const supplierMatch = supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const descriptionMatch = exp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const invoiceMatch = exp.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    
    const categoryFilter = selectedCategory === 'all' || exp.categoryId === selectedCategory;
    const supplierFilter = selectedSupplier === 'all' || exp.supplierId === selectedSupplier;
    const statusFilter = selectedStatus === 'all' || exp.status === selectedStatus;
    
    // Doc completeness filter
    let docFilter = true;
    if (selectedDocCompleteness !== 'all') {
      const completeness = checkDocumentCompleteness(exp);
      docFilter = selectedDocCompleteness === completeness.status;
    }

    return (titleMatch || supplierMatch || descriptionMatch || invoiceMatch) && 
           categoryFilter && supplierFilter && statusFilter && docFilter;
  });

  const resetExpenseForm = () => {
    setEditingExpenseId(null);
    setNewTitle('');
    setNewDescription('');
    setNewCategory('');
    setNewCategoryManual('');
    setNewSupplier('');
    setNewSupplierManual('');
    setNewTranche('');
    setNewInvoiceNumber('');
    setNewInvoiceDate('');
    setNewAmountNoVat(0);
    setNewVat(0);
    setNewAmountWithVat(0);
    setNewResponsible(currentUserName);
    setNewStage('ეტაპი 1 - მოწყობა');
    setNewInternalComment('');
    setHasVat(true);
  };

  const openAddExpenseModal = () => {
    resetExpenseForm();
    setIsAddModalOpen(true);
  };

  const openEditExpenseModal = (expense: Expense) => {
    const categoryExists = categories.some(c => c.id === expense.categoryId);
    const supplierExists = suppliers.some(s => s.id === expense.supplierId);
    setEditingExpenseId(expense.id);
    setNewTitle(expense.title);
    setNewDescription(expense.description || '');
    setNewCategory(categoryExists ? expense.categoryId : '__manual__');
    setNewCategoryManual(categoryExists ? '' : expense.category || expense.categoryId || '');
    setNewSupplier(supplierExists ? expense.supplierId : '__manual__');
    setNewSupplierManual(supplierExists ? '' : expense.supplier || expense.supplierId || '');
    setNewTranche(expense.trancheId || '');
    setNewInvoiceNumber(expense.invoiceNumber || '');
    setNewInvoiceDate(expense.invoiceDate || '');
    setNewAmountNoVat(expense.amountNoVat || 0);
    setNewVat(expense.vat || 0);
    setNewAmountWithVat(expense.amountWithVat || 0);
    setNewResponsible(expense.responsiblePerson || currentUserName);
    setNewStage(expense.projectStage || 'ეტაპი 1 - მოწყობა');
    setNewInternalComment(expense.internalComment || '');
    setHasVat((expense.vat || 0) > 0);
    setIsAddModalOpen(true);
  };

  // Handle Form Submission
  const handleCreateExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryValue = isManualCategory ? newCategoryManual.trim() : newCategory;
    const supplierValue = newSupplier === '__manual__' ? newSupplierManual.trim() : newSupplier;
    const categoryLabel = isManualCategory
      ? newCategoryManual.trim()
      : categories.find(c => c.id === newCategory)?.name || newCategory;
    const supplierLabel = newSupplier === '__manual__'
      ? newSupplierManual.trim()
      : suppliers.find(s => s.id === newSupplier)?.name || newSupplier;
    if (!newTitle || !categoryValue || !supplierValue || !newAmountWithVat) {
      alert('გთხოვთ შეავსოთ სავალდებულო ველები!');
      return;
    }

    const payload = {
      title: newTitle,
      description: newDescription,
      categoryId: categoryValue,
      category: categoryLabel,
      supplierId: supplierValue,
      supplier: supplierLabel,
      trancheId: newTranche || undefined,
      invoiceNumber: newInvoiceNumber || undefined,
      invoiceDate: newInvoiceDate || undefined,
      amountNoVat: Number(newAmountNoVat),
      vat: Number(newVat),
      amountWithVat: Number(newAmountWithVat),
      responsiblePerson: newResponsible,
      projectStage: newStage,
      internalComment: newInternalComment || undefined,
      status: editingExpenseId
        ? expenses.find(expense => expense.id === editingExpenseId)?.status || ExpenseStatus.Draft
        : ExpenseStatus.Draft
    };

    if (editingExpenseId) {
      onUpdateExpense(editingExpenseId, payload);
      if (selectedExpense?.id === editingExpenseId) {
        setSelectedExpense({ ...selectedExpense, ...payload });
      }
    } else {
      onAddExpense(payload);
    }

    resetExpenseForm();
    setIsAddModalOpen(false);
  };

  // File Checksum generator simulation
  const handleUploadDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense || !docNumber || !docDate || !docFileName) {
      alert('გთხოვთ შეავსოთ ყველა ველი!');
      return;
    }

    const generatedChecksum = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
    const simulatedSize = docFileSize || Math.floor(Math.random() * 800) + 150 + ' KB';

    onAddDocument({
      expenseId: selectedExpense.id,
      docType,
      docNumber,
      docDate,
      fileName: docFileName,
      fileSize: simulatedSize,
      fileType: docFileType || undefined,
      status: 'active',
      amount: docAmount || selectedExpense.amountWithVat,
      comment: docComment || undefined,
      checksum: generatedChecksum
    }, docFile);

    // Reset Form
    setDocNumber('');
    setDocDate('');
    setDocFileName('');
    setDocFileSize('');
    setDocFileType('');
    setDocFile(null);
    setDocAmount(0);
    setDocComment('');
  };

  // Add Payment Submit
  const handleAddPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense || !payAmount || !payDate || !recipientName) {
      alert('გთხოვთ შეავსოთ ყველა ველი!');
      return;
    }

    onAddPayment({
      expenseId: selectedExpense.id,
      amount: Number(payAmount),
      paymentDate: payDate,
      paymentMethod: payMethod,
      payerAccount,
      recipientName,
      purpose: payPurpose,
      bankTxNumber: payTxNumber || undefined,
      fee: Number(payFee),
      receiptFile: payReceiptFile || undefined,
      comment: payComment || undefined,
      status: 'approved' // Automatically approved for simplicity of the simulation
    });

    // Reset form
    setPayAmount(0);
    setPayDate('');
    setPayPurpose('');
    setPayTxNumber('');
    setPayReceiptFile('');
    setPayFee(0);
    setPayComment('');
  };

  // Export Filtered Table to CSV simulation
  const exportToCSV = () => {
    const headers = ['ID', 'დასახელება', 'კატეგორია', 'მიმწოდებელი', 'თანხა დღგ-ით (GEL)', 'სტატუსი', 'პასუხისმგებელი', 'დოკუმენტის თარიღი'];
    const rows = filteredExpenses.map(e => [
      e.id,
      e.title,
      categories.find(c => c.id === e.categoryId)?.name || 'უცნობი',
      suppliers.find(s => s.id === e.supplierId)?.name || 'უცნობი',
      e.amountWithVat.toString(),
      STATUS_LABELS[e.status] || e.status,
      e.responsiblePerson,
      e.invoiceDate || 'არა აქვს'
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = window.document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `აწარმოე_საქართველოში_ხარჯები_${new Date().toISOString().split('T')[0]}.csv`);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="expenses-section-root">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">ხარჯების რეესტრი</h2>
          <p className="text-xs text-slate-500 mt-1">
            სულ ნაპოვნია <span className="font-semibold text-slate-700">{filteredExpenses.length} ხარჯი</span> მოცემული ფილტრით.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-sm transition-all"
          >
            <Download className="h-4 w-4" />
            Excel ექსპორტი
          </button>
          
          {canModify && (
            <button 
              onClick={openAddExpenseModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              ხარჯის დამატება
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-50">
          <Filter className="h-3.5 w-3.5" />
          ფილტრები და ძებნა
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          
          {/* Searching input */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ძებნა დასახელებით, მიმწოდებლით, ინვოისით..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-700"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium"
            >
              <option value="all">ყველა კატეგორია</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Supplier Filter */}
          <div>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium"
            >
              <option value="all">ყველა მიმწოდებელი</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium"
            >
              <option value="all">ყველა სტატუსი</option>
              {Object.values(ExpenseStatus).map(status => (
                <option key={status} value={status}>{STATUS_LABELS[status]}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Extra document completeness status filter */}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs text-slate-400 font-medium">დოკუმენტების აუდიტი:</span>
          <div className="flex gap-1.5">
            {[
              { id: 'all', name: 'ყველა' },
              { id: 'complete', name: 'სრულყოფილი ფაილები' },
              { id: 'incomplete', name: 'არასრული / აკლია ფაილი' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedDocCompleteness(tab.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  selectedDocCompleteness === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-hidden">
          <table className="w-full table-fixed text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-3 w-[24%]">ხარჯი</th>
                <th className="p-3 w-[22%]">კატეგორია & მიმწოდებელი</th>
                <th className="p-3 w-[11%] text-right">თანხა</th>
                <th className="p-3 w-[14%] text-center">დოკუმენტები</th>
                <th className="p-3 w-[12%] text-center">გადახდა</th>
                <th className="p-3 w-[10%]">სტატუსი</th>
                <th className="p-3 w-[7%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredExpenses.map(exp => {
                const category = categories.find(c => c.id === exp.categoryId);
                const supplier = suppliers.find(s => s.id === exp.supplierId);
                const categoryName = category?.name || exp.category || exp.categoryId || '—';
                const supplierName = supplier?.name || exp.supplier || exp.supplierId || '—';
                const isIndividual = supplier?.type === 'individual';
                
                // Tranche check warning
                const tranche = tranches.find(t => t.id === exp.trancheId);
                const hasTrancheWarning = tranche && exp.invoiceDate && exp.invoiceDate < tranche.receivedDate;

                // Document Audit checklist info
                const { status: docStatus, missing } = checkDocumentCompleteness(exp);

                // Payments validation check
                const expensePayments = payments.filter(p => p.expenseId === exp.id && p.status === 'approved');
                const totalPaid = expensePayments.reduce((s, p) => s + p.amount, 0);
                const remainingToPay = Math.max(0, exp.amountWithVat - totalPaid);
                
                let paymentStatusBadge;
                if (totalPaid === 0) {
                  paymentStatusBadge = <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded-md">გადაუხდელია</span>;
                } else if (remainingToPay <= 0) {
                  paymentStatusBadge = <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">სრულად ფასიანი</span>;
                } else {
                  paymentStatusBadge = (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md">
                      ნაწილობრივი ({totalPaid.toLocaleString()} GEL)
                    </span>
                  );
                }

                // General status layout styling
                let statusBadgeColor = 'bg-slate-100 text-slate-700';
                if (exp.status === ExpenseStatus.Approved) statusBadgeColor = 'bg-emerald-500 text-white';
                else if (exp.status === ExpenseStatus.NeedsCorrection) statusBadgeColor = 'bg-red-500 text-white';
                else if (exp.status === ExpenseStatus.AccountantReview) statusBadgeColor = 'bg-indigo-600 text-white';
                else if (exp.status === ExpenseStatus.DocumentsMissing) statusBadgeColor = 'bg-amber-500 text-white';

                return (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 min-w-0">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-900 block truncate">{exp.title}</span>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400 font-mono">
                          <span className="truncate max-w-[110px]">ID: {exp.id}</span>
                          <span>დოკ: {exp.invoiceDate || 'არა აქვს'}</span>
                        </div>
                        {hasTrancheWarning && (
                          <span className="text-[10px] text-red-500 font-semibold bg-red-50 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" />
                            თარიღი ტრანშამდეა!
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 min-w-0">
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-700 block truncate">{categoryName}</span>
                        <span className="text-slate-400 text-[11px] block truncate">{supplierName}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 tabular-nums">
                      {exp.amountWithVat.toLocaleString('ka-GE', { minimumFractionDigits: 2 })} GEL
                      {exp.vat > 0 && <span className="text-[10px] text-slate-400 block font-normal">დღგ: {exp.vat.toLocaleString()} GEL</span>}
                    </td>
                    <td className="p-3 text-center">
                      {docStatus === 'complete' ? (
                        <span className="inline-flex items-center justify-center gap-1 text-emerald-600 font-semibold">
                          <CheckCircle className="h-4 w-4" />
                          სრულყოფილი
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center justify-center gap-1 text-amber-600 font-semibold">
                            <AlertCircle className="h-4 w-4" />
                            <span className="leading-tight">არასრული ({missing.length})</span>
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {paymentStatusBadge}
                    </td>
                    <td className="p-3">
                      <span className={`inline-block max-w-full px-2 py-1 text-[10px] font-bold rounded-full leading-tight break-words ${statusBadgeColor}`}>
                        {STATUS_LABELS[exp.status] || exp.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        {canModify && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditExpenseModal(exp)}
                              title="რედაქტირება"
                              className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`წავშალოთ ხარჯი „${exp.title}”?`)) onDeleteExpense(exp.id);
                              }}
                              title="წაშლა"
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => {
                            setSelectedExpense(exp);
                            setActiveDetailTab('details');
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-indigo-600 font-semibold text-xs flex items-center gap-1 transition-colors"
                          title="დეტალები"
                        >
                          <span className="sr-only">დეტალები</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-medium text-xs">
                    ხარჯები მოცემული ფილტრით ვერ მოიძებნა.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD EXPENSE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">{editingExpenseId ? 'ხარჯის რედაქტირება' : 'ახალი ხარჯის დამატება'}</h3>
              <button onClick={() => { setIsAddModalOpen(false); resetExpenseForm(); }} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpenseSubmit} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ხარჯის დასახელება *</label>
                  <input 
                    type="text" 
                    placeholder="მაგ: მე-2 ბოქსის კანალიზაციის მილების გაყვანა"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                  />
                </div>

                {/* Category selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ხარჯის კატეგორია *</label>
                  <select
                    required
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                  >
                    <option value="">აირჩიეთ კატეგორია</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name} {c.isAllowedGrant ? '(გრანტი)' : '(არა-გრანტი)'}</option>
                    ))}
                    <option value="__manual__">სხვა — ხელით ჩაწერა</option>
                  </select>
                  {isManualCategory && (
                    <input
                      type="text"
                      required
                      value={newCategoryManual}
                      onChange={(e) => setNewCategoryManual(e.target.value)}
                      placeholder="ჩაწერეთ ხარჯის კატეგორია"
                      className="mt-2 w-full px-3 py-2 bg-white rounded-xl border border-indigo-200 text-xs focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
                    />
                  )}
                </div>

                {/* Supplier selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">მიმწოდებელი/შემსრულებელი *</label>
                  <select
                    required
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                  >
                    <option value="">აირჩიეთ მიმწოდებელი</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.type === 'company' ? 'შპს/კომპანია' : 'ფიზ. პირი'})</option>
                    ))}
                    <option value="__manual__">სხვა — ხელით ჩაწერა</option>
                  </select>
                  {newSupplier === '__manual__' && (
                    <input
                      type="text"
                      required
                      value={newSupplierManual}
                      onChange={(e) => setNewSupplierManual(e.target.value)}
                      placeholder="ჩაწერეთ მიმწოდებელი ან შემსრულებელი"
                      className="mt-2 w-full px-3 py-2 bg-white rounded-xl border border-indigo-200 text-xs focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
                    />
                  )}
                </div>

                {/* Tranche association */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">გრანტის ტრანში</label>
                  <select
                    value={newTranche}
                    onChange={(e) => setNewTranche(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                  >
                    <option value="">არ არის ასოცირებული ტრანშთან</option>
                    {tranches.map(t => (
                      <option key={t.id} value={t.id}>ტრანში #{t.trancheNumber} ({t.amount.toLocaleString()} GEL - {t.receivedDate})</option>
                    ))}
                  </select>
                </div>

                {/* Invoice/Doc dates */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">დოკუმენტის თარიღი (RS.GE)</label>
                  <input 
                    type="date" 
                    value={newInvoiceDate}
                    onChange={(e) => setNewInvoiceDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                  />
                </div>

                {/* Doc Invoice number */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">საგადასახადო დოკუმენტის ნომერი</label>
                  <input 
                    type="text" 
                    placeholder="მაგ: RS-10022441"
                    value={newInvoiceNumber}
                    onChange={(e) => setNewInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                  />
                </div>

                {/* Responsible & Phase */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">პასუხისმგებელი პირი</label>
                  <input 
                    type="text" 
                    value={newResponsible}
                    onChange={(e) => setNewResponsible(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                  />
                </div>

                {/* Amount inputs */}
                <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">გადასახადის კალკულატორი</span>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={hasVat}
                        onChange={(e) => toggleVat(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                      />
                      <span className="text-xs text-slate-500 font-medium">სტანდარტული დღგ (18%)</span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">თანხა დღგ-ს გარეშე</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={newAmountNoVat || ''}
                        onChange={(e) => handleAmountNoVatChange(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">დღგ-ს თანხა</label>
                      <input 
                        type="number" 
                        disabled
                        value={newVat || ''}
                        className="w-full px-2.5 py-1.5 bg-slate-100 rounded-lg border border-slate-100 text-xs font-bold text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">სულ თანხა დღგ-ით *</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        value={newAmountWithVat || ''}
                        onChange={(e) => {
                          setNewAmountWithVat(Number(e.target.value));
                          // if no VAT set, align no VAT sum
                          if (!hasVat) setNewAmountNoVat(Number(e.target.value));
                        }}
                        className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-indigo-200 text-xs font-bold text-indigo-700 bg-indigo-50/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">დეტალური აღწერა</label>
                  <textarea 
                    rows={2}
                    placeholder="დაწერეთ სამუშაოს ან საქონლის მოცულობა..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => { setIsAddModalOpen(false); resetExpenseForm(); }}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-bold rounded-xl transition-all"
                >
                  გაუქმება
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  {editingExpenseId ? 'შენახვა' : 'შექმნა დრაფტად'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EXPENSE DETAILED TAB VIEW */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90%] flex flex-col">
            
            {/* Header with quick metrics */}
            <div className="p-6 bg-slate-900 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="absolute inset-0 bg-grid-white/[0.02]" />
              <div className="relative z-10 space-y-1.5 max-w-xl">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                  {categories.find(c => c.id === selectedExpense.categoryId)?.name || selectedExpense.category || selectedExpense.categoryId || 'კატეგორია'}
                </span>
                <h3 className="text-lg md:text-xl font-bold tracking-tight">{selectedExpense.title}</h3>
                <p className="text-xs text-slate-400 font-medium">მიმწოდებელი: {suppliers.find(s => s.id === selectedExpense.supplierId)?.name || selectedExpense.supplier || selectedExpense.supplierId || 'უცნობი'}</p>
              </div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">ჯამური თანხა</span>
                  <span className="text-xl md:text-2xl font-black text-indigo-400">
                    {selectedExpense.amountWithVat.toLocaleString()} GEL
                  </span>
                </div>
                {canModify && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditExpenseModal(selectedExpense)}
                      title="რედაქტირება"
                      className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`წავშალოთ ხარჯი „${selectedExpense.title}”?`)) {
                          onDeleteExpense(selectedExpense.id);
                          setSelectedExpense(null);
                        }
                      }}
                      title="წაშლა"
                      className="p-1.5 hover:bg-red-500/20 rounded-full text-red-200 hover:text-white transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <button 
                  onClick={() => setSelectedExpense(null)} 
                  className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Sub Tabs Navigation */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 overflow-x-auto">
              {[
                { id: 'details', name: 'ინფორმაცია', icon: FileText },
                { id: 'documents', name: 'დოკუმენტები', icon: Upload },
                { id: 'payments', name: 'გადახდები', icon: Coins },
                { id: 'comments', name: 'კომენტარები', icon: MessageSquare },
                { id: 'history', name: 'ისტორია & აუდიტი', icon: History }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDetailTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                      activeDetailTab === tab.id
                        ? 'border-indigo-600 text-indigo-600 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* Drawer Body Content */}
            <div className="p-6 overflow-y-auto flex-1">
              
              {/* TAB 1: DETAILS */}
              {activeDetailTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* General Metadata */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">ხარჯის მონაცემები</h4>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-400 block font-medium">სტატუსი:</span>
                          <span className="font-bold text-indigo-600">{STATUS_LABELS[selectedExpense.status] || selectedExpense.status}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">პროექტის ეტაპი:</span>
                          <span className="font-bold text-slate-800">{selectedExpense.projectStage}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">პასუხისმგებელი:</span>
                          <span className="font-bold text-slate-800">{selectedExpense.responsiblePerson}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">ასოცირებული ტრანში:</span>
                          <span className="font-bold text-slate-800">
                            {tranches.find(t => t.id === selectedExpense.trancheId)?.trancheNumber 
                              ? `ტრანში #${tranches.find(t => t.id === selectedExpense.trancheId)?.trancheNumber}` 
                              : 'არ არის'
                            }
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className="text-xs text-slate-400 block font-medium">აღწერა:</span>
                        <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                          {selectedExpense.description || 'დეტალური აღწერა არ არის შევსებული.'}
                        </p>
                      </div>
                    </div>

                    {/* Financial Validation Warnings and Status Workflows */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">ბიზნეს ვალიდაცია & სტატუსი</h4>
                      
                      {/* Tranche date comparison warning */}
                      {(() => {
                        const tranche = tranches.find(t => t.id === selectedExpense.trancheId);
                        const hasTrancheWarning = tranche && selectedExpense.invoiceDate && selectedExpense.invoiceDate < tranche.receivedDate;
                        if (hasTrancheWarning) {
                          return (
                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-xs text-red-800 leading-relaxed space-y-1">
                              <div className="flex items-center gap-1.5 font-bold">
                                <ShieldAlert className="h-4 w-4 shrink-0" />
                                ყურადღება: დოკუმენტის თარიღის დარღვევა
                              </div>
                              <p>
                                დოკუმენტის თარიღი ({selectedExpense.invoiceDate}) წინ უსწრებს გრანტის ტრანშის მიღების თარიღს ({tranche?.receivedDate}). გთხოვთ გადაამოწმოთ ბუღალტერთან, რათა გრანტის დამფინანსებელმა არ უარყოს ეს ხარჯი!
                              </p>
                            </div>
                          );
                        } else {
                          return (
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                              დოკუმენტის თარიღი ტრანშის შემდგომია (ვალიდაცია გავლილია)
                            </div>
                          );
                        }
                      })()}

                      {/* Manual status control */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                        <span className="text-xs font-bold text-slate-600 block">სტატუსის მითითება</span>
                        <select
                          value={selectedExpense.status}
                          disabled={!canModify}
                          onChange={(e) => {
                            const nextStatus = e.target.value as ExpenseStatus;
                            onUpdateExpenseStatus(selectedExpense.id, nextStatus, transitionComment);
                            setSelectedExpense({ ...selectedExpense, status: nextStatus });
                            setTransitionComment('');
                          }}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
                        >
                          {Object.values(ExpenseStatus).map(status => (
                            <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                          ))}
                        </select>
                        <input 
                          type="text" 
                          placeholder="კომენტარი სტატუსის ცვლილებისთვის (არასავალდებულო)"
                          value={transitionComment}
                          onChange={(e) => setTransitionComment(e.target.value)}
                          disabled={!canModify}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-700"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: DOCUMENTS */}
              {activeDetailTab === 'documents' && (
                <div className="space-y-6">
                  
                  {/* Documents checklist status */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-slate-600 block">სავალდებულო დოკუმენტების აუდიტორული შემოწმება</span>
                    {(() => {
                      const { status, missing } = checkDocumentCompleteness(selectedExpense);
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold">საერთო აუდიტი:</span>
                            {status === 'complete' ? (
                              <span className="text-emerald-600 font-bold">დოკუმენტები სრულად ატვირთულია</span>
                            ) : (
                              <span className="text-amber-600 font-bold">აკლია დოკუმენტები</span>
                            )}
                          </div>
                          {missing.length > 0 && (
                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-xs text-amber-800 space-y-1">
                              <strong>საჭიროა შემდეგი დოკუმენტების ატვირთვა:</strong>
                              <ul className="list-disc list-inside space-y-0.5 text-amber-700">
                                {missing.map((m, i) => <li key={i}>{m}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Upload document form */}
                  {canModify && (
                    <form onSubmit={handleUploadDocumentSubmit} className="bg-indigo-50/20 p-5 rounded-2xl border border-indigo-100/50 space-y-4">
                      <span className="text-xs font-bold text-indigo-900 block flex items-center gap-1">
                        <Upload className="h-4 w-4" />
                        ახალი დოკუმენტის ატვირთვა
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">დოკუმენტის ტიპი</label>
                          <select
                            value={docType}
                            onChange={(e) => setDocType(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700"
                          >
                            <option value="invoice">საგადასახადო ინვოისი / ფაქტურა</option>
                            <option value="waybill">სასაქონლო ზედნადები (RS.GE)</option>
                            <option value="tax_doc">საგადასახადო დოკუმენტი</option>
                            <option value="contract">ხელშეკრულება</option>
                            <option value="acceptance_act">მიღება-ჩაბარების აქტი</option>
                            <option value="receipt">გადარიცხვის ქვითარი</option>
                            <option value="other">სხვა ტიპის ფაილი</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">დოკუმენტის ნომერი</label>
                          <input 
                            type="text" 
                            placeholder="მაგ: RS-99882"
                            required
                            value={docNumber}
                            onChange={(e) => setDocNumber(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">დოკუმენტის თარიღი</label>
                          <input 
                            type="date" 
                            required
                            value={docDate}
                            onChange={(e) => setDocDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">ფაილი (PDF, Word, ფოტო და სხვა)</label>
                          <input 
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.heic,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            required
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setDocFile(file);
                              setDocFileName(file.name);
                              setDocFileType(file.type || file.name.split('.').pop() || '');
                              setDocFileSize(`${Math.max(1, Math.round(file.size / 1024))} KB`);
                            }}
                            className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700"
                          />
                          {docFileName && (
                            <span className="text-[10px] text-slate-400 block mt-1">
                              არჩეულია: {docFileName} {docFileSize && `(${docFileSize})`}
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">დოკუმენტის თანხა (GEL)</label>
                          <input 
                            type="number" 
                            value={docAmount || ''}
                            onChange={(e) => setDocAmount(Number(e.target.value))}
                            placeholder={selectedExpense.amountWithVat.toString()}
                            className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 font-bold"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all"
                        >
                          ფაილის დამატება
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Documents table list */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-600 block">ატვირთული ფაილების არქივი</span>
                    <div className="space-y-2">
                      {documents.filter(d => d.expenseId === selectedExpense.id && d.status === 'active').map(d => (
                        <div key={d.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-100 text-xs gap-3">
                          <div className="flex items-start gap-3">
                            <FileText className="h-8 w-8 text-indigo-600 shrink-0" />
                            <div>
                              <span className="font-bold text-slate-800 block">{d.fileName}</span>
                              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mt-1">
                                <span>ტიპი: <strong className="text-slate-500 uppercase">{d.docType}</strong></span>
                                <span>•</span>
                                <span>ნომერი: <strong className="text-slate-500">{d.docNumber}</strong></span>
                                <span>•</span>
                                <span>ზომა: {d.fileSize}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 block font-mono mt-1">SHA-256 (Checksum): {d.checksum}</span>
                              {d.fileUrl && (
                                <div className="flex items-center gap-3 mt-2">
                                  <a
                                    href={`${d.fileUrl}${d.fileUrl.includes('?') ? '&' : '?'}download=${encodeURIComponent(d.fileName)}`}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:underline"
                                  >
                                    <Download className="h-3 w-3" /> ჩამოტვირთვა
                                  </a>
                                  <a
                                    href={d.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:underline"
                                  >
                                    ახალ თაბში გახსნა ↗
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="font-bold text-slate-800 block">{d.amount.toLocaleString()} GEL</span>
                            <span className="text-[10px] text-slate-400 block mt-1">ატვირთა: {d.uploadedBy}</span>
                            {canModify && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`წავშალოთ დოკუმენტი „${d.fileName}”?`)) onDeleteDocument(d.id);
                                }}
                                className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold"
                              >
                                <Trash2 className="h-3 w-3" />
                                წაშლა
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {documents.filter(d => d.expenseId === selectedExpense.id && d.status === 'active').length === 0 && (
                        <div className="text-center py-6 text-slate-400 font-medium text-xs">ამ ხარჯზე დოკუმენტები ჯერ არ არის მიბმული.</div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: PAYMENTS */}
              {activeDetailTab === 'payments' && (
                <div className="space-y-6">
                  
                  {/* Payment statistics summary */}
                  {(() => {
                    const expensePayments = payments.filter(p => p.expenseId === selectedExpense.id && p.status === 'approved');
                    const totalPaid = expensePayments.reduce((s, p) => s + p.amount, 0);
                    const totalFees = expensePayments.reduce((s, p) => s + (p.fee || 0), 0);
                    const totalOutflow = totalPaid + totalFees;
                    const remainingToPay = Math.max(0, selectedExpense.amountWithVat - totalPaid);
                    
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                        <div>
                          <span className="text-slate-400 font-medium block">ხარჯის სრული თანხა:</span>
                          <span className="text-base font-black text-slate-800">{selectedExpense.amountWithVat.toLocaleString()} GEL</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium block">ჯამურად გადახდილი:</span>
                          <span className="text-base font-black text-emerald-600">{totalPaid.toLocaleString()} GEL</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium block">საკომისიო / სულ ხარჯი:</span>
                          <span className="text-base font-black text-indigo-600">{totalOutflow.toLocaleString()} GEL</span>
                          <span className="text-[10px] text-slate-400 block">საკომისიო: {totalFees.toLocaleString()} GEL</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium block">დარჩენილი გადასახდელი:</span>
                          <span className={`text-base font-black ${remainingToPay > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {remainingToPay.toLocaleString()} GEL
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Add payment transaction form */}
                  {canModify && (
                    <form onSubmit={handleAddPaymentSubmit} className="bg-emerald-50/20 p-5 rounded-2xl border border-emerald-100/40 space-y-4">
                      <span className="text-xs font-bold text-emerald-900 block flex items-center gap-1">
                        <Coins className="h-4 w-4" />
                        საბანკო გადახდის დამატება (ტრანზაქცია)
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">გადახდის თანხა (GEL) *</label>
                          <input 
                            type="number" 
                            step="0.01"
                            required
                            value={payAmount || ''}
                            onChange={(e) => setPayAmount(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">გადახდის თარიღი *</label>
                          <input 
                            type="date" 
                            required
                            value={payDate}
                            onChange={(e) => setPayDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">გადახდის მეთოდი</label>
                          <select
                            value={payMethod}
                            onChange={(e) => setPayMethod(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700"
                          >
                            <option value="bank">საბანკო გადარიცხვა</option>
                            <option value="cash">ნაღდი ანგარიშსწორება</option>
                            <option value="pos">POS ტერმინალი</option>
                            <option value="other">სხვა</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">მიმღები პირი/ორგანიზაცია *</label>
                          <input 
                            type="text" 
                            required
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">საკომისიო (თუ გადაიხადეთ)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={payFee || ''}
                            onChange={(e) => setPayFee(Number(e.target.value))}
                            placeholder="0.00"
                            className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">TXN / საბანკო კოდი</label>
                          <input
                            type="text"
                            value={payTxNumber}
                            onChange={(e) => setPayTxNumber(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">საბანკო დანიშნულება</label>
                          <input 
                            type="text" 
                            value={payPurpose}
                            onChange={(e) => setPayPurpose(e.target.value)}
                            placeholder="მაგ: საგადასახადო ანგარიშ-ფაქტურა RS-99882211 ანაზღაურება"
                            className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
                        >
                          გადახდის რეგისტრაცია
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Payments transactions list */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-600 block">განხორციელებული გადახდების რეესტრი</span>
                    <div className="space-y-2">
                      {payments.filter(p => p.expenseId === selectedExpense.id && p.status === 'approved').map(p => (
                        <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-800 block">მიმღები: {p.recipientName}</span>
                            <p className="text-[11px] text-slate-500">{p.purpose}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                              <span>თარიღი: {p.paymentDate}</span>
                              <span>•</span>
                              <span>მეთოდი: <strong className="text-slate-500">{p.paymentMethod === 'bank' ? 'საბანკო' : p.paymentMethod === 'cash' ? 'ნაღდი' : p.paymentMethod === 'pos' ? 'POS' : p.paymentMethod}</strong></span>
                              <span>•</span>
                              <span>საკომისიო: {p.fee} GEL</span>
                            </div>
                          </div>

                          <div className="text-right space-y-1">
                            <span className="text-sm font-black text-emerald-600">{p.amount.toLocaleString()} GEL</span>
                            <span className="text-[10px] text-slate-400 block">შემოწმებული: {p.checkedBy || 'ბუღალტერი'}</span>
                          </div>
                        </div>
                      ))}
                      {payments.filter(p => p.expenseId === selectedExpense.id && p.status === 'approved').length === 0 && (
                        <div className="text-center py-6 text-slate-400 font-medium text-xs">ამ ხარჯზე გადახდები ჯერ არ განხორციელებულა.</div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: COMMENTS */}
              {activeDetailTab === 'comments' && (
                <div className="space-y-4">
                  
                  {/* Comments list */}
                  <div className="space-y-3">
                    {comments.filter(c => c.expenseId === selectedExpense.id).map(c => (
                      <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">{c.userName}</span>
                            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[9px] font-bold rounded uppercase">
                              {c.userRole}
                            </span>
                          </div>
                          <span className="text-slate-400 font-mono">{new Date(c.createdAt).toLocaleString('ka-GE')}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{c.text}</p>
                      </div>
                    ))}
                    {comments.filter(c => c.expenseId === selectedExpense.id).length === 0 && (
                      <div className="text-center py-8 text-slate-400 font-medium text-xs">არანაირი შენიშვნა ან კომენტარი არ მოიძებნა.</div>
                    )}
                  </div>

                  {/* Add comment input */}
                  <div className="pt-4 border-t border-slate-100 flex gap-2">
                    <input 
                      type="text" 
                      id="comment-input-field"
                      placeholder="დატოვეთ კომენტარი ან შენიშვნა ბუღალტრისთვის..."
                      className="flex-1 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value;
                          if (val) {
                            onAddComment(selectedExpense.id, val);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        const el = document.getElementById('comment-input-field') as HTMLInputElement;
                        if (el && el.value) {
                          onAddComment(selectedExpense.id, el.value);
                          el.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all"
                    >
                      გაგზავნა
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 5: AUDIT HISTORY */}
              {activeDetailTab === 'history' && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-600 block">სტატუსებისა და ცვლილებების ისტორია</span>
                  <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-4 text-xs">
                    {history.filter(h => h.expenseId === selectedExpense.id).map(h => (
                      <div key={h.id} className="relative">
                        <span className="absolute -left-6 top-1 bg-indigo-600 w-2.5 h-2.5 rounded-full ring-4 ring-white" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <strong className="text-slate-800">{h.changedBy}</strong>
                            <span>შეცვალა სტატუსი:</span>
                            <span className="font-semibold text-slate-600">{STATUS_LABELS[h.fromStatus] || h.fromStatus}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span className="font-bold text-indigo-600">{STATUS_LABELS[h.toStatus] || h.toStatus}</span>
                          </div>
                          {h.comment && <p className="text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">{h.comment}</p>}
                          <span className="text-[10px] text-slate-400 font-mono block">{new Date(h.changeDate).toLocaleString('ka-GE')}</span>
                        </div>
                      </div>
                    ))}
                    {history.filter(h => h.expenseId === selectedExpense.id).length === 0 && (
                      <div className="text-center py-6 text-slate-400 font-medium text-xs">ცვლილებების ისტორია ცარიელია.</div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
