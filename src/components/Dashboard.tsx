/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  Wallet, 
  AlertTriangle, 
  FileCheck, 
  Clock, 
  ArrowRight, 
  Award,
  CheckCircle,
  HelpCircle,
  DollarSign
} from 'lucide-react';
import { Category, Expense, Payment, Tranche, ExpenseStatus, Notification } from '../types';

interface DashboardProps {
  expenses: Expense[];
  payments: Payment[];
  categories: Category[];
  tranches: Tranche[];
  notifications: Notification[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ 
  expenses, 
  payments, 
  categories, 
  tranches, 
  notifications,
  onNavigate 
}: DashboardProps) {
  
  // Formulas as requested:
  // 1. დარჩენილი თანხა = 50,000 - დადასტურებული გადახდილი ხარჯები
  // (We sum approved payments associated with Approved expenses)
  const confirmedPaidExpenses = payments
    .filter(p => p.status === 'approved' && expenses.find(e => e.id === p.expenseId)?.status === ExpenseStatus.Approved)
    .reduce((sum, p) => sum + p.amount + (p.fee || 0), 0);

  const confirmedRemaining = 50000 - confirmedPaidExpenses;

  // 2. ფაქტობრივი დარჩენილი თანხა = 50,000 - ყველა გადახდილი ხარჯი
  // (Approved payments regardless of expense status)
  const totalPaidAmount = payments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount + (p.fee || 0), 0);

  const actualRemaining = 50000 - totalPaidAmount;

  // 3. პროგნოზული დარჩენილი თანხა = 50,000 - გადახდილი ხარჯები - დაგეგმილი/ხელშეკრულებით აღებული ხარჯები
  // Planned, ContractSigned, WorkInProgress, DocumentsMissing, PaymentPending, AccountantReview, NeedsCorrection etc. which are not yet fully paid
  const totalPlannedOrCommitted = expenses
    .filter(e => e.status !== ExpenseStatus.Approved && e.status !== ExpenseStatus.Rejected && e.status !== ExpenseStatus.Cancelled)
    .reduce((sum, e) => {
      // Find what's already paid for this expense
      const paidForThisExpense = payments
        .filter(p => p.expenseId === e.id && p.status === 'approved')
        .reduce((s, p) => s + p.amount, 0);
      const remainingToPay = Math.max(0, e.amountWithVat - paidForThisExpense);
      return sum + remainingToPay;
    }, 0);

  const forecastRemaining = 50000 - totalPaidAmount - totalPlannedOrCommitted;

  // Budget utilization percentage
  const utilizationPercentage = Math.min(100, (totalPaidAmount / 50000) * 100);

  // Document status counts
  const totalApprovedExpensesCount = expenses.filter(e => e.status === ExpenseStatus.Approved).length;
  const missingDocsExpensesCount = expenses.filter(e => e.status === ExpenseStatus.DocumentsMissing).length;

  // Next upcoming payments (planned expenses or pending payments)
  const upcomingPayments = expenses
    .filter(e => e.status === ExpenseStatus.PaymentPending || e.status === ExpenseStatus.AccountantReview)
    .slice(0, 3);

  // Categories spent calculation (actual spent = approved + pending payments in category)
  const categorySpentMap = categories.reduce((acc, cat) => {
    const spent = expenses
      .filter(e => e.categoryId === cat.id && e.status !== ExpenseStatus.Cancelled && e.status !== ExpenseStatus.Rejected)
      .reduce((sum, e) => sum + e.amountWithVat, 0);
    acc[cat.id] = spent;
    return acc;
  }, {} as Record<string, number>);

  // Find top categories with highest spent
  const topCategories = [...categories]
    .map(cat => ({
      ...cat,
      spent: categorySpentMap[cat.id] || 0
    }))
    .filter(c => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  // Expenses by month
  const monthlyData = expenses
    .filter(e => e.status !== ExpenseStatus.Cancelled && e.status !== ExpenseStatus.Rejected)
    .reduce((acc, e) => {
      const date = e.invoiceDate || e.createdAt.split('T')[0];
      const month = date.substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + e.amountWithVat;
      return acc;
    }, {} as Record<string, number>);

  const sortedMonths = Object.keys(monthlyData).sort();

  return (
    <div className="space-y-8" id="dashboard-wrapper">
      
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 rounded-full text-xs font-semibold text-indigo-300 border border-indigo-400/20">
            <Award className="h-3.5 w-3.5" />
            აწარმოე საქართველოში • თანადაფინანსება
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">თვითმომსახურების სამრეცხაოს ბიუჯეტი</h1>
          <p className="text-slate-300 text-sm max-w-xl">
            ავტომანქანის სამრეცხაოს მშენებლობისა და მოწყობის ხარჯების კონტროლის, დოკუმენტაციის ვალიდაციისა და აუდიტის ერთიანი სისტემა.
          </p>
        </div>
        <div className="relative z-10 flex flex-col items-end bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-inner">
          <span className="text-xs text-slate-300 font-medium">სრული გრანტის ბიუჯეტი</span>
          <span className="text-3xl font-black text-white mt-1">50,000.00 <span className="text-xl font-bold">GEL</span></span>
          <span className="text-[11px] text-slate-400 mt-1">100% სახელმწიფო თანადაფინანსება</span>
        </div>
      </div>

      {/* Critical Budget Metrics (Georgian formulas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard-kpis">
        
        {/* Metric 1: დარჩენილი თანხა (დადასტურებული ხარჯებიდან) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 opacity-50" />
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100/80 text-emerald-600 rounded-xl">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold tracking-wide">დადასტურებული დარჩენილი</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                {confirmedRemaining.toLocaleString('ka-GE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-bold">GEL</span>
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-400">სტატუსი: დამტკიცებული და გადახდილი</span>
            <span className="font-semibold text-emerald-600">{confirmedPaidExpenses.toLocaleString('ka-GE')} GEL დახარჯულია</span>
          </div>
        </div>

        {/* Metric 2: ფაქტობრივი დარჩენილი თანხა (ყველა გადახდილი) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50" />
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100/80 text-blue-600 rounded-xl">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold tracking-wide">ფაქტობრივი დარჩენილი</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                {actualRemaining.toLocaleString('ka-GE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-bold">GEL</span>
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-400">გადახდილი + საკომისიო</span>
            <span className="font-semibold text-blue-600">{totalPaidAmount.toLocaleString('ka-GE')} GEL</span>
          </div>
        </div>

        {/* Metric 3: პროგნოზული დარჩენილი თანხა (დაგეგმილების ჩათვლით) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 opacity-50" />
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100/80 text-indigo-600 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold tracking-wide">პროგნოზული დარჩენილი</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                {forecastRemaining.toLocaleString('ka-GE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-bold">GEL</span>
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-400">ხელშეკრულებით აღებული</span>
            <span className="font-semibold text-indigo-600">{totalPlannedOrCommitted.toLocaleString('ka-GE')} GEL</span>
          </div>
        </div>

      </div>

      {/* Progress & Alert Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Bar Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">ბიუჯეტის ათვისების მაჩვენებელი</h3>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">{utilizationPercentage.toFixed(1)}% ათვისებული</span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
            <div 
              className="bg-indigo-600 h-full transition-all duration-500" 
              style={{ width: `${utilizationPercentage}%` }} 
            />
            <div 
              className="bg-amber-400 h-full transition-all duration-500" 
              style={{ width: `${Math.min(100 - utilizationPercentage, (totalPlannedOrCommitted / 50000) * 100)}%` }} 
            />
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-indigo-600 rounded-full" />
              <span>გადახდილი + საკომისიო ({totalPaidAmount.toLocaleString()} GEL)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-amber-400 rounded-full" />
              <span>დაგეგმილი/ხელშეკრულებით ({totalPlannedOrCommitted.toLocaleString()} GEL)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-slate-200 rounded-full" />
              <span>თავისუფალი ბიუჯეტი</span>
            </div>
          </div>
        </div>

        {/* Notification Warning Widget */}
        <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              ყურადღება მისაქცევია!
            </div>
            <p className="text-xs text-red-600 leading-relaxed">
              აღმოჩენილია {notifications.filter(n => !n.isRead).length} გაფრთხილება. ბუღალტრული სისწორისთვის საჭიროა დოკუმენტების თარიღების და გადახდის დამადასტურებელი ქვითრების კორექტირება.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('accountant')}
            className="mt-4 flex items-center justify-between px-4 py-2 bg-red-100 hover:bg-red-200/80 text-red-700 rounded-xl text-xs font-bold transition-all"
          >
            დასამოწმებელი ხარჯები
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* Charts Section (Responsive native SVG) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-charts-grid">
        
        {/* Category breakdown native bar chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">ხარჯები კატეგორიების მიხედვით (ტოპ 5)</h3>
          
          <div className="space-y-4">
            {topCategories.slice(0, 5).map((cat, idx) => {
              const spentPercent = (cat.spent / cat.plannedBudget) * 100;
              const isOverspent = cat.spent > cat.plannedBudget;
              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{idx + 1}. {cat.name}</span>
                    <span className="text-slate-500 font-mono">
                      {cat.spent.toLocaleString()} / {cat.plannedBudget.toLocaleString()} GEL
                    </span>
                  </div>
                  <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100/50">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${isOverspent ? 'bg-red-500' : 'bg-indigo-600'}`}
                      style={{ width: `${Math.min(100, spentPercent)}%` }}
                    />
                  </div>
                  {isOverspent && (
                    <span className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      გადახარჯვა: {(cat.spent - cat.plannedBudget).toLocaleString()} GEL
                    </span>
                  )}
                </div>
              );
            })}
            {topCategories.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs font-medium">ხარჯები ჯერ არ არის დამატებული.</div>
            )}
          </div>
        </div>

        {/* Monthly spending comparison native bar chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">ხარჯვის დინამიკა თვეების მიხედვით</h3>
          
          <div className="h-44 flex items-end justify-around pt-6 border-b border-slate-100 relative">
            {sortedMonths.map(month => {
              const amount = monthlyData[month] || 0;
              const maxAmount = Math.max(...Object.values(monthlyData), 1);
              const heightPercent = (amount / maxAmount) * 80; // Scale to fit nicely

              return (
                <div key={month} className="flex flex-col items-center gap-2 group relative">
                  <div className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap">
                    {amount.toLocaleString()} GEL
                  </div>
                  <div 
                    className="w-12 bg-gradient-to-t from-indigo-500 to-indigo-600 rounded-t-lg hover:from-indigo-600 hover:to-indigo-700 transition-all cursor-pointer"
                    style={{ height: `${Math.max(8, heightPercent)}%` }}
                  />
                  <span className="text-[10px] font-mono text-slate-400">{month}</span>
                </div>
              );
            })}
            {sortedMonths.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-medium">მონაცემები არ არის.</div>
            )}
          </div>
          <div className="text-center text-[11px] text-slate-400">მიიტანეთ კურსორი სვეტზე ზუსტი თანხის სანახავად</div>
        </div>

      </div>

      {/* Lower Section: Active Tranches & Document Completeness Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Tranches List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              მიღებული გრანტის ტრანშები
            </h3>
            <span className="text-xs text-slate-400">ჯამი: {tranches.reduce((s,t)=>s+t.amount,0).toLocaleString()} GEL</span>
          </div>

          <div className="space-y-3">
            {tranches.map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-100 transition-colors">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-indigo-700">ტრანში #{t.trancheNumber}</span>
                  <p className="text-xs text-slate-500">{t.comment}</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-sm font-black text-slate-800">{t.amount.toLocaleString()} GEL</span>
                  <p className="text-[10px] text-slate-400 font-mono">თარიღი: {t.receivedDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Checklist Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="h-4 w-4 text-indigo-500" />
            დოკუმენტების აუდიტი
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <span className="text-xs text-emerald-800 font-medium">სრულყოფილი ხარჯები</span>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                {totalApprovedExpensesCount} ხარჯი
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-amber-50/50 rounded-xl border border-amber-100">
              <span className="text-xs text-amber-800 font-medium">დოკუმენტნაკლული ხარჯები</span>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg">
                {missingDocsExpensesCount} ხარჯი
              </span>
            </div>

            <div className="p-3 bg-indigo-50/50 rounded-xl text-[11px] text-indigo-800 leading-relaxed border border-indigo-100/40">
              <strong>ბუღალტრის რეკომენდაცია:</strong> გრანტის დამფინანსებელთან საბოლოო ანგარიშგებამდე ყველა ხარჯი უნდა იყოს <strong>დამტკიცებული</strong> სტატუსში.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
