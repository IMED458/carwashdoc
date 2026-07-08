import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Payment, PaymentMethod, Expense } from '../types';
import { PAYMENT_METHOD_LABELS } from '../data/defaults';

interface Props {
  payments: Payment[];
  expenses: Expense[];
  canEdit: boolean;
  onAdd: (data: PaymentForm) => void;
  onDelete: (id: string) => void;
}

export interface PaymentForm {
  expenseId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  note: string;
}

const gel = (n: number) => `${n.toLocaleString()} ₾`;
const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = (): PaymentForm => ({ expenseId: '', amount: 0, date: today(), method: 'bank', note: '' });

export default function PaymentsList({ payments, expenses, canEdit, onAdd, onDelete }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<PaymentForm>(emptyForm());

  const expTitle = (id: string) => expenses.find((e) => e.id === id)?.title || '—';

  const openAdd = () => {
    setForm(emptyForm());
    setModalOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount) {
      alert('შეავსეთ თანხა!');
      return;
    }
    onAdd(form);
    setModalOpen(false);
  };

  const sorted = [...payments].sort((a, b) => (b.date > a.date ? 1 : -1));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-slate-800">გადახდები</h2>
          <p className="text-xs text-slate-500 mt-1">გადახდების ჟურნალი.</p>
        </div>
        {canEdit && (
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm"
          >
            <Plus className="h-4 w-4" /> ახალი გადახდა
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-12">გადახდები ჯერ არ არის.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-slate-400 font-bold uppercase border-b border-slate-100">
                  <th className="px-4 py-3">ხარჯი</th>
                  <th className="px-4 py-3">თანხა</th>
                  <th className="px-4 py-3 hidden sm:table-cell">თარიღი</th>
                  <th className="px-4 py-3">მეთოდი</th>
                  {canEdit && <th className="px-4 py-3 text-right">მოქმედება</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sorted.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {expTitle(p.expenseId)}
                      {p.note && <span className="block text-[11px] text-slate-400 font-normal">{p.note}</span>}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">{gel(p.amount)}</td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell whitespace-nowrap">{p.date}</td>
                    <td className="px-4 py-3 text-slate-500">{PAYMENT_METHOD_LABELS[p.method]}</td>
                    {canEdit && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm('წავშალოთ ეს გადახდა?')) onDelete(p.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">ახალი გადახდა</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ხარჯი</label>
                <select
                  value={form.expenseId}
                  onChange={(e) => setForm({ ...form, expenseId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="">— აირჩიეთ ხარჯი —</option>
                  {expenses.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">თანხა (₾) *</label>
                  <input
                    type="number"
                    value={form.amount || ''}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">თარიღი</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">გადახდის მეთოდი</label>
                <select
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value as PaymentMethod })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm"
                >
                  {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => (
                    <option key={m} value={m}>
                      {PAYMENT_METHOD_LABELS[m]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">შენიშვნა</label>
                <input
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl"
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
