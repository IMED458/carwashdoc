import React, { useState } from 'react';
import { Plus, Trash2, Building2, User } from 'lucide-react';
import { Supplier } from '../types';
import { SUPPLIER_TYPE_LABELS } from '../data/defaults';

interface Props {
  suppliers: Supplier[];
  canEdit: boolean;
  onAdd: (data: SupplierForm) => void;
  onDelete: (id: string) => void;
}

export interface SupplierForm {
  name: string;
  type: 'company' | 'individual';
  taxId: string;
  phone: string;
}

const emptyForm = (): SupplierForm => ({ name: '', type: 'company', taxId: '', phone: '' });

export default function SuppliersList({ suppliers, canEdit, onAdd, onDelete }: Props) {
  const [form, setForm] = useState<SupplierForm>(emptyForm());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('შეავსეთ მიმწოდებლის სახელი!');
      return;
    }
    onAdd(form);
    setForm(emptyForm());
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-800">მიმწოდებლები</h2>
        <p className="text-xs text-slate-500 mt-1">იურიდიული და ფიზიკური პირები.</p>
      </div>

      {/* ADD FORM */}
      {canEdit && (
        <form
          onSubmit={submit}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
        >
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1">სახელი / დასახელება *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="შპს ან სახელი გვარი"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">ტიპი</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as 'company' | 'individual' })}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm"
            >
              <option value="company">იურიდიული</option>
              <option value="individual">ფიზიკური</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">ს/კ ან პ/ნ</label>
            <input
              value={form.taxId}
              onChange={(e) => setForm({ ...form, taxId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 mb-1">ტელეფონი</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <button
              type="submit"
              title="დამატება"
              className="self-end p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {/* LIST */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {suppliers.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-12">მიმწოდებლები ჯერ არ არის.</p>
        ) : (
          suppliers.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-4 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                  {s.type === 'company' ? <Building2 className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-sm text-slate-800 block truncate">{s.name}</span>
                  <span className="text-[11px] text-slate-400">
                    {SUPPLIER_TYPE_LABELS[s.type]}
                    {s.taxId && ` · ${s.taxId}`}
                    {s.phone && ` · ${s.phone}`}
                  </span>
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={() => {
                    if (confirm(`წავშალოთ მიმწოდებელი „${s.name}"?`)) onDelete(s.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
