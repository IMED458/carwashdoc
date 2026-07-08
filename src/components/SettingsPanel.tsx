/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Shield, Percent, FolderPlus, CheckCircle, UserCheck, RefreshCw } from 'lucide-react';
import { UserRole, TaxSettings, Category } from '../types';

interface SettingsPanelProps {
  currentUserRole: UserRole;
  currentUserName: string;
  taxSettings: TaxSettings;
  categories: Category[];
  onUpdateRole: (role: UserRole) => void;
  onUpdateTaxSettings: (settings: TaxSettings) => void;
  onAddCategory: (category: Omit<Category, 'id' | 'createdAt' | 'comment' | 'description'>) => void;
}

export default function SettingsPanel({
  currentUserRole,
  currentUserName,
  taxSettings,
  categories,
  onUpdateRole,
  onUpdateTaxSettings,
  onAddCategory
}: SettingsPanelProps) {
  
  // Local form states
  const [incomeTax, setIncomeTax] = useState(taxSettings.incomeTaxPercent);
  const [pensionEmployee, setPensionEmployee] = useState(taxSettings.pensionEmployeePercent);
  const [pensionEmployer, setPensionEmployer] = useState(taxSettings.pensionEmployerPercent);

  // New Category Form States
  const [catName, setCatName] = useState('');
  const [catBudget, setCatBudget] = useState<number>(0);
  const [catIsGrant, setCatIsGrant] = useState(true);

  const handleSaveTax = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTaxSettings({
      incomeTaxPercent: Number(incomeTax),
      pensionEmployeePercent: Number(pensionEmployee),
      pensionEmployerPercent: Number(pensionEmployer)
    });
    alert('საგადასახადო განაკვეთები წარმატებით განახლდა!');
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catBudget) {
      alert('გთხოვთ შეავსოთ კატეგორიის სახელი და ბიუჯეტი!');
      return;
    }

    onAddCategory({
      name: catName,
      plannedBudget: Number(catBudget),
      isAllowedGrant: catIsGrant
    });

    setCatName('');
    setCatBudget(0);
    setCatIsGrant(true);
    alert('ახალი ბიუჯეტის კატეგორია წარმატებით დაემატა!');
  };

  const rolesList: { id: UserRole; name: string; desc: string }[] = [
    { id: 'admin', name: 'Admin (ადმინისტრატორი)', desc: 'აქვს სრული წვდომა, ამტკიცებს ხარჯებს, მართავს ტრანშებსა და ბიუჯეტებს.' },
    { id: 'accountant', name: 'Accountant (ბუღალტერი)', desc: 'ამოწმებს დოკუმენტების სისრულეს, აკონტროლებს საგადასახადო ანარიცხებს, აბრუნებს კორექტირებაზე.' },
    { id: 'manager', name: 'Manager (მენეჯერი)', desc: 'ამატებს ხარჯებს, აბამს ფაილებსა და ინვოისებს, აგზავნის ბუღალტერთან განსახილველად.' },
    { id: 'uploader', name: 'Uploader (დოკუმენტების ამტვირთავი)', desc: 'მხოლოდ ტვირთავს შესყიდვის ფაქტურებსა და ქვითრებს.' },
    { id: 'viewer', name: 'Viewer (მნახველი)', desc: 'მხოლოდ ხედავს ანალიტიკურ დაფას და რეესტრებს ყოველგვარი რედაქტირების გარეშე.' }
  ];

  return (
    <div className="space-y-6" id="settings-section-root">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight font-sans">პროექტის ადმინისტრირება & პარამეტრები</h2>
        <p className="text-xs text-slate-500 mt-1">
          საგადასახადო განაკვეთების კონფიგურაცია, მომხმარებელთა როლების ტესტირება და ბიუჯეტის ლიმიტების მართვა.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PANEL 1: ROLE SWITCHER (SUPER POWERFUL) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-50">
            <Shield className="h-4 w-4" />
            უსაფრთხოების როლების ტესტირება (RBAC)
          </div>
          <p className="text-xs text-slate-500">
            გადართეთ მომხმარებლის აქტიური როლი, რათა მყისიერად გამოსცადოთ პროგრამის წვდომის შეზღუდვები და უფლებები:
          </p>

          <div className="space-y-2 pt-2">
            {rolesList.map(role => (
              <button
                key={role.id}
                onClick={() => onUpdateRole(role.id)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-3 ${
                  currentUserRole === role.id
                    ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/10'
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${currentUserRole === role.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className={`font-bold block ${currentUserRole === role.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {role.name} {currentUserRole === role.id && '(აქტიური)'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 leading-relaxed">{role.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          
          {/* PANEL 2: TAX SETTINGS */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-50">
              <Percent className="h-4 w-4" />
              გლობალური საგადასახადო განაკვეთები
            </div>

            <form onSubmit={handleSaveTax} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">საშემოსავლო გადასახადი (%)</label>
                  <input 
                    type="number" 
                    value={incomeTax}
                    onChange={(e) => setIncomeTax(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">საპენსიო დასაქმებული (%)</label>
                  <input 
                    type="number" 
                    value={pensionEmployee}
                    onChange={(e) => setPensionEmployee(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">საპენსიო დამსაქმებელი (%)</label>
                  <input 
                    type="number" 
                    value={pensionEmployer}
                    onChange={(e) => setPensionEmployer(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  განაკვეთების შენახვა
                </button>
              </div>
            </form>
          </div>

          {/* PANEL 3: BUDGET CATEGORIES MANAGEMENT */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-50">
              <FolderPlus className="h-4 w-4" />
              ახალი ბიუჯეტის კატეგორიის დამატება
            </div>

            <form onSubmit={handleAddCategorySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">კატეგორიის დასახელება *</label>
                  <input 
                    type="text" 
                    placeholder="მაგ: სარეკლამო ბანერები"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">საწყისი ბიუჯეტი (GEL) *</label>
                  <input 
                    type="number" 
                    required
                    value={catBudget || ''}
                    onChange={(e) => setCatBudget(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold font-mono text-indigo-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={catIsGrant}
                    onChange={(e) => setCatIsGrant(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <span className="text-xs text-slate-600 font-semibold">დასაშვებია გრანტის თანხით დაფინანსება</span>
                </label>

                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  კატეგორიის შექმნა
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
