import React, { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import { Expense, ExpenseStatus, Category, Supplier } from '../types';
import { STATUS_LABELS, STATUS_STYLES } from '../data/defaults';

interface Props {
  expenses: Expense[];
  categories: Category[];
  suppliers: Supplier[];
  canEdit: boolean;
  onAdd: (data: ExpenseForm) => void;
  onUpdate: (id: string, data: ExpenseForm) => void;
  onDelete: (id: string) => void;
}

export interface ExpenseForm {
  title: string;
  category: string;
  supplier: string;
  amount: number;
  date: string;
  status: ExpenseStatus;
  note: string;
}

const gel = (n: number) => `${n.toLocaleString()} ₾`;
const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): ExpenseForm => ({
  title: '',
  category: '',
  supplier: '',
  amount: 0,
  date: today(),
  status: 'draft',
  note: '',
});

export default function ExpensesList({
  expenses,
  categories,
  suppliers,
  canEdit,
  onAdd,
  onUpdate,
  onDelete,
}: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ExpenseForm>(emptyForm());

  const filtered = useMemo(() => {
    return expenses
      .filter((e) => (statusFilter === 'all' ? true : e.status === statusFilter))
      .filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          (e.category || '').toLowerCase().includes(search.toLowerCase()) ||
          (e.supplier || '').toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => (b.date > a.date ? 1 : -1));
  }, [expenses, search, statusFilter]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (e: Expense) => {
    setEditId(e.id);
    setForm({
      title: e.title,
      category: e.category || '',
      supplier: e.supplier || '',
      amount: e.amount,
      date: e.date,
      status: e.status,
      note: e.note || '',
    });
    setModalOpen(true);
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.title.trim() || !form.amount) {
      alert('შეავსეთ დასახელება და თანხა!');
      return;
    }
    if (editId) onUpdate(editId, form);
    else onAdd(form);
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-slate-800">ხარჯები</h2>
          <p className="text-xs text-slate-500 mt-1">
            ხარჯების, ხელფასებისა და ფიზ. პირებზე გადახდების ერთიანი რეესტრი.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm"
          >
            <Plus className="h-4 w-4" /> ახალი ხარჯი
          </button>
        )}
      </div>

      {/* FILTERS */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ძებნა..."
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ExpenseStatus | 'all')}
          className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
        >
          <option value="all">ყველა სტატუსი</option>
          {(Object.keys(STATUS_LABELS) as ExpenseStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-12">ხარჯები ვერ მოიძებნა.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-slate-400 font-bold uppercase border-b border-slate-100">
                  <th className="px-4 py-3">დასახელება</th>
                  <th className="px-4 py-3 hidden md:table-cell">კატეგორია</th>
                  <th className="px-4 py-3 hidden lg:table-cell">მიმღები</th>
                  <th className="px-4 py-3">თანხა</th>
                  <th className="px-4 py-3 hidden sm:table-cell">თარიღი</th>
                  <th className="px-4 py-3">სტატუსი</th>
                  {canEdit && <th className="px-4 py-3 text-right">მოქმედება</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {e.title}
                      {e.note && <span className="block text-[11px] text-slate-400 font-normal">{e.note}</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{e.category || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{e.supplier || '—'}</td>
                    <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">{gel(e.amount)}</td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell whitespace-nowrap">{e.date}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLES[e.status]}`}>
                        {STATUS_LABELS[e.status]}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => openEdit(e)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`წავშალოთ ხარჯი „${e.title}"?`)) onDelete(e.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="font-bold text-slate-800">{editId ? 'ხარჯის რედაქტირება' : 'ახალი ხარჯი'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">დასახელება *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="მაგ: ბეტონის შესყიდვა / ხელფასი — გიორგი"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm"
                />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">კატეგორია</label>
                  <input
                    list="cat-list"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="ჩაწერეთ ან აირჩიეთ"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm"
                  />
                  <datalist id="cat-list">
                    {categories.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                    <option value="ხელფასი" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">მიმღები / მიმწოდებელი</label>
                  <input
                    list="sup-list"
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                    placeholder="ჩაწერეთ ან აირჩიეთ"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm"
                  />
                  <datalist id="sup-list">
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">სტატუსი</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ExpenseStatus })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm"
                >
                  {(Object.keys(STATUS_LABELS) as ExpenseStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">შენიშვნა</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm resize-none"
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
                  {editId ? 'შენახვა' : 'დამატება'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
