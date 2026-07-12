import React, { useState } from 'react';
import { Plus, Trash2, Building2, User, Pencil, Hash, Phone, Mail, Landmark, Copy, Check, X } from 'lucide-react';
import { Supplier, SupplierType, Expense } from '../types';
import { SUPPLIER_TYPE_LABELS } from '../data/defaults';

interface Props {
  suppliers: Supplier[];
  expenses: Expense[];
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
  email: string;
  iban: string;
  paysVat: boolean;
  paysIncomeTax: boolean;
  paysPension: boolean;
}

const emptyForm = (): SupplierForm => ({
  name: '',
  type: 'company',
  taxId: '',
  phone: '',
  email: '',
  iban: '',
  paysVat: false,
  paysIncomeTax: false,
  paysPension: false,
});

const gel = (n: number) => `${n.toLocaleString()} ₾`;

function copyText(text: string, done: () => void) {
  const ok = () => done();
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(ok).catch(() => fallback());
  } else fallback();
  function fallback() {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      ok();
    } catch {
      /* ignore */
    }
    document.body.removeChild(ta);
  }
}

export default function SuppliersList({ suppliers, expenses, canEdit, onAdd, onUpdate, onDelete }: Props) {
  const [form, setForm] = useState<SupplierForm>(emptyForm());
  const [editId, setEditId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('შეავსეთ მიმწოდებლის სახელი!');
    if (editId) onUpdate(editId, form);
    else onAdd(form);
    setForm(emptyForm());
    setEditId(null);
  };

  const startEdit = (s: Supplier) => {
    setEditId(s.id);
    setForm({
      name: s.name,
      type: s.type,
      taxId: s.taxId || '',
      phone: s.phone || '',
      email: s.email || '',
      iban: s.iban || '',
      paysVat: !!s.paysVat,
      paysIncomeTax: !!s.paysIncomeTax,
      paysPension: !!s.paysPension,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = (s: Supplier) => {
    const list = expenses.filter((e) => e.supplier === s.name || e.supplierId === s.id);
    const total = list.reduce((sum, e) => sum + Number(e.amountWithVat ?? e.amount ?? 0), 0);
    return { count: list.length, total };
  };

  const doCopy = (id: string, text: string) => {
    copyText(text, () => {
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-800">მიმწოდებლები</h2>
        <p className="text-xs text-slate-500 mt-1">იურიდიული პირები, ინდ. მეწარმეები და ფიზიკური პირები.</p>
      </div>

      {/* ADD / EDIT FORM */}
      {canEdit && (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {editId ? 'მიმწოდებლის რედაქტირება' : 'ახალი მიმწოდებელი'}
            </span>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm(emptyForm()); }} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">სახელი / დასახელება *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="შპს ან სახელი გვარი" className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">ტიპი</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as SupplierType })} className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                <option value="company">იურიდიული პირი</option>
                <option value="entrepreneur">ინდ. მეწარმე</option>
                <option value="individual">ფიზიკური პირი</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">ს/კ ან პ/ნ</label>
              <input value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">ტელეფონი</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">ელფოსტა</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">IBAN / ბანკის ანგარიში</label>
              <input value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} placeholder="GE00XX0000000000000000" className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm font-mono" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.paysVat} onChange={(e) => setForm({ ...form, paysVat: e.target.checked })} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-slate-700 font-semibold">დღგ-ს გადამხდელი</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.paysIncomeTax} onChange={(e) => setForm({ ...form, paysIncomeTax: e.target.checked })} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-slate-700 font-semibold">იხდის საშემოსავლოს</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.paysPension} onChange={(e) => setForm({ ...form, paysPension: e.target.checked })} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-slate-700 font-semibold">იხდის საპენსიოს</span>
            </label>
            <button type="submit" className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm">
              {editId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editId ? 'შენახვა' : 'დამატება'}
            </button>
          </div>
        </form>
      )}

      {/* CARDS */}
      {suppliers.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-12 bg-white rounded-2xl border border-slate-100">მიმწოდებლები ჯერ არ არის.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {suppliers.map((s) => {
            const st = stats(s);
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                {/* header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      {s.type === 'company' ? <Building2 className="h-6 w-6" /> : <User className="h-6 w-6" />}
                    </div>
                    <div className="min-w-0">
                      <span className="font-black text-slate-800 block truncate">{s.name}</span>
                      <span className="text-xs text-slate-400">{SUPPLIER_TYPE_LABELS[s.type]}</span>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => startEdit(s)} title="რედაქტირება" className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => confirm(`წავშალოთ „${s.name}"?`) && onDelete(s.id)} title="წაშლა" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* details */}
                <div className="space-y-2 text-sm border-t border-slate-50 pt-3">
                  {s.taxId && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Hash className="h-4 w-4 text-slate-400 shrink-0" /> ს/კ: <strong className="text-slate-800">{s.taxId}</strong>
                    </div>
                  )}
                  {s.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" /> {s.phone}
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-2 text-slate-600 min-w-0">
                      <Mail className="h-4 w-4 text-slate-400 shrink-0" /> <span className="truncate">{s.email}</span>
                    </div>
                  )}
                  {s.iban && (
                    <div className="flex items-center gap-2 text-slate-600 min-w-0">
                      <Landmark className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="font-mono text-xs truncate">{s.iban}</span>
                      <button
                        onClick={() => doCopy(s.id, s.iban!)}
                        title="კოპირება"
                        className={`ml-auto shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold ${copied === s.id ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {copied === s.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copied === s.id ? 'დაკოპირდა' : 'კოპირება'}
                      </button>
                    </div>
                  )}
                </div>

                {/* tax flags */}
                <div className="flex flex-wrap gap-2 border-t border-slate-50 pt-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${s.paysVat ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    დღგ: {s.paysVat ? 'იხდის ✓' : 'არ იხდის ✗'}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${s.paysIncomeTax ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    საშემოსავლო: {s.paysIncomeTax ? 'იხდის ✓' : 'არ იხდის ✗'}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${s.paysPension ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    საპენსიო: {s.paysPension ? 'იხდის ✓' : 'არ იხდის ✗'}
                  </span>
                </div>

                {/* totals */}
                <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block">სულ შესყიდვები</span>
                    <span className="font-bold text-slate-800">{st.count} ხარჯი</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">ჯამური ბრუნვა</span>
                    <span className="font-black text-indigo-600">{gel(st.total)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
