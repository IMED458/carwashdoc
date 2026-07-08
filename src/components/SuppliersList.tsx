/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Building2, User, Plus, Search, Mail, Phone, Hash, FileText, X } from 'lucide-react';
import { Supplier, Expense, UserRole } from '../types';

interface SuppliersListProps {
  suppliers: Supplier[];
  expenses: Expense[];
  currentUserRole: UserRole;
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
}

export default function SuppliersList({
  suppliers,
  expenses,
  currentUserRole,
  onAddSupplier
}: SuppliersListProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Supplier Form States
  const [name, setName] = useState('');
  const [type, setType] = useState<'company' | 'individual'>('company');
  const [taxId, setTaxId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !taxId) {
      alert('გთხოვთ შეავსოთ სახელი და საიდენტიფიკაციო კოდი!');
      return;
    }

    onAddSupplier({
      name,
      type,
      taxId,
      phone: phone || undefined,
      email: email || undefined
    });

    // Reset Form
    setName('');
    setType('company');
    setTaxId('');
    setPhone('');
    setEmail('');
    setIsAddModalOpen(false);
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.taxId.includes(searchTerm)
  );

  return (
    <div className="space-y-6" id="suppliers-section-root">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">მიმწოდებლების რეესტრი</h2>
          <p className="text-xs text-slate-500 mt-1">
            პროექტის ფარგლებში გაფორმებული კონტრაქტორებისა და შემსრულებლების დირექტორია.
          </p>
        </div>
        
        {currentUserRole !== 'viewer' && currentUserRole !== 'uploader' && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            მიმწოდებლის დამატება
          </button>
        )}
      </div>

      {/* Searching */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative">
        <Search className="absolute left-7 top-7 h-4 w-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="ძებნა სახელით ან საიდენტიფიკაციო კოდით..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50/50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
        />
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredSuppliers.map(sup => {
          // Calculate supplier stats
          const supplierExpenses = expenses.filter(e => e.supplierId === sup.id);
          const totalSpent = supplierExpenses.reduce((sum, e) => sum + e.amountWithVat, 0);

          return (
            <div key={sup.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute right-0 top-0 w-16 h-16 bg-slate-50 rounded-bl-full -mr-3 -mt-3 opacity-40" />
              
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${sup.type === 'company' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {sup.type === 'company' ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm leading-tight">{sup.name}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase mt-1 inline-block">
                    {sup.type === 'company' ? 'იურიდიული პირი' : 'ფიზიკური პირი'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>ს/კ: <strong className="text-slate-700 font-mono">{sup.taxId}</strong></span>
                </div>
                {sup.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-slate-700">{sup.phone}</span>
                  </div>
                )}
                {sup.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-700 truncate block max-w-[200px]">{sup.email}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">სულ შესყიდვები:</span>
                  <span className="font-bold text-slate-700">{supplierExpenses.length} ხარჯი</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-medium">ჯამური ბრუნვა:</span>
                  <span className="font-black text-indigo-600">{totalSpent.toLocaleString()} GEL</span>
                </div>
              </div>
            </div>
          );
        })}
        {filteredSuppliers.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 font-medium text-xs">მიმწოდებლები მოცემული ძებნით ვერ მოიძებნა.</div>
        )}
      </div>

      {/* MODAL: ADD SUPPLIER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">ახალი მიმწოდებლის რეგისტრაცია</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ტიპი</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setType('company')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${type === 'company' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    იურიდიული პირი (შპს)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('individual')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${type === 'individual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    ფიზიკური პირი
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">დასახელება / სახელი და გვარი *</label>
                <input 
                  type="text" 
                  placeholder={type === 'company' ? 'შპს ევრო აპარატები' : 'ირაკლი მამულაშვილი'}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
                />
              </div>

              {/* Tax ID */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {type === 'company' ? 'საიდენტიფიკაციო კოდი (9 ნიშნა) *' : 'პირადი ნომერი (11 ნიშნა) *'}
                </label>
                <input 
                  type="text" 
                  placeholder={type === 'company' ? '404555888' : '01024033344'}
                  required
                  maxLength={type === 'company' ? 9 : 11}
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-mono"
                />
              </div>

              {/* Contact info */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ტელეფონის ნომერი</label>
                <input 
                  type="text" 
                  placeholder="599XXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ელ-ფოსტა</label>
                <input 
                  type="email" 
                  placeholder="contact@supplier.ge"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
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
                  დამატება
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
