/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Database, Cpu, ShieldCheck, Terminal, HelpCircle } from 'lucide-react';

export default function TechDocsPanel() {
  const [activeTab, setActiveTab] = useState<'erd' | 'api' | 'rules' | 'test' | 'manuals'>('erd');

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="tech-docs-container">
      <div className="border-b border-slate-100 bg-slate-50/50 p-6">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Terminal className="h-5 w-5 text-indigo-600" />
          ტექნიკური დოკუმენტაცია & არქიტექტურა (ERD & Manuals)
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          პროექტის სრული მონაცემთა ბაზის სტრუქტურა, API ენდპოინტები, ბიზნეს-ლოგიკა და მომხმარებლის სახელმძღვანელოები.
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setActiveTab('erd')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'erd'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            მონაცემთა ბაზა (ERD & Tables)
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'api'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            API ენდპოინტები & ფორმულები
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'rules'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            ვალიდაციის წესები & როლები
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'test'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            ტესტირების სცენარები
          </button>
          <button
            onClick={() => setActiveTab('manuals')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'manuals'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            მფლობელისა და ბუღალტრის ინსტრუქცია
          </button>
        </div>
      </div>

      <div className="p-6 overflow-y-auto max-h-[600px] font-sans">
        {activeTab === 'erd' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">1. მონაცემთა ბაზის ERD (ურთიერთობის სქემა)</h3>
              <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                {`[budget_settings] 1 ------ * [tranches]
[tranches]        1 ------ * [expenses] (optional)
[categories]      1 ------ * [expenses]
[suppliers]       1 ------ * [expenses]
[expenses]        1 ------ * [payments]
[expenses]        1 ------ * [documents]
[expenses]        1 ------ * [comments]
[expenses]        1 ------ * [status_history]
[users]           1 ------ * [audit_logs]
[users]           1 ------ * [comments]
[tax_settings]    (Global settings table)
[payroll_or_individual_services] (Separate registry tied to suppliers & documents)`}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">2. ცხრილების დეტალური სტრუქტურა (PostgreSQL/SQL)</h3>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="font-semibold text-slate-700 text-xs font-mono">1. users & roles</h4>
                  <p className="text-xs text-slate-500 mt-1">აკონტროლებს ავტორიზაციას და წვდომის უფლებებს.</p>
                  <pre className="text-[11px] font-mono text-indigo-900 mt-2 bg-indigo-50/30 p-2.5 rounded border border-indigo-100/50 overflow-x-auto">
{`CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'accountant', 'manager', 'viewer', 'uploader')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
                  </pre>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="font-semibold text-slate-700 text-xs font-mono">2. expenses (ხარჯები)</h4>
                  <p className="text-xs text-slate-500 mt-1">ინახავს თითოეული გაწეული ან დაგეგმილი ხარჯის დეტალებს.</p>
                  <pre className="text-[11px] font-mono text-indigo-900 mt-2 bg-indigo-50/30 p-2.5 rounded border border-indigo-100/50 overflow-x-auto">
{`CREATE TABLE expenses (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id VARCHAR(50) REFERENCES categories(id),
  supplier_id VARCHAR(50) REFERENCES suppliers(id),
  tranche_id VARCHAR(50) REFERENCES tranches(id),
  invoice_number VARCHAR(100),
  invoice_date DATE,
  amount_no_vat DECIMAL(15, 2) NOT NULL,
  vat DECIMAL(15, 2) DEFAULT 0.00,
  amount_with_vat DECIMAL(15, 2) NOT NULL,
  responsible_person VARCHAR(100) NOT NULL,
  project_stage VARCHAR(100),
  internal_comment TEXT,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50) REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(50) REFERENCES users(id)
);`}
                  </pre>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="font-semibold text-slate-700 text-xs font-mono">3. payments (გადახდები)</h4>
                  <p className="text-xs text-slate-500 mt-1">ერთ ხარჯზე შეიძლება არსებობდეს მრავალი გადახდა.</p>
                  <pre className="text-[11px] font-mono text-indigo-900 mt-2 bg-indigo-50/30 p-2.5 rounded border border-indigo-100/50 overflow-x-auto">
{`CREATE TABLE payments (
  id VARCHAR(50) PRIMARY KEY,
  expense_id VARCHAR(50) REFERENCES expenses(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  payment_method VARCHAR(20) CHECK (payment_method IN ('bank', 'cash', 'pos', 'other')),
  payer_account VARCHAR(100),
  recipient_name VARCHAR(255) NOT NULL,
  purpose TEXT,
  bank_tx_number VARCHAR(100),
  fee DECIMAL(10, 2) DEFAULT 0.00,
  receipt_file VARCHAR(255),
  comment TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
                  </pre>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="font-semibold text-slate-700 text-xs font-mono">4. documents (დოკუმენტები)</h4>
                  <p className="text-xs text-slate-500 mt-1">ინახავს RS.GE და სხვა ატვირთული ფაილების ვერსიებს და ჰეშებს.</p>
                  <pre className="text-[11px] font-mono text-indigo-900 mt-2 bg-indigo-50/30 p-2.5 rounded border border-indigo-100/50 overflow-x-auto">
{`CREATE TABLE documents (
  id VARCHAR(50) PRIMARY KEY,
  expense_id VARCHAR(50) REFERENCES expenses(id) ON DELETE CASCADE,
  doc_type VARCHAR(50) NOT NULL,
  doc_number VARCHAR(100) NOT NULL,
  doc_date DATE NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size VARCHAR(50),
  checksum VARCHAR(64) NOT NULL, -- ფაილის ავთენტურობისთვის
  version INT DEFAULT 1,
  uploaded_by VARCHAR(50) REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">1. API ენდპოინტები (REST API დიზაინი)</h3>
              <p className="text-xs text-slate-500 mb-3">მომავალი სერვერული ინტეგრაციისთვის გათვალისწინებული ძირითადი მარშრუტები:</p>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 font-mono text-xs flex justify-between items-center">
                  <span><span className="text-emerald-600 font-bold">GET</span> /api/expenses</span>
                  <span className="text-slate-500">ხარჯების სიის წაკითხვა ფილტრებით</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 font-mono text-xs flex justify-between items-center">
                  <span><span className="text-blue-600 font-bold">POST</span> /api/expenses</span>
                  <span className="text-slate-500">ახალი ხარჯის შექმნა + ვალიდაცია</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 font-mono text-xs flex justify-between items-center">
                  <span><span className="text-amber-600 font-bold">PUT</span> /api/expenses/:id</span>
                  <span className="text-slate-500">ხარჯის განახლება & ისტორიის ჩაწერა</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 font-mono text-xs flex justify-between items-center">
                  <span><span className="text-emerald-600 font-bold">GET</span> /api/dashboard/stats</span>
                  <span className="text-slate-500">50,000 ლარიანი ბიუჯეტის გამოთვლები</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 font-mono text-xs flex justify-between items-center">
                  <span><span className="text-blue-600 font-bold">POST</span> /api/documents/upload</span>
                  <span className="text-slate-500">დოკუმენტის ატვირთვა, Checksum-ის გენერაცია</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 font-mono text-xs flex justify-between items-center">
                  <span><span className="text-blue-600 font-bold">POST</span> /api/payroll/calculate</span>
                  <span className="text-slate-500">ფიზიკური პირის გადასახადების დაანგარიშება</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">2. ბიუჯეტის გამოთვლის ფორმულები</h3>
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs leading-relaxed text-slate-700">
                <div>
                  <span className="font-semibold text-slate-900 block mb-1">ა) ფაქტობრივი დარჩენილი თანხა:</span>
                  <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-indigo-900">დარჩენილი ბიუჯეტი = 50,000 GEL - Sum(ყველა გადახდილი ხარჯი)</code>
                  <p className="text-slate-500 mt-1">ითვალისწინებს რეალურად განხორციელებულ საბანკო გადარიცხვებს.</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block mb-1">ბ) პროგნოზული დარჩენილი თანხა:</span>
                  <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-indigo-900">პროგნოზი = 50,000 GEL - Sum(გადახდილი ხარჯები) - Sum(დაგეგმილი/ხელშეკრულებით აღებული ხარჯები)</code>
                  <p className="text-slate-500 mt-1">გვიჩვენებს, რა თანხა დაგვრჩება რეალურად, თუ ყველა ხელმოწერილ ვალდებულებას გადავიხდით.</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block mb-1">გ) ფიზიკური პირის საშემოსავლო გადასახადი (20%):</span>
                  <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-indigo-900">საშემოსავლო = Gross * 20%</code>
                  <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-indigo-900 ml-2">Net = Gross - საშემოსავლო</code>
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block mb-1">დ) საპენსიო დანაზოგის გამოთვლა (2% დასაქმებული, 2% დამსაქმებელი):</span>
                  <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-indigo-900">Employee_Pension = Gross * 2%</code>
                  <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-indigo-900 ml-2">Employer_Pension = Gross * 2%</code>
                  <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-indigo-900 ml-2">Net_With_Pension = Gross - საშემოსავლო(20%) - Employee_Pension(2%)</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">1. დოკუმენტების სავალდებულო Checklist და ვალიდაცია</h3>
              <p className="text-xs text-slate-500 mb-3">სისტემა ავტომატურად ახორციელებს შემდეგ შემოწმებებს ყოველ ხარჯზე:</p>
              <ul className="space-y-2 text-xs text-slate-700 list-disc list-inside">
                <li><strong className="text-slate-900">დოკუმენტის თარიღის ვალიდაცია:</strong> თუ ხარჯის/დოკუმენტის თარიღი არის გრანტის ტრანშის მიღების თარიღამდე, სისტემა აჩვენებს წითელ გაფრთხილებას.</li>
                <li><strong className="text-slate-900">თანხების თანხვედრა:</strong> სისტემა ამოწმებს, უდრის თუ არა გადახდილი თანხების ჯამი ხარჯის მთლიან თანხას.</li>
                <li><strong className="text-slate-900">მინიმალური სავალდებულო დოკუმენტები:</strong> იურიდიული პირისთვის აუცილებელია <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-semibold">ზედნადები/ფაქტურა</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-semibold">ხელშეკრულება</code> და <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-semibold">მიღება-ჩაბარება</code>. ფიზიკური პირისთვის აუცილებელია <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-semibold">ხელშეკრულება</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-semibold">მიღება-ჩაბარება</code> და <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-semibold">საგადახდო ქვითარი</code>. სანამ ეს დოკუმენტები არ აიტვირთება, ხარჯს ენიჭება სტატუსი: <em>"Documents Missing"</em>.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">2. როლებისა და უფლებამოსილებების მატრიცა</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                      <th className="p-2.5">ქმედება / როლი</th>
                      <th className="p-2.5">Admin (მფლობელი)</th>
                      <th className="p-2.5">Accountant (ბუღალტერი)</th>
                      <th className="p-2.5">Manager (მენეჯერი)</th>
                      <th className="p-2.5">Viewer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-2.5 font-medium text-slate-900">ხარჯის დამატება / შეცვლა</td>
                      <td className="p-2.5 text-emerald-600">✓ კი</td>
                      <td className="p-2.5 text-rose-500">✗ არა</td>
                      <td className="p-2.5 text-emerald-600">✓ კი</td>
                      <td className="p-2.5 text-rose-500">✗ არა</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-900">ხარჯის დამტკიცება / უარყოფა</td>
                      <td className="p-2.5 text-emerald-600">✓ კი</td>
                      <td className="p-2.5 text-rose-500">✗ არა</td>
                      <td className="p-2.5 text-rose-500">✗ არა</td>
                      <td className="p-2.5 text-rose-500">✗ არა</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-900">დოკუმენტების შემოწმება & კომენტარები</td>
                      <td className="p-2.5 text-emerald-600">✓ კი</td>
                      <td className="p-2.5 text-emerald-600">✓ კი</td>
                      <td className="p-2.5 text-rose-500">✗ არა</td>
                      <td className="p-2.5 text-rose-500">✗ არა</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-900">გადასახადების განაკვეთების შეცვლა</td>
                      <td className="p-2.5 text-emerald-600">✓ კი</td>
                      <td className="p-2.5 text-emerald-600">✓ კი</td>
                      <td className="p-2.5 text-rose-500">✗ არა</td>
                      <td className="p-2.5 text-rose-500">✗ არა</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-900">ანგარიშების ექსპორტი (Excel/PDF)</td>
                      <td className="p-2.5 text-emerald-600">✓ კი</td>
                      <td className="p-2.5 text-emerald-600">✓ კი</td>
                      <td className="p-2.5 text-emerald-600">✓ კი</td>
                      <td className="p-2.5 text-slate-500">ნახვა მხოლოდ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'test' && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">აუდიტორული ტესტირების სცენარები (QA Scenarios)</h3>
            
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <strong className="text-slate-900 block mb-1">სცენარი 1: ტრანშამდე თარიღის ვალიდაცია</strong>
              <p className="text-slate-500">
                <strong>მოქმედება:</strong> მომხმარებელი ამატებს ხარჯს 2026 წლის 5 მაისის თარიღით. პირველი ტრანში მიღებულია 2026 წლის 10 მაისს.<br />
                <strong>მოსალოდნელი შედეგი:</strong> სისტემა წარმატებით ინახავს ხარჯს, თუმცა დაფაზე და ხარჯის ბარათზე გამოაქვს წითელი შეტყობინება: <em>"დოკუმენტის თარიღი ტრანშის თარიღამდეა — გადაამოწმეთ ბუღალტერთან."</em>
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <strong className="text-slate-900 block mb-1">სცენარი 2: დოკუმენტაციის არასრულყოფილების შემოწმება</strong>
              <p className="text-slate-500">
                <strong>მოქმედება:</strong> მენეჯერი ამატებს ხარჯს „მაღალი წნევის აპარატურა“ (15,000 GEL), მაგრამ ტვირთავს მხოლოდ საგადასახადო ანგარიშ-ფაქტურას და ხელშეკრულებას (აკლია მიღება-ჩაბარება და საგადახდო დავალება).<br />
                <strong>მოსალოდნელი შედეგი:</strong> სისტემა ავტომატურად უცვლის ხარჯს სტატუსს <em>"Documents Missing"</em> და არ აძლევს საშუალებას მონიშნოს იგი როგორც <em>"Ready for Reporting"</em> (ანგარიშგებისთვის მზადაა), სანამ ყველა სავალდებულო ფაილი არ აიტვირთება.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <strong className="text-slate-900 block mb-1">სცენარი 3: ბუღალტრის მიერ ხარჯის დაბრუნება შესასწორებლად</strong>
              <p className="text-slate-500">
                <strong>მოქმედება:</strong> ბუღალტერი ათვალიერებს ხარჯს, აღმოაჩენს, რომ საგადახდო ქვითარი ბუნდოვანია. იგი წერს კომენტარს და ხარჯს ანიჭებს სტატუსს <em>"Needs Correction"</em>.<br />
                <strong>მოსალოდნელი შედეგი:</strong> მენეჯერი და დაფა მომენტალურად იღებენ ინფორმაციას დაბრუნებულ ხარჯზე, ხოლო ცვლილებების ისტორიაში (audit_logs) იწერება ბუღალტრის სახელი, თარიღი და ძველი/ახალი სტატუსის მნიშვნელობა.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'manuals' && (
          <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">✦ ადმინისტრატორის/მფლობელის სახელმძღვანელო</h3>
              <ol className="list-decimal list-inside space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <li><strong className="text-slate-900">ბიუჯეტის მონიტორინგი:</strong> მთავარ დაფაზე (Dashboard) აკონტროლეთ რეალური, პროგნოზული და თავისუფალი ბიუჯეტის დარჩენილი ნაწილი 50,000 ლარიდან.</li>
                <li><strong className="text-slate-900">მომხმარებელთა როლების მართვა:</strong> ზედა მარჯვენა კუთხიდან შეგიძლიათ ნებისმიერ დროს გადაერთოთ სხვადასხვა როლზე (Admin, Accountant, Manager) იმის საჩვენებლად, თუ როგორ იცვლება ხელმისაწვდომი ინტერფეისი.</li>
                <li><strong className="text-slate-900">საბოლოო დამტკიცება:</strong> მხოლოდ ადმინისტრატორს აქვს უფლება მიანიჭოს ხარჯს სტატუსი <code className="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-semibold">Approved</code>, რაც საბოლოოდ აკლდება გრანტის დამტკიცებულ ბიუჯეტს.</li>
              </ol>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">✦ ბუღალტრის გამოყენების სახელმძღვანელო</h3>
              <ol className="list-decimal list-inside space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <li><strong className="text-slate-900">დასამოწმებელი ხარჯები:</strong> სპეციალურ "ბუღალტერიის" გვერდზე იხილავთ მხოლოდ იმ ხარჯებს, რომლებიც მოითხოვენ თქვენს ყურადღებას (რომლებსაც აკლიათ დოკუმენტები, ან აქვთ შეუსაბამობა გადახდებში).</li>
                <li><strong className="text-slate-900">კომენტარები და შენიშვნები:</strong> თითოეულ ხარჯზე შეგიძლიათ დატოვოთ ოფიციალური კომენტარი, რომელიც გამოუჩნდება მენეჯერს კორექტირებისთვის.</li>
                <li><strong className="text-slate-900">ანგარიშგება:</strong> "რეპორტების" გვერდიდან შეგიძლიათ ექსპორტირება გაუკეთოთ Excel ანგარიშს ან ჩამოტვირთოთ ოფიციალური PDF ანგარიში „აწარმოე საქართველოში“ ფორმატით, რომელიც მზად არის გრანტის მონიტორინგის ოფიცერისთვის წარსადგენად.</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
