import React, { useMemo, useState } from 'react';
import { Calculator, CopyPlus, Plus, Trash2, FolderPlus, Save, FileSpreadsheet } from 'lucide-react';
import { CostEstimate, CostEstimateItem } from '../types';

interface BudgetEstimatorProps {
  estimates: CostEstimate[];
  currentUserName: string;
  canEdit: boolean;
  onAdd: (estimate: Omit<CostEstimate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (estimateId: string, patch: Partial<CostEstimate>) => void;
  onDelete: (estimateId: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_ITEMS: CostEstimateItem[] = [
  { id: uid(), section: 'მიწის სამუშაოები და ინფრასტრუქტურა', name: 'საკადასტრო ნახაზი', quantity: 1, unitPrice: 140 },
  { id: uid(), section: 'მიწის სამუშაოები და ინფრასტრუქტურა', name: 'გიორგი არქიტექტორი', quantity: 1, unitPrice: 1000 },
  { id: uid(), section: 'მიწის სამუშაოები და ინფრასტრუქტურა', name: 'ტრაქტორი მიწის მოჭრა გასწორება', quantity: 2, unitPrice: 500 },
  { id: uid(), section: 'მიწის სამუშაოები და ინფრასტრუქტურა', name: 'ბეტონის ხელოსანი - ხელფასი', quantity: 1, unitPrice: 0 },
  { id: uid(), section: 'მიწის სამუშაოები და ინფრასტრუქტურა', name: 'არმატურა, ბეტონი, სალექრი, კალოდეცი და ყველაფერი', quantity: 1, unitPrice: 0 },
  { id: uid(), section: 'მიწის სამუშაოები და ინფრასტრუქტურა', name: 'წყლის გაყვანა', quantity: 1, unitPrice: 200 },
  { id: uid(), section: 'მიწის სამუშაოები და ინფრასტრუქტურა', name: 'სანიაღვრე რკინები', quantity: 1, unitPrice: 1000, note: 'დენის მრიცხველი 3 ფაზა 900ლ' },
  { id: uid(), section: 'მიწის სამუშაოები და ინფრასტრუქტურა', name: 'წყლის რეზერვუარი', quantity: 1, unitPrice: 400, note: 'წყლის მრიცხველი' },
  { id: uid(), section: 'მიწის სამუშაოები და ინფრასტრუქტურა', name: '3 ფაზა დენი', quantity: 1, unitPrice: 900 },
  { id: uid(), section: 'მიწის სამუშაოები და ინფრასტრუქტურა', name: 'ბუღალტერი', quantity: 1, unitPrice: 0 },
  { id: uid(), section: 'კონსტრუქცია', name: 'რკინის კონსტრუქცია', quantity: 1, unitPrice: 1000 },
  { id: uid(), section: 'კონსტრუქცია', name: 'გვერდითი პანელები მეტალოგრანიტი', quantity: 1, unitPrice: 11.2 },
  { id: uid(), section: 'კონსტრუქცია', name: 'უკნიდან შემოღობვა', quantity: 1, unitPrice: 11.2 },
  { id: uid(), section: 'კონსტრუქცია', name: 'სახურავი', quantity: 1, unitPrice: 11.2 },
  { id: uid(), section: 'კონსტრუქცია', name: 'სპიჭკატრუბა 6მ', quantity: 8, unitPrice: 0 },
  { id: uid(), section: 'კონსტრუქცია', name: 'სვარჩიკი', quantity: 1, unitPrice: 2000 },
  { id: uid(), section: 'აღჭურვილობა და ტექნიკა', name: 'კერხერები', quantity: 3, unitPrice: 6700, note: '3 ცალი × 6 500 ₾' },
  { id: uid(), section: 'აღჭურვილობა და ტექნიკა', name: 'საბურავების წნევის დასამატებელი (კომპრესორი)+ მტვერსასრუტი', quantity: 1, unitPrice: 2200 },
  { id: uid(), section: 'აღჭურვილობა და ტექნიკა', name: 'ფულის დასახურდავებელი აპარატი', quantity: 1, unitPrice: 2500 },
  { id: uid(), section: 'აღჭურვილობა და ტექნიკა', name: 'კამერები', quantity: 2, unitPrice: 750, note: '2 ცალი × 750 ₾' },
  { id: uid(), section: 'აღჭურვილობა და ტექნიკა', name: 'ტილოს საწური', quantity: 1, unitPrice: 250 },
  { id: uid(), section: 'აღჭურვილობა და ტექნიკა', name: 'ნაგვის ურნა', quantity: 1, unitPrice: 120 },
  { id: uid(), section: 'განათება', name: 'განათებები', quantity: 1, unitPrice: 1000 },
  { id: uid(), section: 'განათება', name: 'განათებების მონტაჟი', quantity: 1, unitPrice: 500 },
  { id: uid(), section: 'გაუთვალისწინებელი ხარჯები', name: 'იპოთეკით დატვირთვა', quantity: 1, unitPrice: 150 },
];

const money = (value: number) => value.toLocaleString('ka-GE', { maximumFractionDigits: 2 });
const itemTotal = (item: CostEstimateItem) => Number(item.quantity || 0) * Number(item.unitPrice || 0);

export default function BudgetEstimator({
  estimates,
  currentUserName,
  canEdit,
  onAdd,
  onUpdate,
  onDelete,
}: BudgetEstimatorProps) {
  const [selectedId, setSelectedId] = useState('');
  const selected = estimates.find((e) => e.id === selectedId) || estimates[0] || null;

  const sections = useMemo(() => {
    if (!selected) return [];
    const names = Array.from(new Set(selected.items.map((item) => item.section || 'სხვა')));
    return names.map((name) => {
      const items = selected.items.filter((item) => (item.section || 'სხვა') === name);
      return { name, items, subtotal: items.reduce((sum, item) => sum + itemTotal(item), 0) };
    });
  }, [selected]);

  const total = selected?.items.reduce((sum, item) => sum + itemTotal(item), 0) || 0;

  const createEstimate = (empty = false) => {
    onAdd({
      title: empty ? 'ახალი საორიენტაციო კალკულაცია' : 'სამრეცხაოს მშენებლობის ბიუჯეტი',
      location: empty ? '' : 'ჩაბინაანი, ახმეტა',
      items: empty ? [] : DEFAULT_ITEMS.map((item) => ({ ...item, id: uid() })),
      createdByName: currentUserName,
    });
  };

  const updateItems = (items: CostEstimateItem[]) => {
    if (!selected) return;
    onUpdate(selected.id, { items });
  };

  const updateItem = (itemId: string, patch: Partial<CostEstimateItem>) => {
    if (!selected) return;
    updateItems(selected.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)));
  };

  const addSection = () => {
    if (!selected) return;
    const section = prompt('სექციის დასახელება');
    if (!section?.trim()) return;
    updateItems([...selected.items, { id: uid(), section: section.trim(), name: 'ახალი ხარჯი', quantity: 1, unitPrice: 0 }]);
  };

  const addItem = (section: string) => {
    if (!selected) return;
    updateItems([...selected.items, { id: uid(), section, name: 'ახალი ხარჯი', quantity: 1, unitPrice: 0 }]);
  };

  const deleteItem = (itemId: string) => {
    if (!selected || !confirm('წავშალოთ ეს სტრიქონი?')) return;
    updateItems(selected.items.filter((item) => item.id !== itemId));
  };

  const deleteEstimate = () => {
    if (!selected) return;
    if (!confirm(`წავშალოთ კალკულაცია „${selected.title}”?`)) return;
    onDelete(selected.id);
    setSelectedId('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-indigo-600" />
            საორიენტაციო ხარჯების კალკულატორი
          </h2>
          <p className="text-xs text-slate-500 mt-1">ცალკე სამუშაო პანელი. არ ცვლის ხარჯების რეესტრს, გადახდებს ან მთავარ ბიუჯეტს.</p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <button onClick={() => createEstimate(false)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm">
              <FileSpreadsheet className="h-4 w-4" />
              Excel-ის შაბლონით
            </button>
            <button onClick={() => createEstimate(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-sm">
              <Plus className="h-4 w-4" />
              ცარიელი
            </button>
          </div>
        )}
      </div>

      {estimates.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center space-y-4">
          <FileSpreadsheet className="h-10 w-10 text-slate-300 mx-auto" />
          <div>
            <h3 className="font-black text-slate-800">კალკულაცია ჯერ არ არის შექმნილი</h3>
            <p className="text-xs text-slate-400 mt-1">შექმენით Excel-ის შაბლონით ან ცარიელი ვერსიით.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-5">
          <aside className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 space-y-2 h-fit">
            {estimates.map((estimate) => {
              const estimateTotal = estimate.items.reduce((sum, item) => sum + itemTotal(item), 0);
              const active = selected?.id === estimate.id;
              return (
                <button
                  key={estimate.id}
                  onClick={() => setSelectedId(estimate.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${active ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'}`}
                >
                  <span className="font-bold text-xs block truncate">{estimate.title}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">{money(estimateTotal)} ₾</span>
                </button>
              );
            })}
          </aside>

          {selected && (
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 flex-wrap">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-w-[260px]">
                  <input
                    value={selected.title}
                    disabled={!canEdit}
                    onChange={(e) => onUpdate(selected.id, { title: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800"
                  />
                  <input
                    value={selected.location || ''}
                    disabled={!canEdit}
                    onChange={(e) => onUpdate(selected.id, { location: e.target.value })}
                    placeholder="ლოკაცია / შენიშვნა"
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600"
                  />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">ჯამური ბიუჯეტი</span>
                  <div className="text-2xl font-black text-indigo-600">{money(total)} ₾</div>
                  {canEdit && (
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={addSection} className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg">
                        <FolderPlus className="h-3.5 w-3.5" />
                        სექცია
                      </button>
                      <button onClick={deleteEstimate} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold rounded-lg">
                        <Trash2 className="h-3.5 w-3.5" />
                        წაშლა
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {sections.map((section) => (
                  <div key={section.name} className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-black text-sm text-slate-800">{section.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg">{money(section.subtotal)} ₾</span>
                        {canEdit && (
                          <button onClick={() => addItem(section.name)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="სტრიქონის დამატება">
                            <CopyPlus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-100">
                      <table className="w-full table-fixed text-xs">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="p-2 text-left w-[34%]">დასახელება</th>
                            <th className="p-2 text-right w-[10%]">რაოდ.</th>
                            <th className="p-2 text-right w-[14%]">ერთ. ფასი</th>
                            <th className="p-2 text-right w-[14%]">ჯამი</th>
                            <th className="p-2 text-left w-[22%]">შენიშვნა</th>
                            {canEdit && <th className="p-2 w-[6%]" />}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {section.items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/60">
                              <td className="p-2">
                                <input value={item.name} disabled={!canEdit} onChange={(e) => updateItem(item.id, { name: e.target.value })} className="w-full bg-transparent font-semibold text-slate-700 outline-none" />
                              </td>
                              <td className="p-2">
                                <input type="number" step="0.01" value={item.quantity || ''} disabled={!canEdit} onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })} className="w-full bg-transparent text-right font-bold text-slate-700 outline-none" />
                              </td>
                              <td className="p-2">
                                <input type="number" step="0.01" value={item.unitPrice || ''} disabled={!canEdit} onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })} className="w-full bg-transparent text-right font-bold text-slate-700 outline-none" />
                              </td>
                              <td className="p-2 text-right font-black text-slate-900">{money(itemTotal(item))} ₾</td>
                              <td className="p-2">
                                <input value={item.note || ''} disabled={!canEdit} onChange={(e) => updateItem(item.id, { note: e.target.value })} className="w-full bg-transparent text-slate-500 outline-none" />
                              </td>
                              {canEdit && (
                                <td className="p-2 text-right">
                                  <button onClick={() => deleteItem(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="წაშლა">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {selected.items.length === 0 && (
                  <div className="p-10 text-center text-slate-400 text-sm">
                    <Save className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    ჯერ სტრიქონები არ არის. დაამატეთ სექცია.
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
