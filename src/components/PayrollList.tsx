/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Calculator, 
  FileCheck, 
  DollarSign, 
  ArrowRight,
  Sparkles,
  Search,
  MessageSquare,
  Percent,
  X,
  CreditCard
} from 'lucide-react';
import { PayrollOrIndividualService, TaxSettings, UserRole } from '../types';

interface PayrollListProps {
  payrollList: PayrollOrIndividualService[];
  taxSettings: TaxSettings;
  currentUserRole: UserRole;
  onAddPayroll: (payroll: Omit<PayrollOrIndividualService, 'id' | 'createdAt'>) => void;
  onUpdatePayrollStatus: (id: string, updates: Partial<PayrollOrIndividualService>) => void;
}

export default function PayrollList({
  payrollList,
  taxSettings,
  currentUserRole,
  onAddPayroll,
  onUpdatePayrollStatus
}: PayrollListProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Payroll Form States
  const [name, setName] = useState('');
  const [personalId, setPersonalId] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [contractDate, setContractDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [grossAmount, setGrossAmount] = useState<number>(0);
  const [netAmount, setNetAmount] = useState<number>(0);
  const [taxesAmount, setTaxesAmount] = useState<number>(0);
  const [pensionDeduction, setPensionDeduction] = useState<number>(0);
  const [usePension, setUsePension] = useState(false);
  const [hasAcceptanceAct, setHasAcceptanceAct] = useState(false);
  const [hasPaymentDoc, setHasPaymentDoc] = useState(false);
  const [accountantComment, setAccountantComment] = useState('');

  // Handle Dynamic calculations when Gross Amount changes
  const handleGrossChange = (gross: number) => {
    setGrossAmount(gross);
    recalculateTaxes(gross, usePension);
  };

  const handlePensionToggle = (checked: boolean) => {
    setUsePension(checked);
    recalculateTaxes(grossAmount, checked);
  };

  const recalculateTaxes = (gross: number, pensionActive: boolean) => {
    // 20% Income Tax
    const incomeTax = parseFloat((gross * (taxSettings.incomeTaxPercent / 100)).toFixed(2));
    
    // Pension Deductions (2% Employee + 2% Employer = 4% Total or just 2% from employee gross)
    const employeePension = pensionActive ? parseFloat((gross * (taxSettings.pensionEmployeePercent / 100)).toFixed(2)) : 0;
    const employerPension = pensionActive ? parseFloat((gross * (taxSettings.pensionEmployerPercent / 100)).toFixed(2)) : 0;
    
    const totalTaxes = incomeTax;
    const totalPension = employeePension + employerPension;
    const net = parseFloat((gross - incomeTax - employeePension).toFixed(2));

    setTaxesAmount(totalTaxes);
    setPensionDeduction(totalPension);
    setNetAmount(net);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !personalId || !contractNumber || !grossAmount) {
      alert('გთხოვთ შეავსოთ სავალდებულო ველები!');
      return;
    }

    onAddPayroll({
      name,
      personalId,
      workDescription,
      contractNumber,
      contractDate,
      startDate,
      endDate,
      grossAmount: Number(grossAmount),
      netAmount: Number(netAmount),
      taxesAmount: Number(taxesAmount),
      pensionDeduction: Number(pensionDeduction),
      hasAcceptanceAct,
      hasPaymentDoc,
      accountantComment: accountantComment || undefined
    });

    // Reset Form
    setName('');
    setPersonalId('');
    setWorkDescription('');
    setContractNumber('');
    setContractDate('');
    setStartDate('');
    setEndDate('');
    setGrossAmount(0);
    setNetAmount(0);
    setTaxesAmount(0);
    setPensionDeduction(0);
    setUsePension(false);
    setHasAcceptanceAct(false);
    setHasPaymentDoc(false);
    setAccountantComment('');
    setIsAddModalOpen(false);
  };

  // Filter payroll list
  const filteredPayroll = payrollList.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.personalId.includes(searchTerm) || 
    item.contractNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" id="payroll-section-root">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">ხელფასები & ფიზიკური პირები</h2>
          <p className="text-xs text-slate-500 mt-1">
            ინდივიდუალური მომსახურების ხელშეკრულებების, საშემოსავლო გადასახადებისა და საპენსიო ანარიცხების აღრიცხვა.
          </p>
        </div>
        
        {currentUserRole !== 'viewer' && currentUserRole !== 'uploader' && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            კონტრაქტის დამატება
          </button>
        )}
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-xs">
          <span className="text-slate-400 block font-medium">სულ ხელშეკრულებები</span>
          <span className="text-xl font-black text-slate-800 block mt-1">{payrollList.length} პირი</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-xs">
          <span className="text-slate-400 block font-medium">ჯამური დარიცხული</span>
          <span className="text-xl font-black text-slate-800 block mt-1">
            {payrollList.reduce((s,p)=>s+p.grossAmount, 0).toLocaleString()} GEL
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-xs">
          <span className="text-slate-400 block font-medium">გადასარიცხი საშემოსავლო (20%)</span>
          <span className="text-xl font-black text-amber-600 block mt-1">
            {payrollList.reduce((s,p)=>s+p.taxesAmount, 0).toLocaleString()} GEL
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-xs">
          <span className="text-slate-400 block font-medium">ხელზე გასაცემი თანხა</span>
          <span className="text-xl font-black text-emerald-600 block mt-1">
            {payrollList.reduce((s,p)=>s+p.netAmount, 0).toLocaleString()} GEL
          </span>
        </div>
      </div>

      {/* Searching */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative">
        <Search className="absolute left-7 top-7 h-4 w-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="ძებნა სახელით, პირადი ნომრით, ხელშეკრულებით..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50/50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
        />
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-4">სახელი & პირადი ნომერი</th>
                <th className="p-4">სამუშაო & ხელშეკრულება</th>
                <th className="p-4 text-right">დარიცხული</th>
                <th className="p-4 text-right">საშემოსავლო (20%)</th>
                <th className="p-4 text-right">ხელზე</th>
                <th className="p-4 text-center">დოკუმენტები</th>
                <th className="p-4">ბუღალტრის კომენტარი</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPayroll.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 block">{item.name}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">პ/ნ: {item.personalId}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <span className="font-medium text-slate-700 block max-w-xs truncate">{item.workDescription}</span>
                      <span className="text-[10px] text-slate-400 block">ხელშეკრულება: #{item.contractNumber} ({item.contractDate})</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-semibold text-slate-800">
                    {item.grossAmount.toLocaleString()} GEL
                  </td>
                  <td className="p-4 text-right font-medium text-amber-600">
                    {item.taxesAmount.toLocaleString()} GEL
                  </td>
                  <td className="p-4 text-right font-black text-indigo-700">
                    {item.netAmount.toLocaleString()} GEL
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center items-center gap-1.5">
                      <button 
                        onClick={() => {
                          if (currentUserRole !== 'viewer' && currentUserRole !== 'uploader') {
                            onUpdatePayrollStatus(item.id, { hasAcceptanceAct: !item.hasAcceptanceAct });
                          }
                        }}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                          item.hasAcceptanceAct 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        აქტი: {item.hasAcceptanceAct ? 'კი' : 'არა'}
                      </button>
                      <button 
                        onClick={() => {
                          if (currentUserRole !== 'viewer' && currentUserRole !== 'uploader') {
                            onUpdatePayrollStatus(item.id, { hasPaymentDoc: !item.hasPaymentDoc });
                          }
                        }}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                          item.hasPaymentDoc 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        ქვითარი: {item.hasPaymentDoc ? 'კი' : 'არა'}
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    {item.accountantComment ? (
                      <span className="text-slate-500 max-w-xs block truncate" title={item.accountantComment}>
                        {item.accountantComment}
                      </span>
                    ) : (
                      <span className="text-slate-300 italic">კომენტარი არ არის</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredPayroll.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">ხელშეკრულებები ვერ მოიძებნა.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD PAYROLL CONTRACT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">ფიზიკურ პირთან ხელშეკრულების რეგისტრაცია</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Full name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">სახელი და გვარი *</label>
                  <input 
                    type="text" 
                    placeholder="მაგ: გიორგი კალანდაძე"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
                  />
                </div>

                {/* Personal ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">პირადი ნომერი (11 ნიშნა) *</label>
                  <input 
                    type="text" 
                    placeholder="მაგ: 01024099882"
                    required
                    maxLength={11}
                    value={personalId}
                    onChange={(e) => setPersonalId(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-mono"
                  />
                </div>

                {/* Work description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">შესასრულებელი სამუშაოს აღწერა</label>
                  <input 
                    type="text" 
                    placeholder="მაგ: სამრეცხაო ბლოკების ელექტრო ფარების და აპარატების მონტაჟი"
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
                  />
                </div>

                {/* Contract info */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ხელშეკრულების ნომერი *</label>
                  <input 
                    type="text" 
                    placeholder="CTR-2026-X"
                    required
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">გაფორმების თარიღი</label>
                  <input 
                    type="date" 
                    value={contractDate}
                    onChange={(e) => setContractDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">სამუშაოს დაწყება</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">სამუშაოს დასრულება</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700"
                  />
                </div>

                {/* Gross Amount and Tax Calculation panel */}
                <div className="md:col-span-2 bg-indigo-50/20 p-4 rounded-xl border border-indigo-100/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                      <Calculator className="h-4 w-4" />
                      გადასახადების ავტომატური კალკულატორი
                    </span>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={usePension}
                        onChange={(e) => handlePensionToggle(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                      />
                      <span className="text-xs text-indigo-900 font-medium">საპენსიო ანარიცხი (2%+2%)</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">დარიცხული თანხა *</label>
                      <input 
                        type="number" 
                        required
                        placeholder="მაგ: 2000"
                        value={grossAmount || ''}
                        onChange={(e) => handleGrossChange(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">საშემოსავლო (20%)</label>
                      <input 
                        type="number" 
                        disabled 
                        value={taxesAmount || ''}
                        className="w-full px-2.5 py-1.5 bg-slate-100 rounded-lg border border-slate-100 text-slate-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">საპენსიო (4% ჯამი)</label>
                      <input 
                        type="number" 
                        disabled 
                        value={pensionDeduction || ''}
                        className="w-full px-2.5 py-1.5 bg-slate-100 rounded-lg border border-slate-100 text-slate-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-indigo-900 font-semibold mb-1">ხელზე ასაღები</label>
                      <input 
                        type="number" 
                        disabled
                        value={netAmount || ''}
                        className="w-full px-2.5 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100 text-indigo-700 font-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Checklists and files status */}
                <div>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer mt-4">
                    <input 
                      type="checkbox" 
                      checked={hasAcceptanceAct}
                      onChange={(e) => setHasAcceptanceAct(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                    />
                    <span className="text-xs text-slate-700 font-semibold">მიღება-ჩაბარების აქტი გაფორმებულია</span>
                  </label>
                </div>

                <div>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer mt-4">
                    <input 
                      type="checkbox" 
                      checked={hasPaymentDoc}
                      onChange={(e) => setHasPaymentDoc(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                    />
                    <span className="text-xs text-slate-700 font-semibold">საბანკო ქვითარი არსებობს</span>
                  </label>
                </div>

                {/* Accountant comment */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ბუღალტრის კომენტარი/აღნიშვნა</label>
                  <textarea 
                    rows={2}
                    placeholder="მაგ: ხელოსანს გაეზარდა მოცულობა, საშემოსავლო დეკლარირებულია..."
                    value={accountantComment}
                    onChange={(e) => setAccountantComment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 focus:ring-2"
                  />
                </div>

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
                  კონტრაქტის შენახვა
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
