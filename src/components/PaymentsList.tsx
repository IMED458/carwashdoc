/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CreditCard, Search, ArrowRight, CheckCircle, Clock, Hash, ShieldAlert, Pencil, Trash2, X } from 'lucide-react';
import { Payment, Expense, Supplier, PaymentMethod } from '../types';
import { PAYMENT_METHOD_LABELS } from '../data/defaults';

interface PaymentsListProps {
  payments: Payment[];
  expenses: Expense[];
  suppliers: Supplier[];
  currentUserName: string;
  canEdit: boolean;
  onUpdate: (id: string, payment: Partial<Payment>) => void;
  onDelete: (id: string) => void;
}

export default function PaymentsList({ payments, expenses, suppliers, currentUserName, canEdit, onUpdate, onDelete }: PaymentsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState(''); // YYYY-MM
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [editPayment, setEditPayment] = useState<Payment | null>(null);

  const hasDateFilter = !!(monthFilter || fromDate || toDate);

  const clearDateFilters = () => {
    setMonthFilter('');
    setFromDate('');
    setToDate('');
  };

  // A payment's date passes the active date filter (month + explicit range).
  const inDateRange = (d: string): boolean => {
    if (!hasDateFilter) return true;
    if (!d) return false;
    if (monthFilter && !d.startsWith(monthFilter)) return false;
    if (fromDate && d < fromDate) return false;
    if (toDate && d > toDate) return false;
    return true;
  };

  // Resolve a payment's supplier tax id via its linked expense.
  const supplierTaxId = (p: Payment): string => {
    const expense = expenses.find((e) => e.id === p.expenseId);
    if (!expense) return '';
    const supplier = suppliers.find(
      (s) => s.id === expense.supplierId || s.name === expense.supplier || s.name === expense.supplierId,
    );
    return supplier?.taxId || '';
  };

  const toggleDeclared = (p: Payment) => {
    const next = !p.declared;
    onUpdate(p.id, {
      declared: next,
      declaredBy: next ? currentUserName : '',
      declaredAt: next ? new Date().toISOString().slice(0, 10) : '',
    });
  };

  // Filter payments by search text AND date filter.
  const filteredPayments = payments.filter(p => {
    const matchedExpense = expenses.find(e => e.id === p.expenseId);
    const term = searchTerm.toLowerCase();
    const textMatch =
      !term ||
      p.recipientName.toLowerCase().includes(term) ||
      p.purpose.toLowerCase().includes(term) ||
      (p.bankTxNumber?.toLowerCase().includes(term) ?? false) ||
      (matchedExpense?.title.toLowerCase().includes(term) ?? false);
    return textMatch && inDateRange(p.paymentDate);
  });

  // Totals over the currently visible (filtered) payments — what the accountant
  // needs when preparing a given month's declaration.
  const filteredApproved = filteredPayments.filter(p => p.status === 'approved');
  const filteredSpent = filteredApproved.reduce((s, p) => s + p.amount + (p.fee || 0), 0);
  const filteredFees = filteredPayments.reduce((s, p) => s + (p.fee || 0), 0);
  const filteredDeclaredCount = filteredPayments.filter(p => p.declared).length;

  return (
    <div className="space-y-6" id="payments-section-root">
      
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight font-sans">გადახდებისა და ტრანზაქციების ჟურნალი</h2>
        <p className="text-xs text-slate-500 mt-1">
          პროექტის ბიუჯეტიდან განხორციელებული საბანკო გადარიცხვებისა და ნაღდი ანგარიშსწორების სრული სია.
        </p>
      </div>

      {/* Stats row — reflects the current filter (all when no filter is set) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-xs">
          <span className="text-slate-400 block font-medium">გადახდები {hasDateFilter ? '(ფილტრით)' : ''}</span>
          <span className="text-xl font-black text-slate-800 block mt-1">{filteredPayments.length} ტრანზაქცია</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-xs">
          <span className="text-slate-400 block font-medium">ჯამურად დახარჯული</span>
          <span className="text-xl font-black text-indigo-600 block mt-1">
            {filteredSpent.toLocaleString()} GEL
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-xs">
          <span className="text-slate-400 block font-medium">საბანკო საკომისიო</span>
          <span className="text-xl font-black text-slate-800 block mt-1">
            {filteredFees.toLocaleString()} GEL
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-xs">
          <span className="text-slate-400 block font-medium">დეკლარირებული</span>
          <span className="text-xl font-black text-emerald-600 block mt-1">
            {filteredDeclaredCount} / {filteredPayments.length}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative">
        <Search className="absolute left-7 top-7 h-4 w-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="ძებნა მიმღებით, გადარიცხვის მიზნით, TXN კოდით ან ხარჯის დასახელებით..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50/50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
        />
      </div>

      {/* Date filters — month + detailed range (for preparing monthly declarations) */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-wrap items-end gap-3">
        <label className="text-[11px] font-bold text-slate-500 flex flex-col gap-1">
          თვე
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => { setMonthFilter(e.target.value); setFromDate(''); setToDate(''); }}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700"
          />
        </label>
        <span className="text-[11px] text-slate-300 pb-2">ან</span>
        <label className="text-[11px] font-bold text-slate-500 flex flex-col gap-1">
          თარიღიდან
          <input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setMonthFilter(''); }}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700"
          />
        </label>
        <label className="text-[11px] font-bold text-slate-500 flex flex-col gap-1">
          თარიღამდე
          <input
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setMonthFilter(''); }}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700"
          />
        </label>
        {hasDateFilter && (
          <button
            type="button"
            onClick={clearDateFilters}
            className="ml-auto px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200"
          >
            გასუფთავება
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-4">მიმღები პირი</th>
                <th className="p-4">დაკავშირებული ხარჯი</th>
                <th className="p-4">გადარიცხვის მიზანი / TXN კოდი</th>
                <th className="p-4 text-right">გადახდილი / ხარჯი</th>
                <th className="p-4 text-center">მეთოდი</th>
                <th className="p-4">თარიღი</th>
                <th className="p-4 text-center">დეკლარირებული</th>
                {canEdit && <th className="p-4 text-right">მოქმედება</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPayments.map(p => {
                const matchedExpense = expenses.find(e => e.id === p.expenseId);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">{p.recipientName}</span>
                      {supplierTaxId(p) && (
                        <span className="text-[10px] text-slate-500 block font-mono">ს/კ: {supplierTaxId(p)}</span>
                      )}
                      <span className="text-[10px] text-slate-400 block font-mono">ანგარიში: {p.payerAccount}</span>
                    </td>
                    <td className="p-4">
                      {matchedExpense ? (
                        <span className="font-semibold text-indigo-700 block max-w-xs truncate">{matchedExpense.title}</span>
                      ) : (
                        <span className="text-slate-400 italic">არ არის დაკავშირებული</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="text-slate-600 block max-w-xs truncate">{p.purpose}</span>
                        {p.bankTxNumber && (
                          <span className="text-[10px] text-indigo-500 font-mono flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            TXN: {p.bankTxNumber}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right font-black text-slate-900">
                      {p.amount.toLocaleString()} GEL
                      {p.fee > 0 && (
                        <>
                          <span className="text-[9px] text-slate-400 block font-normal">საკომისიო: {p.fee} GEL</span>
                          <span className="text-[9px] text-indigo-500 block font-bold">სულ ხარჯი: {(p.amount + p.fee).toLocaleString()} GEL</span>
                        </>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-bold rounded uppercase">
                        {PAYMENT_METHOD_LABELS[p.paymentMethod] || p.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-500">
                      {p.paymentDate}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <input
                          type="checkbox"
                          checked={!!p.declared}
                          disabled={!canEdit}
                          onChange={() => toggleDeclared(p)}
                          title={p.declared ? 'დადეკლარირებულია' : 'არ არის დეკლარირებული'}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50 cursor-pointer"
                        />
                        {p.declared && p.declaredAt && (
                          <span className="text-[9px] text-emerald-600 font-mono">{p.declaredAt}</span>
                        )}
                      </div>
                    </td>
                    {canEdit && (
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditPayment(p)}
                            title="რედაქტირება"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('წავშალოთ გადახდის ჩანაწერი?')) onDelete(p.id);
                            }}
                            title="წაშლა"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="text-center py-10 text-slate-400 font-medium">გადახდის ჩანაწერები ვერ მოიძებნა.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onUpdate(editPayment.id, editPayment);
              setEditPayment(null);
            }}
            className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800">გადახდის რედაქტირება</h3>
              <button type="button" onClick={() => setEditPayment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs font-bold text-slate-500">
                თანხა
                <input
                  type="number"
                  step="0.01"
                  value={editPayment.amount || ''}
                  onChange={(e) => setEditPayment({ ...editPayment, amount: Number(e.target.value) })}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700"
                />
              </label>
              <label className="text-xs font-bold text-slate-500">
                თარიღი
                <input
                  type="date"
                  value={editPayment.paymentDate}
                  onChange={(e) => setEditPayment({ ...editPayment, paymentDate: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700"
                />
              </label>
              <label className="text-xs font-bold text-slate-500">
                მეთოდი
                <select
                  value={editPayment.paymentMethod}
                  onChange={(e) => setEditPayment({ ...editPayment, paymentMethod: e.target.value as PaymentMethod })}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700"
                >
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([id, label]) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold text-slate-500">
                მიმღები
                <input
                  value={editPayment.recipientName}
                  onChange={(e) => setEditPayment({ ...editPayment, recipientName: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700"
                />
              </label>
              <label className="sm:col-span-2 text-xs font-bold text-slate-500">
                გადარიცხვის მიზანი
                <input
                  value={editPayment.purpose}
                  onChange={(e) => setEditPayment({ ...editPayment, purpose: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700"
                />
              </label>
              <label className="text-xs font-bold text-slate-500">
                TXN კოდი
                <input
                  value={editPayment.bankTxNumber || ''}
                  onChange={(e) => setEditPayment({ ...editPayment, bankTxNumber: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700"
                />
              </label>
              <label className="text-xs font-bold text-slate-500">
                საკომისიო
                <input
                  type="number"
                  step="0.01"
                  value={editPayment.fee || ''}
                  onChange={(e) => setEditPayment({ ...editPayment, fee: Number(e.target.value) })}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditPayment(null)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl">
                გაუქმება
              </button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl">
                შენახვა
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
