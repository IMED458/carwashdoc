import React, { useState } from 'react';
import { Plus, Trash2, Building2, User, Pencil } from 'lucide-react';
import { Supplier, SupplierType } from '../types';
import { SUPPLIER_TYPE_LABELS } from '../data/defaults';

interface Props {
  suppliers: Supplier[];
  canEdit: boolean;
  onAdd: (data: SupplierForm) => void;
  onUpdate: (id: string, data: SupplierForm) => void;
  onDelete: (id: string) => void;
}

export interface SupplierForm {
  name: string;
  type: SupplierType;
  taxId: string;
  phone: string;
}

const emptyForm = (): SupplierForm => ({ name: '', type: 'company', taxId: '', phone: '' });

export default function SuppliersList({ suppliers, canEdit, onAdd, onUpdate, onDelete }: Props) {
  const [form, setForm] = useState<SupplierForm>(emptyForm());
  const [editId, setEditId] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('შეავსეთ მიმწოდებლის სახელი!');
      return;
    }
    if (editId) onUpdate(editId, form);
    else onAdd(form);
    setForm(emptyForm());
    setEditId(null);
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
              onChange={(e) => setForm({ ...form, type: e.target.value as SupplierType })}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm"
            >
              <option value="company">იურიდიული პირი</option>
              <option value="entrepreneur">ინდ. მეწარმე</option>
              <option value="individual">ფიზიკური პირი</option>
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
              title={editId ? 'შენახვა' : 'დამატება'}
              className="self-end p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
            >
              {editId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
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
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditId(s.id);
                      setForm({ name: s.name, type: s.type, taxId: s.taxId || '', phone: s.phone || '' });
                    }}
                    title="რედაქტირება"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`წავშალოთ მიმწოდებელი „${s.name}"?`)) onDelete(s.id);
                    }}
                    title="წაშლა"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
