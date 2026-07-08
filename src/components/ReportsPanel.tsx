/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, Download, Printer, CheckCircle, AlertTriangle, Landmark, Calendar, FileCheck, Coins } from 'lucide-react';
import { Expense, Category, Supplier, Payment, Document, PayrollOrIndividualService, Tranche, ExpenseStatus } from '../types';
import { PAYMENT_METHOD_LABELS, STATUS_LABELS } from '../data/defaults';

interface ReportsPanelProps {
  expenses: Expense[];
  categories: Category[];
  suppliers: Supplier[];
  payments: Payment[];
  documents: Document[];
  payrollList: PayrollOrIndividualService[];
  tranches: Tranche[];
}

type ReportType = 
  | 'full_expenses'
  | 'by_category'
  | 'by_supplier'
  | 'payments'
  | 'missing_docs'
  | 'rs_ge'
  | 'individual_services'
  | 'contracts_registry'
  | 'acceptance_registry'
  | 'budget_utilization'
  | 'final_grant_report';

export default function ReportsPanel({
  expenses,
  categories,
  suppliers,
  payments,
  documents,
  payrollList,
  tranches
}: ReportsPanelProps) {
  
  const [activeReport, setActiveReport] = useState<ReportType>('full_expenses');

  // Math helpers
  const totalApprovedPaid = payments
    .filter(p => p.status === 'approved' && expenses.find(e => e.id === p.expenseId)?.status === ExpenseStatus.Approved)
    .reduce((s, p) => s + p.amount, 0);

  const totalSpentAll = payments
    .filter(p => p.status === 'approved')
    .reduce((s, p) => s + p.amount, 0);

  const totalBudget = 50000;

  const reportTitle = {
    full_expenses: 'სრული ხარჯების ანგარიში',
    by_category: 'ხარჯები კატეგორიების მიხედვით',
    by_supplier: 'ხარჯები მიმწოდებლებით',
    payments: 'გადახდების ანგარიში',
    missing_docs: 'არასრული დოკუმენტები',
    rs_ge: 'RS.GE დოკუმენტების რეესტრი',
    individual_services: 'ფიზ. პირების მომსახურება',
    contracts_registry: 'ხელშეკრულებების რეესტრი',
    acceptance_registry: 'მიღება-ჩაბარების რეესტრი',
    budget_utilization: 'ბიუჯეტის ათვისების ანგარიში',
    final_grant_report: 'პროექტის საბოლოო ანგარიში',
  }[activeReport];

  const downloadFile = (content: string, fileName: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = () => {
    const esc = (value: unknown) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    const rows = expenses.map((e) => {
      const category = categories.find((c) => c.id === e.categoryId)?.name || e.categoryId;
      const supplier = suppliers.find((s) => s.id === e.supplierId)?.name || e.supplierId;
      const paid = payments.filter((p) => p.expenseId === e.id && p.status === 'approved').reduce((s, p) => s + p.amount, 0);
      return `
        <tr>
          <td>${esc(e.title)}</td>
          <td>${esc(category)}</td>
          <td>${esc(supplier)}</td>
          <td>${esc(e.invoiceNumber || '')}</td>
          <td>${esc(e.invoiceDate || '')}</td>
          <td>${esc(e.amountNoVat.toFixed(2))}</td>
          <td>${esc(e.vat.toFixed(2))}</td>
          <td>${esc(e.amountWithVat.toFixed(2))}</td>
          <td>${esc(paid.toFixed(2))}</td>
          <td>${esc(STATUS_LABELS[e.status] || e.status)}</td>
        </tr>`;
    }).join('');
    const html = `<!doctype html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body>
          <h2>${esc(reportTitle)}</h2>
          <p>მომზადების თარიღი: ${new Date().toISOString().slice(0, 10)}</p>
          <table border="1">
            <thead>
              <tr>
                <th>ხარჯი</th><th>კატეგორია</th><th>მიმწოდებელი</th><th>დოკ. ნომერი</th><th>თარიღი</th>
                <th>დღგ-ს გარეშე</th><th>დღგ</th><th>ჯამი</th><th>გადახდილი</th><th>სტატუსი</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>`;
    downloadFile(
      html,
      `carwashdoc_${activeReport}_${new Date().toISOString().slice(0, 10)}.xls`,
      'application/vnd.ms-excel;charset=utf-8',
    );
  };

  const handlePrint = () => {
    const report = document.querySelector('.printable-report')?.innerHTML || '';
    const popup = window.open('', '_blank', 'width=1200,height=800');
    if (!popup) {
      window.print();
      return;
    }
    popup.document.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${reportTitle}</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #0f172a; padding: 28px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background: #f8fafc; }
            .shadow-sm, .rounded-2xl, .rounded-xl { box-shadow: none !important; }
            button { display: none !important; }
          </style>
        </head>
        <body>${report}</body>
      </html>`);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  return (
    <div className="space-y-6" id="reports-section-root">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight font-sans">ანგარიშები & ექსპორტის პორტალი</h2>
          <p className="text-xs text-slate-500 mt-1">
            „აწარმოე საქართველოში“ გრანტის მონიტორინგისთვის განკუთვნილი ოფიციალური და შიდა აუდიტის ანგარიშგება.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleDownloadExcel}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Download className="h-4 w-4" />
            ჩამოტვირთვა (Excel / XLSX)
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Printer className="h-4 w-4" />
            ბეჭდვა (PDF)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Reports Side Navigation list */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3 mb-2">ანგარიშის ტიპი</span>
          {[
            { id: 'full_expenses', name: 'სრული ხარჯების ანგარიში' },
            { id: 'by_category', name: 'ხარჯები კატეგორიების მიხედვით' },
            { id: 'by_supplier', name: 'ხარჯები მიმწოდებლებით' },
            { id: 'payments', name: 'გადახდების ანგარიში' },
            { id: 'missing_docs', name: 'არასრული დოკუმენტები' },
            { id: 'rs_ge', name: 'RS.GE დოკუმენტების რეესტრი' },
            { id: 'individual_services', name: 'ფიზ. პირების მომსახურება' },
            { id: 'contracts_registry', name: 'ხელშეკრულებების რეესტრი' },
            { id: 'acceptance_registry', name: 'მიღება-ჩაბარების რეესტრი' },
            { id: 'budget_utilization', name: '50,000 ლ ბიუჯეტის ანგარიში' },
            { id: 'final_grant_report', name: 'პროექტის საბოლოო ანგარიში' }
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setActiveReport(r.id as ReportType)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all block ${
                activeReport === r.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* Report Content Panel */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 printable-report">
          
          {/* Printable Report Header */}
          <div className="border-b border-slate-100 pb-6 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">ოფიციალური უწყისი</span>
                <h3 className="text-lg font-black text-slate-800">ბიზნესის თანადაფინანსების ანგარიშგება</h3>
                <p className="text-xs text-slate-400">პროექტი: ავტომანქანის თვითმომსახურების სამრეცხაო მშენებლობა</p>
              </div>
              <div className="text-right text-xs space-y-1 text-slate-500">
                <span>მომზადების თარიღი: <strong>{new Date().toISOString().split('T')[0]}</strong></span>
                <span className="block">ვალუტა: <strong>GEL (ლარი)</strong></span>
                <span className="block text-[10px]">პროგრამა: <strong>აწარმოე საქართველოში</strong></span>
              </div>
            </div>

            {/* Quick KPIs printed */}
            <div className="grid grid-cols-3 gap-4 pt-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-medium">სრული გრანტი</span>
                <strong className="text-slate-800 font-bold block mt-1">50,000.00 GEL</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-medium">ათვისებული (ფაქტი)</span>
                <strong className="text-emerald-600 font-bold block mt-1">{totalSpentAll.toLocaleString()} GEL</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-medium">თავისუფალი დარჩენილი</span>
                <strong className="text-indigo-600 font-bold block mt-1">{(totalBudget - totalSpentAll).toLocaleString()} GEL</strong>
              </div>
            </div>
          </div>

          {/* REPORT VIEW 1: FULL EXPENSES */}
          {activeReport === 'full_expenses' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">სრული ხარჯების რეესტრი</h4>
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">ხარჯის დასახელება</th>
                      <th className="p-3">კატეგორია</th>
                      <th className="p-3">მიმწოდებელი</th>
                      <th className="p-3 text-right">დღგ-ს გარეშე</th>
                      <th className="p-3 text-right">დღგ</th>
                      <th className="p-3 text-right">ჯამი დღგ-ით</th>
                      <th className="p-3">სტატუსი</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.map(e => (
                      <tr key={e.id} className="text-slate-700">
                        <td className="p-3 font-semibold text-slate-900">{e.title}</td>
                        <td className="p-3">{categories.find(c => c.id === e.categoryId)?.name}</td>
                        <td className="p-3">{suppliers.find(s => s.id === e.supplierId)?.name}</td>
                        <td className="p-3 text-right">{e.amountNoVat.toLocaleString()}</td>
                        <td className="p-3 text-right">{e.vat.toLocaleString()}</td>
                        <td className="p-3 text-right font-bold text-slate-900">{e.amountWithVat.toLocaleString()}</td>
                        <td className="p-3 font-medium text-xs">{STATUS_LABELS[e.status] || e.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT VIEW 2: BY CATEGORY */}
          {activeReport === 'by_category' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">ხარჯები კატეგორიების ჭრილში</h4>
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">კატეგორია</th>
                      <th className="p-3 text-right">დაგეგმილი ბიუჯეტი</th>
                      <th className="p-3 text-right">ფაქტობრივი ხარჯი</th>
                      <th className="p-3 text-right">დარჩენილი ბიუჯეტი</th>
                      <th className="p-3">დაფინანსებადობა (გრანტით)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {categories.map(cat => {
                      const actualSpent = expenses
                        .filter(e => e.categoryId === cat.id && e.status !== ExpenseStatus.Cancelled && e.status !== ExpenseStatus.Rejected)
                        .reduce((s, e) => s + e.amountWithVat, 0);
                      const balance = cat.plannedBudget - actualSpent;
                      
                      return (
                        <tr key={cat.id}>
                          <td className="p-3 font-semibold text-slate-900">{cat.name}</td>
                          <td className="p-3 text-right font-mono">{cat.plannedBudget.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold text-slate-900 font-mono">{actualSpent.toLocaleString()}</td>
                          <td className={`p-3 text-right font-bold font-mono ${balance < 0 ? 'text-red-600' : 'text-indigo-600'}`}>
                            {balance.toLocaleString()}
                          </td>
                          <td className="p-3">
                            {cat.isAllowedGrant ? (
                              <span className="text-emerald-600 font-bold">✓ ნებადართულია</span>
                            ) : (
                              <span className="text-red-500 font-bold">✗ საოპერაციო (აკრძალულია)</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT VIEW 3: BY SUPPLIER */}
          {activeReport === 'by_supplier' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">ხარჯების ანგარიში მიმწოდებლების მიხედვით</h4>
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">მიმწოდებელი / კონტრაქტორი</th>
                      <th className="p-3">ტიპი</th>
                      <th className="p-3 font-mono">ს/კ ან პირადი ნომერი</th>
                      <th className="p-3 text-right">ხარჯების რაოდენობა</th>
                      <th className="p-3 text-right">ჯამური ბრუნვა (GEL)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {suppliers.map(sup => {
                      const supExpenses = expenses.filter(e => e.supplierId === sup.id);
                      const total = supExpenses.reduce((s, e) => s + e.amountWithVat, 0);
                      return (
                        <tr key={sup.id}>
                          <td className="p-3 font-bold text-slate-800">{sup.name}</td>
                          <td className="p-3 uppercase font-medium">{sup.type === 'company' ? 'შპს' : 'ფიზ. პირი'}</td>
                          <td className="p-3 font-mono">{sup.taxId}</td>
                          <td className="p-3 text-right">{supExpenses.length} შესყიდვა</td>
                          <td className="p-3 text-right font-black text-indigo-700">{total.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT VIEW 4: PAYMENTS REPORT */}
          {activeReport === 'payments' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">გადახდებისა და ტრანზაქციების რეესტრი</h4>
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">თარიღი</th>
                      <th className="p-3">მიმღები ორგანიზაცია</th>
                      <th className="p-3">გადარიცხვის დანიშნულება</th>
                      <th className="p-3 font-mono">TXN / საბანკო კოდი</th>
                      <th className="p-3 text-right">გადახდილი თანხა (GEL)</th>
                      <th className="p-3 text-center">მეთოდი</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {payments.map(p => (
                      <tr key={p.id}>
                        <td className="p-3 font-mono">{p.paymentDate}</td>
                        <td className="p-3 font-bold text-slate-800">{p.recipientName}</td>
                        <td className="p-3">{p.purpose}</td>
                        <td className="p-3 font-mono text-indigo-500">{p.bankTxNumber || 'N/A'}</td>
                        <td className="p-3 text-right font-bold text-emerald-600">{p.amount.toLocaleString()}</td>
                        <td className="p-3 text-center">{PAYMENT_METHOD_LABELS[p.paymentMethod] || p.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT VIEW 5: MISSING DOCUMENTS */}
          {activeReport === 'missing_docs' && (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800 leading-relaxed">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                საყურადღებოა: ქვემოთ ჩამოთვლილ ხარჯებს აკლიათ სახელმწიფო აუდიტისთვის სავალდებულო დოკუმენტები!
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">ხარჯის დასახელება</th>
                      <th className="p-3">მიმწოდებელი</th>
                      <th className="p-3">ხარჯის სტატუსი</th>
                      <th className="p-3">ნაკლული დოკუმენტების სია</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {expenses.map(e => {
                      const expenseDocs = documents.filter(d => d.expenseId === e.id && d.status === 'active');
                      const isIndividual = suppliers.find(s => s.id === e.supplierId)?.type === 'individual';
                      const missing: string[] = [];

                      if (!isIndividual) {
                        const hasInvoiceOrTaxDoc = expenseDocs.some(d => d.docType === 'invoice' || d.docType === 'tax_doc');
                        const hasContract = expenseDocs.some(d => d.docType === 'contract');
                        const hasAcceptance = expenseDocs.some(d => d.docType === 'acceptance_act');

                        if (!hasInvoiceOrTaxDoc) missing.push('საგადასახადო ფაქტურა/ზედნადები (RS.GE)');
                        if (!hasContract) missing.push('ხელშეკრულება');
                        if (!hasAcceptance) missing.push('მიღება-ჩაბარების აქტი');
                      } else {
                        const hasContract = expenseDocs.some(d => d.docType === 'contract');
                        const hasAcceptance = expenseDocs.some(d => d.docType === 'acceptance_act');
                        const hasReceipt = expenseDocs.some(d => d.docType === 'receipt') || payments.some(p => p.expenseId === e.id && p.status === 'approved');

                        if (!hasContract) missing.push('ხელშეკრულება');
                        if (!hasAcceptance) missing.push('მიღება-ჩაბარების აქტი');
                        if (!hasReceipt) missing.push('ბანკის გადარიცხვის ქვითარი');
                      }

                      if (missing.length === 0) return null;

                      return (
                        <tr key={e.id} className="bg-amber-50/10">
                          <td className="p-3 font-bold text-slate-900">{e.title}</td>
                          <td className="p-3">{suppliers.find(s => s.id === e.supplierId)?.name}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">{STATUS_LABELS[e.status] || e.status}</span>
                          </td>
                          <td className="p-3 text-red-600 font-semibold leading-relaxed">
                            {missing.join(', ')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT VIEW 6: RS.GE DOCUMENTS */}
          {activeReport === 'rs_ge' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">RS.GE ოფიციალური დოკუმენტების რეესტრი (ზედნადებები, ფაქტურები)</h4>
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">დოკუმენტის ტიპი</th>
                      <th className="p-3 font-mono">დოკუმენტის ნომერი</th>
                      <th className="p-3">თარიღი</th>
                      <th className="p-3">ფაილის დასახელება</th>
                      <th className="p-3 text-right">თანხა (GEL)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {documents.filter(d => d.docType === 'invoice' || d.docType === 'waybill' || d.docType === 'tax_doc').map(d => (
                      <tr key={d.id}>
                        <td className="p-3 uppercase font-bold text-slate-600">
                          {d.docType === 'invoice' ? 'ფაქტურა' : d.docType === 'waybill' ? 'ზედნადები' : 'საგადასახადო დოკუმენტი'}
                        </td>
                        <td className="p-3 font-mono text-indigo-600">{d.docNumber}</td>
                        <td className="p-3 font-mono">{d.docDate}</td>
                        <td className="p-3">{d.fileName}</td>
                        <td className="p-3 text-right font-black text-slate-900">{d.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT VIEW 7: INDIVIDUAL SERVICES */}
          {activeReport === 'individual_services' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">ფიზიკურ პირებთან გაფორმებული მომსახურებები (ხელოსნები)</h4>
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">ფიზიკური პირი</th>
                      <th className="p-3 font-mono">პირადი ნომერი</th>
                      <th className="p-3">სამუშაო / ხელშეკრულება</th>
                      <th className="p-3 text-right">დარიცხული</th>
                      <th className="p-3 text-right">საშემოსავლო (20%)</th>
                      <th className="p-3 text-right">გადასარიცხი</th>
                      <th className="p-3 text-center">დოკუმენტები</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {payrollList.map(p => (
                      <tr key={p.id}>
                        <td className="p-3 font-bold text-slate-800">{p.name}</td>
                        <td className="p-3 font-mono">{p.personalId}</td>
                        <td className="p-3">
                          <span className="font-semibold block">{p.workDescription}</span>
                          <span className="text-[10px] text-slate-400 font-mono">CTR: #{p.contractNumber}</span>
                        </td>
                        <td className="p-3 text-right font-mono">{p.grossAmount.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-amber-600">{p.taxesAmount.toLocaleString()}</td>
                        <td className="p-3 text-right font-black text-indigo-700 font-mono">{p.netAmount.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full inline-block">
                            {p.hasAcceptanceAct ? 'აქტი ატვირთულია' : 'აკლია აქტი'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT VIEW 8: CONTRACTS REGISTRY */}
          {activeReport === 'contracts_registry' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">ხელშეკრულებების ერთიან რეესტრი (Contracts Registry)</h4>
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">ხელშეკრულების ნომერი</th>
                      <th className="p-3">თარიღი</th>
                      <th className="p-3">მიმწოდებელი / კონტრაქტორი</th>
                      <th className="p-3">დაკავშირებული ხარჯი</th>
                      <th className="p-3 text-right">ღირებულება დღგ-ით</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {documents.filter(d => d.docType === 'contract' && d.status === 'active').map(d => {
                      const matchedExpense = expenses.find(e => e.id === d.expenseId);
                      const supplier = matchedExpense ? suppliers.find(s => s.id === matchedExpense.supplierId) : null;
                      return (
                        <tr key={d.id}>
                          <td className="p-3 font-bold text-indigo-600 font-mono">{d.docNumber}</td>
                          <td className="p-3 font-mono">{d.docDate}</td>
                          <td className="p-3 font-semibold text-slate-700">{supplier ? supplier.name : 'N/A'}</td>
                          <td className="p-3">{matchedExpense ? matchedExpense.title : 'N/A'}</td>
                          <td className="p-3 text-right font-black text-slate-900 font-mono">{d.amount.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT VIEW 9: ACCEPTANCE REGISTRY */}
          {activeReport === 'acceptance_registry' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">მიღება-ჩაბარების აქტების ერთიან რეესტრი</h4>
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">მიღება-ჩაბარების ნომერი</th>
                      <th className="p-3">თარიღი</th>
                      <th className="p-3">ხარჯის დასახელება</th>
                      <th className="p-3">ატვირთა მომხმარებელმა</th>
                      <th className="p-3 text-right">დადასტურებული თანხა</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {documents.filter(d => d.docType === 'acceptance_act' && d.status === 'active').map(d => {
                      const matchedExpense = expenses.find(e => e.id === d.expenseId);
                      return (
                        <tr key={d.id}>
                          <td className="p-3 font-bold text-slate-800 font-mono">{d.docNumber}</td>
                          <td className="p-3 font-mono">{d.docDate}</td>
                          <td className="p-3">{matchedExpense ? matchedExpense.title : 'N/A'}</td>
                          <td className="p-3">{d.uploadedBy}</td>
                          <td className="p-3 text-right font-black text-slate-900 font-mono">{d.amount.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT VIEW 10: BUDGET UTILIZATION */}
          {activeReport === 'budget_utilization' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">50,000 GEL საგრანტო ბიუჯეტის გამოყენების ანგარიშგება</h4>
              <p className="text-slate-500">ბიუჯეტის გამოყენების მაკრო-ანალიზი და პროცენტული გადანაწილება „აწარმოე საქართველოს“ მოთხოვნებით:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block mb-1">ჯამური ბიუჯეტი:</span>
                  <span className="text-lg font-black text-slate-900">50,000.00 GEL</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block mb-1">რეალური ათვისება:</span>
                  <span className="text-lg font-black text-emerald-600">{totalSpentAll.toLocaleString()} GEL ({((totalSpentAll/50000)*100).toFixed(1)}%)</span>
                </div>
              </div>

              <div className="space-y-3 pt-3">
                <span className="font-bold text-slate-800 block">ბიუჯეტის ათვისება კატეგორიების მიხედვით (პროცენტულად):</span>
                <div className="space-y-2">
                  {categories.map(cat => {
                    const spent = expenses
                      .filter(e => e.categoryId === cat.id && e.status !== ExpenseStatus.Cancelled && e.status !== ExpenseStatus.Rejected)
                      .reduce((s, e) => s + e.amountWithVat, 0);
                    const percent = cat.plannedBudget > 0 ? (spent / cat.plannedBudget) * 100 : 0;
                    return (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span>{cat.name}</span>
                          <span className="font-bold">{spent.toLocaleString()} / {cat.plannedBudget.toLocaleString()} GEL ({percent.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${percent > 100 ? 'bg-red-500' : 'bg-indigo-600'}`} 
                            style={{ width: `${Math.min(100, percent)}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* REPORT VIEW 11: FINAL PROJECT CLOSURE REPORT */}
          {activeReport === 'final_grant_report' && (
            <div className="space-y-6 text-xs text-slate-700 leading-relaxed font-sans">
              <div className="text-center space-y-2 border-b border-slate-200 pb-6">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">საგრანტო ხელშეკრულების დასკვნითი ანგარიში</span>
                <h4 className="text-base font-black text-slate-900">პროექტის დასრულებისა და ბიუჯეტის ათვისების საბოლოო დეკლარაცია</h4>
                <p className="text-xs text-slate-400">წარედგინება: „აწარმოე საქართველოში“ მონიტორინგის დეპარტამენტს</p>
              </div>

              <div className="space-y-4">
                <p>
                  წინამდებარე ანგარიში ადასტურებს, რომ საგრანტო ხელშეკრულების ფარგლებში გამოყოფილი ბიუჯეტი (<strong className="text-slate-900">50,000 GEL</strong>) სრულად და მიზნობრივად იქნა ათვისებული ავტომანქანის თვითმომსახურების სამრეცხაოს მოწყობისა და მშენებლობის მიზნებისთვის.
                </p>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block">მიღებული ტრანშების ჯამი:</span>
                    <strong className="text-slate-900">{tranches.reduce((s,t)=>s+t.amount,0).toLocaleString()} GEL</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">სრულად დადასტურებული ხარჯი:</span>
                    <strong className="text-emerald-600">{totalSpentAll.toLocaleString()} GEL</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-800 block">ძირითადი მიღწევები და ათვისება:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>დასრულდა სამრეცხაო მოედნის ბეტონის იატაკის დასხმა და არმირება (12,000 GEL).</li>
                    <li>შესყიდულ იქნა იტალიური მაღალი წნევის Hawk-ის აპარატურა 3 ბოქსისთვის (15,000 GEL).</li>
                    <li>წარმატებით დამონტაჟდა წყლის ავტომატური დამარბილებელი Osmosis ფილტრაციის სისტემა (5,000 GEL).</li>
                    <li>ხელოსნებისა და მუშახელის ანაზღაურება დაიფარა ყველა კანონმდებლობით გათვალისწინებული საშემოსავლო გადასახადების დაცვით.</li>
                  </ul>
                </div>

                <div className="pt-8 flex justify-between items-center text-slate-500 text-[10px] border-t border-slate-100">
                  <div className="text-center space-y-1">
                    <div className="w-32 border-b border-slate-300 mx-auto" />
                    <span>პროექტის ხელმძღვანელი</span>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="w-32 border-b border-slate-300 mx-auto" />
                    <span>მთავარი ბუღალტერი</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
