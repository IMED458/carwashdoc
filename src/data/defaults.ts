/**
 * კონფიგურაცია და ქართული ლეიბლები.
 */
import { UserRole, ExpenseStatus, PaymentMethod, SupplierType } from '../types';

export const DEFAULT_BUDGET = 50000;

export const ROLE_DEFS: { id: UserRole; name: string; desc: string }[] = [
  { id: 'admin', name: 'ადმინი', desc: 'სრული წვდომა — ყველაფრის მართვა და მომხმარებლები.' },
  { id: 'accountant', name: 'ბუღალტერი', desc: 'გადახდების, დოკუმენტების და ანგარიშგების შემოწმება.' },
  { id: 'manager', name: 'მენეჯერი', desc: 'ხარჯების, მიმწოდებლების და გადახდების დამატება/რედაქტირება.' },
  { id: 'uploader', name: 'ამტვირთავი', desc: 'დოკუმენტების ატვირთვა და ხარჯებზე მიბმა.' },
  { id: 'viewer', name: 'მნახველი', desc: 'მხოლოდ ნახვა, რედაქტირების გარეშე.' },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'ადმინი',
  accountant: 'ბუღალტერი',
  manager: 'მენეჯერი',
  uploader: 'ამტვირთავი',
  viewer: 'მნახველი',
};

export const STATUS_LABELS: Record<ExpenseStatus, string> = {
  [ExpenseStatus.Draft]: 'დრაფტი',
  [ExpenseStatus.Planned]: 'დაგეგმილი',
  [ExpenseStatus.ContractSigned]: 'ხელშეკრულება გაფორმებულია',
  [ExpenseStatus.WorkInProgress]: 'სამუშაო მიმდინარეობს',
  [ExpenseStatus.Delivered]: 'ჩაბარებულია',
  [ExpenseStatus.DocumentsMissing]: 'დოკუმენტები აკლია',
  [ExpenseStatus.PaymentPending]: 'გადახდის მოლოდინი',
  [ExpenseStatus.Paid]: 'გადახდილია',
  [ExpenseStatus.SentToAccountant]: 'გაგზავნილია ბუღალტერთან',
  [ExpenseStatus.AccountantReview]: 'ბუღალტრის შემოწმება',
  [ExpenseStatus.NeedsCorrection]: 'საჭიროა კორექცია',
  [ExpenseStatus.ReadyForReporting]: 'მზადაა ანგარიშგებისთვის',
  [ExpenseStatus.UploadedToRS]: 'ატვირთულია RS/პორტალზე',
  [ExpenseStatus.Approved]: 'დამტკიცებული',
  [ExpenseStatus.Rejected]: 'უარყოფილი',
  [ExpenseStatus.Cancelled]: 'გაუქმებული',
};

export const STATUS_STYLES: Record<ExpenseStatus, string> = {
  [ExpenseStatus.Draft]: 'bg-slate-100 text-slate-600',
  [ExpenseStatus.Planned]: 'bg-blue-50 text-blue-600',
  [ExpenseStatus.ContractSigned]: 'bg-indigo-50 text-indigo-600',
  [ExpenseStatus.WorkInProgress]: 'bg-amber-50 text-amber-700',
  [ExpenseStatus.Delivered]: 'bg-cyan-50 text-cyan-700',
  [ExpenseStatus.DocumentsMissing]: 'bg-orange-50 text-orange-700',
  [ExpenseStatus.PaymentPending]: 'bg-yellow-50 text-yellow-700',
  [ExpenseStatus.Paid]: 'bg-emerald-50 text-emerald-600',
  [ExpenseStatus.SentToAccountant]: 'bg-violet-50 text-violet-700',
  [ExpenseStatus.AccountantReview]: 'bg-purple-50 text-purple-700',
  [ExpenseStatus.NeedsCorrection]: 'bg-red-50 text-red-600',
  [ExpenseStatus.ReadyForReporting]: 'bg-teal-50 text-teal-700',
  [ExpenseStatus.UploadedToRS]: 'bg-sky-50 text-sky-700',
  [ExpenseStatus.Approved]: 'bg-green-50 text-green-700',
  [ExpenseStatus.Rejected]: 'bg-rose-50 text-rose-700',
  [ExpenseStatus.Cancelled]: 'bg-slate-100 text-slate-500',
};

export const SUPPLIER_TYPE_LABELS: Record<SupplierType, string> = {
  company: 'იურიდიული პირი',
  entrepreneur: 'ინდ. მეწარმე',
  individual: 'ფიზიკური პირი',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank: 'ბანკი',
  cash: 'ნაღდი',
  card: 'ბარათი',
  pos: 'POS',
  other: 'სხვა',
};

/** რედაქტირების უფლება — ადმინი და მენეჯერი. */
export const canEdit = (role: UserRole): boolean =>
  role === 'admin' || role === 'manager' || role === 'accountant';
