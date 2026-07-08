/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Landmark, Calendar, Plus, Wallet, FileText, CheckCircle, X } from 'lucide-react';
import { Tranche, UserRole } from '../types';

interface TranchesListProps {
  tranches: Tranche[];
  currentUserRole: UserRole;
  onAddTranche: (tranche: Omit<Tranche, 'id' | 'createdAt' | 'trancheNumber'>) => void;
}

export default function TranchesList({ tranches, currentUserRole, onAddTranche }: TranchesListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [receivedDate, setReceivedDate] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !receivedDate) {
      alert('გთხოვთ შეავსოთ თანხა და მიღების თარიღი!');
      return;
    }

    onAddTranche({
      amount: Number(amount),
      receivedDate,
      documentName: documentName || 'tranche_receipt_statement.pdf',
      comment
    });

    // Reset Form
    setAmount(0);
    setReceivedDate('');
    setDocumentName('');
    setComment('');
    setIsAddModalOpen(false);
  };

  const totalTranchesAmount = tranches.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6" id="tranches-section-root">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight font-sans">გრანტის ტრანშების მოდული</h2>
          <p className="text-xs text-slate-500 mt-1">
            „აწარმოე საქართველოში“ სახელმწიფო ფონდიდან მიღებული ტრანშების აღრიცხვა.
          </p>
        </div>
        
        {currentUserRole === 'admin' && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            ახალი ტრანში
          </button>
        )}
      </div>

      {/* KPI */}
      <div className="bg-slate-950 text-white rounded-2xl p-6 relative overflow-hidden shadow-md max-w-sm">
        <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-bl-full" />
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl">
            <Landmark className="h-5 w-5 text-indigo-400" />
          </div>
          <span className="text-xs text-slate-300 font-medium">სულ მიღებული ტრანშები</span>
        </div>
        <h3 className="text-2xl font-black mt-3">{totalTranchesAmount.toLocaleString()} GEL</h3>
        <p className="text-[10px] text-slate-400 mt-1">სრული გრანტის ლიმიტი: 50,000.00 GEL</p>
      </div>

      {/* Tranches timeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">მიღებული ტრანშების ისტორია</h3>
        
        <div className="relative border-l border-indigo-100 pl-6 ml-3 space-y-6">
          {tranches.map(t => (
            <div key={t.id} className="relative">
              <span className="absolute -left-9 top-1 bg-indigo-600 text-white p-1 rounded-full ring-4 ring-white shrink-0">
                <Landmark className="h-3.5 w-3.5" />
              </span>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-black text-indigo-700">ტრანში #{t.trancheNumber}</span>
                  <p className="text-xs text-slate-700 font-semibold">{t.comment || 'დამატებითი კომენტარის გარეშე'}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                    <Calendar className="h-3 w-3" />
                    <span>მიღების თარიღი: {t.receivedDate}</span>
                  </div>
                </div>

                <div className="text-right space-y-1.5">
                  <span className="text-base font-black text-slate-800">{t.amount.toLocaleString()} GEL</span>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 justify-end font-mono">
                    <FileText className="h-3 w-3" />
                    <span>Statement: {t.documentName}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: ADD TRANCHE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">ახალი ტრანშის მიღების რეგისტრაცია</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ტრანშის თანხა (GEL) *</label>
                <input 
                  type="number" 
                  placeholder="მაგ: 15000"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-bold text-indigo-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">მიღების თარიღი *</label>
                <input 
                  type="date" 
                  required
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ბანკის ამონაწერი (ფაილის სახელი)</label>
                <input 
                  type="text" 
                  placeholder="მაგ: bank_statement_tbc_tranche3.pdf"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">აღწერა / კომენტარი</label>
                <textarea 
                  rows={2}
                  placeholder="მიუთითეთ ტრანშის პირობები ან დანიშნულება..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-bold rounded-xl"
                >
                  გაუქმება
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  ტრანშის შენახვა
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
