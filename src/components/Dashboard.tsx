import React from 'react';
import { Wallet, TrendingDown, PiggyBank, Receipt, ArrowRight } from 'lucide-react';
import { Expense, Category, Payment } from '../types';
import { STATUS_LABELS, STATUS_STYLES } from '../data/defaults';

interface Props {
  expenses: Expense[];
  categories: Category[];
  payments: Payment[];
  totalBudget: number;
  onNavigate: (tab: string) => void;
}

const gel = (n: number) => `${n.toLocaleString()} ₾`;

export default function Dashboard({ expenses, categories, payments, totalBudget, onNavigate }: Props) {
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const remaining = totalBudget - totalPaid;

  const stats = [
    { label: 'ბიუჯეტი', value: gel(totalBudget), icon: Wallet, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'გადახდილი', value: gel(totalPaid), icon: TrendingDown, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'დარჩენილი', value: gel(remaining), icon: PiggyBank, color: remaining < 0 ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50' },
    { label: 'ხარჯების რაოდენობა', value: String(expenses.length), icon: Receipt, color: 'text-slate-600 bg-slate-100' },
  ];

  const recent = [...expenses].sort((a, b) => (b.date > a.date ? 1 : -1)).slice(0, 6);

  const catSpent = (catName: string) =>
    expenses.filter((e) => e.category === catName).reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800">მთავარი დაფა</h2>
        <p className="text-xs text-slate-500 mt-1">გრანტის ბიუჯეტისა და ხარჯების მიმოხილვა.</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] text-slate-400 font-semibold block">{s.label}</span>
              <span className="text-lg font-black text-slate-800">{s.value}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CATEGORY BUDGETS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">კატეგორიების ბიუჯეტი</h3>
          {categories.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              კატეგორიები ჯერ არ არის. დაამატეთ პარამეტრებში.
            </p>
          ) : (
            <div className="space-y-4">
              {categories.map((c) => {
                const spent = catSpent(c.name);
                const pct = c.plannedBudget ? Math.min(100, (spent / c.plannedBudget) * 100) : 0;
                return (
                  <div key={c.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">{c.name}</span>
                      <span className="text-slate-400">
                        {gel(spent)} / {gel(c.plannedBudget)}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct >= 100 ? 'bg-red-500' : 'bg-indigo-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RECENT EXPENSES */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-700">ბოლო ხარჯები</h3>
            <button
              onClick={() => onNavigate('expenses')}
              className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:gap-1.5 transition-all"
            >
              ყველა <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {recent.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">ხარჯები ჯერ არ არის.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {recent.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-2.5 gap-2">
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-slate-700 block truncate">{e.title}</span>
                    <span className="text-[11px] text-slate-400">{e.date}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[e.status]}`}>
                      {STATUS_LABELS[e.status]}
                    </span>
                    <span className="text-sm font-bold text-slate-800">{gel(e.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
