/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CreditCard, Search, ArrowRight, CheckCircle, Clock, Hash, ShieldAlert, Pencil, Trash2, X } from 'lucide-react';
import { Payment, Expense, PaymentMethod } from '../types';
import { PAYMENT_METHOD_LABELS } from '../data/defaults';

interface PaymentsListProps {
  payments: Payment[];
  expenses: Expense[];
  canEdit: boolean;
  onUpdate: (id: string, payment: Partial<Payment>) => void;
  onDelete: (id: string) => void;
}

export default function PaymentsList({ payments, expenses, canEdit, onUpdate, onDelete }: PaymentsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editPayment, setEditPayment] = useState<Payment | null>(null);

  // Filter payments
  const filteredPayments = payments.filter(p => {
    const matchedExpense = expenses.find(e => e.id === p.expenseId);
    return p.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.bankTxNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           matchedExpense?.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6" id="payments-section-root">
      
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight font-sans">გადახდებისა და ტრანზაქციების ჟურნალი</h2>
        <p className="text-xs text-slate-500 mt-1">
          პროექტის ბიუჯეტიდან განხორციელებული საბანკო გადარიცხვებისა და ნაღდი ანგარიშსწორების სრული სია.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-xs">
          <span className="text-slate-400 block font-medium">სულ გადახდები</span>
          <span className="text-xl font-black text-slate-800 block mt-1">{payments.length} ტრანზაქცია</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-xs">
          <span className="text-slate-400 block font-medium">ჯამურად დახარჯული თანხა</span>
          <span className="text-xl font-black text-indigo-600 block mt-1">
            {payments.filter(p => p.status === 'approved').reduce((s, p) => s + p.amount + (p.fee || 0), 0).toLocaleString()} GEL
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-xs">
          <span className="text-slate-400 block font-medium">სულ საბანკო საკომისიო</span>
          <span className="text-xl font-black text-slate-800 block mt-1">
            {payments.reduce((s, p) => s + p.fee, 0).toLocaleString()} GEL
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
                  <td colSpan={canEdit ? 7 : 6} className="text-center py-10 text-slate-400 font-medium">გადახდის ჩანაწერები ვერ მოიძებნა.</td>
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
