/**
 * კონფიგურაცია და ქართული ლეიბლები.
 */
import { UserRole, ExpenseStatus, PaymentMethod, SupplierType } from '../types';

export const DEFAULT_BUDGET = 50000;

export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'cat-admin', name: 'ადმინისტრაცია', plannedBudget: 0, isAllowedGrant: false },
  { id: 'cat-land', name: 'მიწის/ტერიტორიის მომზადება', plannedBudget: 5000, isAllowedGrant: true },
  { id: 'cat-construction', name: 'სამშენებლო სამუშაოები', plannedBudget: 8000, isAllowedGrant: true },
  { id: 'cat-concrete', name: 'ბეტონი, იატაკი, სადრენაჟო სამუშაოები', plannedBudget: 12000, isAllowedGrant: true },
  { id: 'cat-water', name: 'წყლის სისტემა', plannedBudget: 3000, isAllowedGrant: true },
  { id: 'cat-electricity', name: 'ელექტროობა', plannedBudget: 2500, isAllowedGrant: true },
  { id: 'cat-sewer', name: 'კანალიზაცია', plannedBudget: 3000, isAllowedGrant: true },
  { id: 'cat-metal', name: 'მეტალოკონსტრუქცია', plannedBudget: 6000, isAllowedGrant: true },
  { id: 'cat-roof', name: 'გადახურვა', plannedBudget: 2000, isAllowedGrant: true },
  { id: 'cat-equipment', name: 'თვითმომსახურების სამრეცხაოს აპარატურა', plannedBudget: 15000, isAllowedGrant: true },
  { id: 'cat-pressure', name: 'მაღალი წნევის აპარატები', plannedBudget: 8000, isAllowedGrant: true },
  { id: 'cat-vacuum', name: 'მტვერსასრუტები', plannedBudget: 3500, isAllowedGrant: true },
  { id: 'cat-payment-system', name: 'მონეტების/ბარათის გადახდის სისტემა', plannedBudget: 4000, isAllowedGrant: true },
  { id: 'cat-filtration', name: 'წყლის ფილტრაცია/დამარბილებელი სისტემა', plannedBudget: 5000, isAllowedGrant: true },
  { id: 'cat-chemicals', name: 'ქიმია და სარეცხი საშუალებები', plannedBudget: 1500, isAllowedGrant: false },
  { id: 'cat-branding', name: 'აბრების/ბრენდინგის ხარჯები', plannedBudget: 2500, isAllowedGrant: true },
  { id: 'cat-security', name: 'ვიდეოკამერები და უსაფრთხოება', plannedBudget: 2000, isAllowedGrant: true },
  { id: 'cat-pos', name: 'POS/სალარო/გადახდის მოწყობილობები', plannedBudget: 1200, isAllowedGrant: true },
  { id: 'cat-software', name: 'პროგრამული უზრუნველყოფა', plannedBudget: 1000, isAllowedGrant: true },
  { id: 'cat-transport', name: 'ტრანსპორტირება', plannedBudget: 1000, isAllowedGrant: true },
  { id: 'cat-installation', name: 'მონტაჟი', plannedBudget: 3000, isAllowedGrant: true },
  { id: 'cat-legal', name: 'იურიდიული მომსახურება', plannedBudget: 800, isAllowedGrant: true },
  { id: 'cat-accounting', name: 'ბუღალტრული მომსახურება', plannedBudget: 1500, isAllowedGrant: true },
  { id: 'cat-bank-fees', name: 'საბანკო საკომისიოები', plannedBudget: 300, isAllowedGrant: true },
  { id: 'cat-salary', name: 'ხელფასები', plannedBudget: 4000, isAllowedGrant: true },
  { id: 'cat-individual-service', name: 'ფიზიკურ პირთან გაფორმებული მომსახურება', plannedBudget: 3500, isAllowedGrant: true },
  { id: 'cat-contingency', name: 'გაუთვალისწინებელი ხარჯი', plannedBudget: 2000, isAllowedGrant: true },
  { id: 'cat-other', name: 'სხვა', plannedBudget: 1000, isAllowedGrant: true },
];

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
