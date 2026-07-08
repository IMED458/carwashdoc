/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CreditCard, Search, ArrowRight, CheckCircle, Clock, Hash, ShieldAlert } from 'lucide-react';
import { Payment, Expense } from '../types';
import { PAYMENT_METHOD_LABELS } from '../data/defaults';

interface PaymentsListProps {
  payments: Payment[];
  expenses: Expense[];
}

export default function PaymentsList({ payments, expenses }: PaymentsListProps) {
  const [searchTerm, setSearchTerm] = useState('');

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
          <span className="text-slate-400 block font-medium">ჯამურად გადახდილი თანხა</span>
          <span className="text-xl font-black text-indigo-600 block mt-1">
            {payments.filter(p => p.status === 'approved').reduce((s, p) => s + p.amount, 0).toLocaleString()} GEL
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
                <th className="p-4 text-right">გადახდილი თანხა</th>
                <th className="p-4 text-center">მეთოდი</th>
                <th className="p-4">თარიღი</th>
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
                      {p.fee > 0 && <span className="text-[9px] text-slate-400 block font-normal">საკომისიო: {p.fee} GEL</span>}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-bold rounded uppercase">
                        {PAYMENT_METHOD_LABELS[p.paymentMethod] || p.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-500">
                      {p.paymentDate}
                    </td>
                  </tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">გადახდის ჩანაწერები ვერ მოიძებნა.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
